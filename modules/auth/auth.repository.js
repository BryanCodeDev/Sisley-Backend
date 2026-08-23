const { getPool } = require('../../database/connection');

async function findUserWithRoleAndPermissions(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.status, u.role_id, u.last_login_at, u.current_session_id,
            r.name AS role_name,
            GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ',') AS permissions
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE u.email = ?
     GROUP BY u.id`,
    [email]
  );

  return rows[0] || null;
}

async function findPermissionsByRoleId(roleId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT p.name
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = ?`,
    [roleId]
  );

  return rows.map((row) => row.name);
}

async function updateLastLogin(userId) {
  const pool = getPool();
  await pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [new Date(), userId]);
}

async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, phone, status, role_id, current_session_id
     FROM users
     WHERE id = ?`,
    [id]
  );

  return rows[0] || null;
}

async function createSession(userId, sessionId) {
  const pool = getPool();
  await pool.query('UPDATE users SET current_session_id = ? WHERE id = ?', [sessionId, userId]);
}

async function clearSession(userId) {
  const pool = getPool();
  await pool.query('UPDATE users SET current_session_id = NULL WHERE id = ?', [userId]);
}

async function getCurrentSessionId(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT current_session_id FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] ? rows[0].current_session_id : null;
}

module.exports = {
  findUserWithRoleAndPermissions,
  findPermissionsByRoleId,
  updateLastLogin,
  findUserById,
  createSession,
  clearSession,
  getCurrentSessionId,
};
