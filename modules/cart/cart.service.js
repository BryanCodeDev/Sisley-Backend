const cartRepository = require('./cart.repository');
const productRepository = require('../products/product.repository');
const { getPool } = require('../../database/connection');

async function getCart(customerId, sessionId) {
  let cart = await cartRepository.findActiveCartByCustomerOrSession(customerId, sessionId);

  if (!cart) {
    cart = await cartRepository.createCart({ customerId, sessionId });
  }

  return cart;
}

async function addItem(customerId, sessionId, { variantId, quantity }) {
  if (!variantId || !quantity || quantity <= 0) {
    throw new Error('Datos de item inválidos');
  }

  const variant = await productRepository.findVariantById(variantId);
  if (!variant) {
    throw new Error('Variante no encontrada');
  }
  if (variant.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  const cart = await getCart(customerId, sessionId);
  const itemId = await cartRepository.addOrUpdateItem(cart.id, variantId, quantity, variant.price);

  return getCart(customerId, sessionId);
}

async function updateItemQuantity(customerId, sessionId, itemId, quantity) {
  if (!quantity || quantity <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  const cart = await getCart(customerId, sessionId);
  const pool = getPool();
  const [itemRows] = await pool.query(
    'SELECT variant_id FROM cart_items WHERE id = ? AND cart_id = ?',
    [itemId, cart.id]
  );

  if (!itemRows[0]) {
    throw new Error('Item no encontrado en el carrito');
  }

  const variantId = itemRows[0].variant_id;
  const variant = await productRepository.findVariantById(variantId);

  if (!variant) {
    throw new Error('Variante no encontrada');
  }

  if (variant.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [quantity, itemId, cart.id]);

  return getCart(customerId, sessionId);
}

async function removeItem(customerId, sessionId, itemId) {
  const cart = await getCart(customerId, sessionId);
  await cartRepository.removeItem(cart.id, itemId);
  return getCart(customerId, sessionId);
}

async function getCartTotal(cartId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT SUM(quantity * unit_price) AS total FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
  return rows[0] ? Number(rows[0].total) : 0;
}

async function mergeSessionCartIntoCustomer(sessionId, customerId) {
  if (!sessionId || !customerId) return null;

  const sessionCart = await cartRepository.findActiveCartByCustomerOrSession(null, sessionId);
  const customerCart = await cartRepository.findActiveCartByCustomerOrSession(customerId, null);

  if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
    return customerCart;
  }

  if (!customerCart) {
    await cartRepository.updateCartCustomer(sessionCart.id, customerId);
    return cartRepository.getCartByCustomerId(customerId);
  }

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of sessionCart.items) {
      const [existingRows] = await connection.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
        [customerCart.id, item.variantId]
      );

      if (existingRows[0]) {
        const newQuantity = existingRows[0].quantity + item.quantity;
        await connection.query(
          'UPDATE cart_items SET quantity = ?, unit_price = ? WHERE id = ?',
          [newQuantity, item.unitPrice, existingRows[0].id]
        );
      } else {
        await connection.query(
          'INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [customerCart.id, item.variantId, item.quantity, item.unitPrice]
        );
      }
    }

    await connection.query("UPDATE carts SET status = 'converted' WHERE id = ?", [sessionCart.id]);
    await connection.commit();
    return cartRepository.getCartByCustomerId(customerId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  getCartTotal,
  mergeSessionCartIntoCustomer,
};
