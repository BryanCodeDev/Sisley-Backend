const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  sku: row.sku,
  categoryId: row.category_id,
  categoryName: row.category_name || null,
  categorySlug: row.category_slug || null,
  status: row.status,
  featured: !!row.featured,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  variants: row.variants || [],
  images: row.images || [],
});

async function findAll(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  if (filters.categoryId) {
    conditions.push('p.category_id = ?');
    params.push(filters.categoryId);
  }

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.slug LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.inStock === 'true') {
    conditions.push('EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.stock > 0)');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(DISTINCT p.id) AS total FROM products p ${where}`;
  const [countRows] = await pool.query(countQuery, params);
  const total = countRows[0] ? parseInt(countRows[0].total, 10) : 0;

  const orderBy = filters.orderBy === 'price_asc' ? 'ORDER BY p.price ASC' : filters.orderBy === 'price_desc' ? 'ORDER BY p.price DESC' : filters.orderBy === 'newest' ? 'ORDER BY p.created_at DESC' : 'ORDER BY p.featured DESC, p.created_at DESC';
  const limit = filters.limit ? `LIMIT ${Math.max(1, parseInt(filters.limit, 10))}` : '';
  const offset = filters.page && filters.limit ? `OFFSET ${(Math.max(1, parseInt(filters.page, 10)) - 1) * parseInt(filters.limit, 10)}` : '';

  const query = `
    SELECT 
      p.*,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ${orderBy}
    ${limit}
    ${offset}
  `;

  const [rows] = await pool.query(query, params);
  const products = rows.map(mapRow);

  for (const product of products) {
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    product.variants = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: Number(v.price),
      color: v.color,
      size: v.size,
      stock: parseInt(v.stock, 10),
      status: v.status,
    }));

    const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC', [product.id]);
    product.images = images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
      variantId: img.variant_id,
    }));
  }

  return { items: products, total };
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      p.*,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? LIMIT 1`,
    [id]
  );

  const product = rows[0] ? mapRow(rows[0]) : null;
  if (!product) return null;

  const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
  product.variants = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: Number(v.price),
    color: v.color,
    size: v.size,
    stock: parseInt(v.stock, 10),
    status: v.status,
  }));

  const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC', [id]);
  product.images = images.map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.alt_text,
    position: img.position,
    variantId: img.variant_id,
  }));

  return product;
}

async function findBySlug(slug) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      p.*,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? LIMIT 1`,
    [slug]
  );

  const product = rows[0] ? mapRow(rows[0]) : null;
  if (!product) return null;

  const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
  product.variants = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: Number(v.price),
    color: v.color,
    size: v.size,
    stock: parseInt(v.stock, 10),
    status: v.status,
  }));

  const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC', [product.id]);
  product.images = images.map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.alt_text,
    position: img.position,
    variantId: img.variant_id,
  }));

  return product;
}

async function findVariantById(variantId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT pv.*, p.name AS product_name, p.price AS product_price
     FROM product_variants pv
     JOIN products p ON pv.product_id = p.id
     WHERE pv.id = ? LIMIT 1`,
    [variantId]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    sku: row.sku,
    price: Number(row.price),
    color: row.color,
    size: row.size,
    stock: parseInt(row.stock, 10),
    status: row.status,
    productId: row.product_id,
    productName: row.product_name,
    productPrice: Number(row.product_price),
  };
}

async function count(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  if (filters.categoryId) {
    conditions.push('p.category_id = ?');
    params.push(filters.categoryId);
  }

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM products p ${where}`, params);
  return rows[0] ? parseInt(rows[0].total, 10) : 0;
}

async function create(data) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO products (name, slug, description, price, sku, category_id, status, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.name,
        data.slug,
        data.description || null,
        data.price,
        data.sku,
        data.categoryId,
        data.status || 'active',
        data.featured ? 1 : 0,
      ]
    );

    const productId = result.insertId;

    if (data.variants && Array.isArray(data.variants)) {
      for (const variant of data.variants) {
        await connection.query(
          'INSERT INTO product_variants (product_id, sku, price, color, size, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            productId,
            variant.sku,
            variant.price || data.price,
            variant.color || null,
            variant.size || null,
            variant.stock || 0,
            variant.status || 'active',
          ]
        );
      }
    }

    if (data.images && Array.isArray(data.images)) {
      for (const image of data.images) {
        await connection.query(
          'INSERT INTO product_images (product_id, url, alt_text, position, variant_id) VALUES (?, ?, ?, ?, ?)',
          [
            productId,
            image.url || null,
            image.altText || null,
            image.position || 0,
            image.variantId || null,
          ]
        );
      }
    }

    await connection.commit();
    return findById(productId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, data) {
  const pool = getPool();
  const fields = [];
  const params = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    params.push(data.name);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    params.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description ?? null);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    params.push(data.price);
  }
  if (data.sku !== undefined) {
    fields.push('sku = ?');
    params.push(data.sku);
  }
  if (data.categoryId !== undefined) {
    fields.push('category_id = ?');
    params.push(data.categoryId);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status || 'active');
  }
  if (data.featured !== undefined) {
    fields.push('featured = ?');
    params.push(data.featured ? 1 : 0);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  params.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

async function remove(id) {
  const pool = getPool();
  await pool.query("UPDATE products SET status = 'inactive' WHERE id = ?", [id]);
  return true;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  findVariantById,
  count,
  create,
  update,
  remove,
};
