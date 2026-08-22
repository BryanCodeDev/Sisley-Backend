const { getPool } = require('../../database/connection');

async function listRoles() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name, description, is_system FROM roles ORDER BY id ASC');
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: Boolean(row.is_system),
  }));
}

module.exports = {
  listRoles,
};
