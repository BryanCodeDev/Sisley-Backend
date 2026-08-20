const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone,
  documentType: row.document_type,
  documentNumber: row.document_number,
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function findAll(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy === 'name' ? 'ORDER BY first_name ASC, last_name ASC' : 'ORDER BY created_at DESC';
  const limit = filters.limit ? `LIMIT ${Math.max(1, parseInt(filters.limit, 10))}` : '';
  const offset = filters.page && filters.limit ? `OFFSET ${(Math.max(1, parseInt(filters.page, 10)) - 1) * parseInt(filters.limit, 10)}` : '';

  const query = `SELECT id, email, first_name, last_name, phone, document_type, document_number, status, notes, created_at, updated_at FROM customers ${where} ${orderBy} ${limit} ${offset}`;

  const [rows] = await pool.query(query, params);
  return rows.map(mapRow);
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, phone, document_type, document_number, status, notes, created_at, updated_at FROM customers WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

async function count(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM customers ${where}`, params);
  return rows[0] ? parseInt(rows[0].total, 10) : 0;
}

async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO customers (email, password_hash, first_name, last_name, phone, document_type, document_number, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.email,
      data.passwordHash || '',
      data.firstName,
      data.lastName,
      data.phone || null,
      data.documentType || null,
      data.documentNumber || null,
      data.status || 'active',
      data.notes || null,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const pool = getPool();
  await pool.query(
    'UPDATE customers SET email = ?, first_name = ?, last_name = ?, phone = ?, document_type = ?, document_number = ?, status = ?, notes = ? WHERE id = ?',
    [
      data.email,
      data.firstName,
      data.lastName,
      data.phone ?? null,
      data.documentType ?? null,
      data.documentNumber ?? null,
      data.status || 'active',
      data.notes ?? null,
      id,
    ]
  );
  return findById(id);
}

module.exports = {
  findAll,
  findById,
  count,
  create,
  update,
};
