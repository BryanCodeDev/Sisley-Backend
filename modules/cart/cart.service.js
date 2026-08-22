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

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  getCartTotal,
};
