const { getPool } = require('../database/connection');

async function logAudit(userId, action, module, recordId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, module, record_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        module,
        recordId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
      ]
    );
  } catch (error) {
    console.error('[AUDIT] Failed to log audit:', error.message);
  }
}

module.exports = {
  logAudit,
};
