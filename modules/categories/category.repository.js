const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.image_url,
  parentId: row.parent_id,
  position: row.position,
  status: row.status,
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

  if (filters.parentId) {
    conditions.push('parent_id = ?');
    params.push(filters.parentId);
  }

  if (filters.search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy === 'name' ? 'ORDER BY name ASC' : 'ORDER BY position ASC, name ASC';
  const limit = filters.limit ? `LIMIT ${Math.max(1, parseInt(filters.limit, 10))}` : '';
  const offset = filters.page && filters.limit ? `OFFSET ${(Math.max(1, parseInt(filters.page, 10)) - 1) * parseInt(filters.limit, 10)}` : '';

  const [rows] = await pool.query(`SELECT * FROM categories ${where} ${orderBy} ${limit} ${offset}`, params);
  return rows.map(mapRow);
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function findBySlug(slug) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
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
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM categories ${where}`, params);
  return rows[0] ? parseInt(rows[0].total, 10) : 0;
}

async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, description, image_url, parent_id, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.name,
      data.slug,
      data.description || null,
      data.imageUrl || null,
      data.parentId || null,
      data.position || 0,
      data.status || 'active',
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const pool = getPool();
  await pool.query(
    'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, parent_id = ?, position = ?, status = ? WHERE id = ?',
    [
      data.name,
      data.slug,
      data.description ?? null,
      data.imageUrl ?? null,
      data.parentId ?? null,
      data.position ?? 0,
      data.status || 'active',
      id,
    ]
  );
  return findById(id);
}

async function remove(id) {
  const pool = getPool();
  await pool.query("UPDATE categories SET status = 'inactive' WHERE id = ?", [id]);
  return true;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  count,
  create,
  update,
  remove,
};
