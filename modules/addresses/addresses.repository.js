const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  firstName: row.first_name,
  lastName: row.last_name,
  address: row.address,
  addressLine2: row.address_line2,
  zipCode: row.address_line2,
  city: row.city,
  department: row.department,
  phone: row.phone,
  isMain: !!row.is_default,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function findByCustomer(customerId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM shipping_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
    [customerId]
  );
  return rows.map(mapRow);
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM shipping_addresses WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO shipping_addresses (customer_id, first_name, last_name, address, address_line2, city, department, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.customerId,
      data.firstName,
      data.lastName,
      data.address,
      data.addressLine2 || null,
      data.city,
      data.department,
      data.phone,
      data.isMain ? 1 : 0,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const pool = getPool();
  await pool.query(
    'UPDATE shipping_addresses SET first_name = ?, last_name = ?, address = ?, address_line2 = ?, city = ?, department = ?, phone = ?, is_default = ? WHERE id = ?',
    [
      data.firstName,
      data.lastName,
      data.address,
      data.addressLine2 || null,
      data.city,
      data.department,
      data.phone,
      data.isMain ? 1 : 0,
      id,
    ]
  );
  return findById(id);
}

async function remove(id) {
  const pool = getPool();
  await pool.query('DELETE FROM shipping_addresses WHERE id = ?', [id]);
  return true;
}

module.exports = {
  findByCustomer,
  findById,
  create,
  update,
  remove,
};
