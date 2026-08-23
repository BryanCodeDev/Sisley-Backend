const { getPool } = require('../../database/connection');

async function findByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, first_name, last_name, phone, document_type, document_number, status, created_at, current_session_id FROM customers WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, email, first_name, last_name, phone, document_type, document_number, status, created_at, current_session_id FROM customers WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function updateLastLogin(customerId) {
  const pool = getPool();
  await pool.query('UPDATE customers SET updated_at = ? WHERE id = ?', [new Date(), customerId]);
}

async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO customers (email, password_hash, first_name, last_name, phone, document_type, document_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.email,
      data.passwordHash,
      data.firstName,
      data.lastName,
      data.phone || null,
      data.documentType || null,
      data.documentNumber || null,
      data.status || 'active',
    ]
  );
  return findById(result.insertId);
}

async function createSession(customerId, sessionId) {
  const pool = getPool();
  await pool.query('UPDATE customers SET current_session_id = ? WHERE id = ?', [sessionId, customerId]);
}

async function clearSession(customerId) {
  const pool = getPool();
  await pool.query('UPDATE customers SET current_session_id = NULL WHERE id = ?', [customerId]);
}

async function getCurrentSessionId(customerId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT current_session_id FROM customers WHERE id = ?',
    [customerId]
  );
  return rows[0] ? rows[0].current_session_id : null;
}

module.exports = {
  findByEmail,
  findById,
  updateLastLogin,
  create,
  createSession,
  clearSession,
  getCurrentSessionId,
};
