const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  key: row.key,
  value: row.value,
  type: row.type,
  description: row.description,
  updatedAt: row.updated_at,
});

async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT `key`, value, type, description, updated_at FROM settings ORDER BY `key` ASC');
  return rows.map(mapRow);
}

async function findByKey(key) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT `key`, value, type, description, updated_at FROM settings WHERE `key` = ? LIMIT 1', [key]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function upsert(key, value, type, description) {
  const pool = getPool();
  const query = 'INSERT INTO settings (`key`, value, type, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), type = VALUES(type), description = VALUES(description)';
  await pool.query(query, [key, value, type, description || null]);
  return findByKey(key);
}

module.exports = {
  findAll,
  findByKey,
  upsert,
};
