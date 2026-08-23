const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone,
  roleId: row.role_id,
  roleName: row.role_name || null,
  status: row.status,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function findAll(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('u.status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) AS total FROM users u ${where}`;
  const [countRows] = await pool.query(countQuery, params);
  const total = countRows[0] ? parseInt(countRows[0].total, 10) : 0;

  const orderBy = 'ORDER BY u.created_at DESC';
  const limit = filters.limit ? `LIMIT ${Math.max(1, parseInt(filters.limit, 10))}` : '';
  const offset = filters.page && filters.limit ? `OFFSET ${(Math.max(1, parseInt(filters.page, 10)) - 1) * parseInt(filters.limit, 10)}` : '';

  const query = `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, u.phone, u.role_id, u.status, u.last_login_at, u.created_at, u.updated_at,
      r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ${where}
    ${orderBy}
    ${limit}
    ${offset}
  `;

  const [rows] = await pool.query(query, params);
  return { items: rows.map(mapRow), total };
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      u.id, u.email, u.first_name, u.last_name, u.phone, u.role_id, u.status, u.last_login_at, u.created_at, u.updated_at,
      r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? LIMIT 1`,
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
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
  return rows[0] ? parseInt(rows[0].total, 10) : 0;
}

async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, first_name, last_name, role_id, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.email,
      data.passwordHash,
      data.firstName,
      data.lastName,
      data.roleId,
      data.phone || null,
      data.status || 'active',
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const pool = getPool();
  const fields = [];
  const params = [];

  if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
  if (data.firstName !== undefined) { fields.push('first_name = ?'); params.push(data.firstName); }
  if (data.lastName !== undefined) { fields.push('last_name = ?'); params.push(data.lastName); }
  if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone ?? null); }
  if (data.roleId !== undefined) { fields.push('role_id = ?'); params.push(data.roleId); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }

  if (!fields.length) return findById(id);

  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  return findById(id);
}

async function remove(id) {
  const pool = getPool();
  await pool.query('UPDATE users SET status = ? WHERE id = ?', ['inactive', id]);
  return findById(id);
}

module.exports = {
  findAll,
  findById,
  count,
  create,
  update,
  remove,
};
