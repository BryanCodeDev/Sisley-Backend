const { getPool } = require('../../database/connection');

const mapOrderRow = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  orderNumber: row.order_number,
  status: row.status,
  subtotal: Number(row.subtotal),
  discount: Number(row.discount),
  tax: Number(row.tax),
  shipping: Number(row.shipping),
  total: Number(row.total),
  shippingAddressId: row.shipping_address_id,
  paymentMethod: row.payment_method,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapItemRow = (row) => ({
  id: row.id,
  orderId: row.order_id,
  variantId: row.variant_id,
  productId: row.product_id,
  quantity: parseInt(row.quantity, 10),
  unitPrice: Number(row.unit_price),
  total: Number(row.total),
});

async function findAll(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('o.status = ?');
    params.push(filters.status);
  }

  if (filters.customerId) {
    conditions.push('o.customer_id = ?');
    params.push(filters.customerId);
  }

  if (filters.search) {
    conditions.push('(o.order_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy === 'newest' ? 'ORDER BY o.created_at DESC' : 'ORDER BY o.created_at DESC';

  const countQuery = `SELECT COUNT(*) AS total FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ${where}`;
  const [countRows] = await pool.query(countQuery, params);
  const total = countRows[0] ? parseInt(countRows[0].total, 10) : 0;

  const limit = filters.limit ? `LIMIT ${Math.max(1, parseInt(filters.limit, 10))}` : '';
  const offset = filters.page && filters.limit ? `OFFSET ${(Math.max(1, parseInt(filters.page, 10)) - 1) * parseInt(filters.limit, 10)}` : '';

  const query = `
    SELECT 
      o.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name,
      c.email AS customer_email
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    ${where}
    ${orderBy}
    ${limit}
    ${offset}
  `;

  const [rows] = await pool.query(query, params);
  const orders = rows.map(mapOrderRow);

  for (const order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items.map(mapItemRow);
  }

  return { items: orders, total };
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      o.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name,
      c.email AS customer_email,
      c.phone AS customer_phone
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ? LIMIT 1`,
    [id]
  );

  const order = rows[0] ? mapOrderRow(rows[0]) : null;
  if (!order) return null;

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  order.items = items.map(mapItemRow);

  const [history] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC', [id]);
  order.statusHistory = history.map((h) => ({
    id: h.id,
    status: h.status,
    notes: h.notes,
    createdBy: h.created_by,
    createdAt: h.created_at,
  }));

  return order;
}

async function create(data) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const orderNumber = `SIS-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, order_number, status, subtotal, discount, tax, shipping, total, shipping_address_id, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.customerId,
        orderNumber,
        data.status || 'PENDING',
        data.subtotal || 0,
        data.discount || 0,
        data.tax || 0,
        data.shipping || 0,
        data.total || 0,
        data.shippingAddressId,
        data.paymentMethod || null,
        data.notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of data.items || []) {
      await connection.query(
        'INSERT INTO order_items (order_id, variant_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.variantId, item.productId, item.quantity, item.unitPrice, item.total]
      );
    }

    await connection.query(
      'INSERT INTO order_status_history (order_id, status, notes, created_by) VALUES (?, ?, ?, ?)',
      [orderId, data.status || 'PENDING', 'Pedido creado', null]
    );

    await connection.commit();

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
    return mapOrderRow(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateStatus(id, status, notes = null, userId = null) {
  const pool = getPool();
  const allowedStatuses = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Estado inválido');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    await connection.query('INSERT INTO order_status_history (order_id, status, notes, created_by) VALUES (?, ?, ?, ?)', [id, status, notes, userId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findById,
  create,
  updateStatus,
};
