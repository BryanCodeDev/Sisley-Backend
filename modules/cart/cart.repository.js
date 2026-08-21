const { getPool } = require('../../database/connection');

const mapCartRow = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  sessionId: row.session_id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapItemRow = (row) => ({
  id: row.id,
  cartId: row.cart_id,
  variantId: row.variant_id,
  quantity: parseInt(row.quantity, 10),
  unitPrice: Number(row.unit_price),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function getCartBySessionId(sessionId) {
  const pool = getPool();
  const [cartRows] = await pool.query(
    'SELECT * FROM carts WHERE session_id = ? AND status = ? LIMIT 1',
    [sessionId, 'active']
  );

  if (!cartRows[0]) return null;

  const cart = mapCartRow(cartRows[0]);
  const [itemRows] = await pool.query(
    `SELECT ci.*, pv.product_id, p.name AS product_name, pv.sku, pv.color, pv.size, pv.price AS variant_price
     FROM cart_items ci
     JOIN product_variants pv ON ci.variant_id = pv.id
     JOIN products p ON pv.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );

  cart.items = itemRows.map((row) => ({
    ...mapItemRow(row),
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    color: row.color,
    size: row.size,
    variantPrice: Number(row.variant_price),
  }));

  return cart;
}

async function getCartByCustomerId(customerId) {
  const pool = getPool();
  const [cartRows] = await pool.query(
    'SELECT * FROM carts WHERE customer_id = ? AND status = ? LIMIT 1',
    [customerId, 'active']
  );

  if (!cartRows[0]) return null;

  const cart = mapCartRow(cartRows[0]);
  const [itemRows] = await pool.query(
    `SELECT ci.*, pv.product_id, p.name AS product_name, pv.sku, pv.color, pv.size, pv.price AS variant_price
     FROM cart_items ci
     JOIN product_variants pv ON ci.variant_id = pv.id
     JOIN products p ON pv.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );

  cart.items = itemRows.map((row) => ({
    ...mapItemRow(row),
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    color: row.color,
    size: row.size,
    variantPrice: Number(row.variant_price),
  }));

  return cart;
}

async function createCart({ customerId, sessionId }) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO carts (customer_id, session_id, status) VALUES (?, ?, ?)',
    [customerId || null, sessionId, 'active']
  );
  return mapCartRow({ id: result.insertId, customer_id: customerId, session_id: sessionId, status: 'active', created_at: new Date(), updated_at: new Date() });
}

async function addOrUpdateItem(cartId, variantId, quantity, unitPrice) {
  const pool = getPool();
  const [existingRows] = await pool.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
    [cartId, variantId]
  );

  if (existingRows[0]) {
    const newQuantity = existingRows[0].quantity + quantity;
    await pool.query(
      'UPDATE cart_items SET quantity = ?, unit_price = ? WHERE id = ?',
      [newQuantity, unitPrice, existingRows[0].id]
    );
    return existingRows[0].id;
  }

  const [result] = await pool.query(
    'INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
    [cartId, variantId, quantity, unitPrice]
  );
  return result.insertId;
}

async function removeItem(cartId, itemId) {
  const pool = getPool();
  await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND id = ?', [cartId, itemId]);
}

async function clearCart(cartId) {
  const pool = getPool();
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  await pool.query("UPDATE carts SET status = 'converted' WHERE id = ?", [cartId]);
}

async function findActiveCartByCustomerOrSession(customerId, sessionId) {
  if (customerId) {
    const cart = await getCartByCustomerId(customerId);
    if (cart) return cart;
  }
  const cart = await getCartBySessionId(sessionId);
  if (cart) return cart;
  return null;
}

module.exports = {
  getCartBySessionId,
  getCartByCustomerId,
  createCart,
  addOrUpdateItem,
  removeItem,
  clearCart,
  findActiveCartByCustomerOrSession,
};
