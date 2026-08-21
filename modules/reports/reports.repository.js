const { getPool } = require('../../database/connection');

async function getSalesReport(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.startDate) {
    conditions.push('o.created_at >= ?');
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push('o.created_at <= ?');
    params.push(filters.endDate);
  }

  if (filters.status) {
    conditions.push('o.status = ?');
    params.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let groupBy = 'DATE(o.created_at)';
  let dateFormat = '%Y-%m-%d';

  if (filters.period === 'week') {
    groupBy = 'YEARWEEK(o.created_at)';
    dateFormat = '%Y-%u';
  } else if (filters.period === 'month') {
    groupBy = 'DATE_FORMAT(o.created_at, "%Y-%m")';
    dateFormat = '%Y-%m';
  } else if (filters.period === 'year') {
    groupBy = 'YEAR(o.created_at)';
    dateFormat = '%Y';
  }

  const countQuery = `SELECT COUNT(*) AS total FROM orders o ${where}`;
  const [countRows] = await pool.query(countQuery, params);
  const totalCount = countRows[0] ? parseInt(countRows[0].total, 10) : 0;

  const query = `
    SELECT 
      ${groupBy} AS period,
      COUNT(*) AS order_count,
      SUM(o.total) AS total_sales,
      SUM(o.subtotal) AS subtotal,
      SUM(o.tax) AS tax,
      SUM(o.shipping) AS shipping
    FROM orders o
    ${where}
    GROUP BY ${groupBy}
    ORDER BY period DESC
  `;

  const [rows] = await pool.query(query, params);

  const items = rows.map((row) => ({
    period: row.period,
    orderCount: parseInt(row.order_count, 10),
    totalSales: Number(row.total_sales || 0),
    subtotal: Number(row.subtotal || 0),
    tax: Number(row.tax || 0),
    shipping: Number(row.shipping || 0),
  }));

  const totalsQuery = `
    SELECT 
      COUNT(*) AS total_count,
      SUM(total) AS total_sales,
      SUM(subtotal) AS subtotal,
      SUM(tax) AS tax,
      SUM(shipping) AS shipping
    FROM orders o
    ${where}
  `;

  const [totalsRows] = await pool.query(totalsQuery, params);
  const totals = totalsRows[0] || {};

  return {
    total: Number(totals.total_sales || 0),
    count: parseInt(totals.total_count || 0, 10),
    items,
  };
}

async function getInventoryReport() {
  const pool = getPool();

  const [lowStockRows] = await pool.query(`
    SELECT 
      i.id,
      i.variant_id,
      i.stock,
      i.min_stock,
      pv.sku,
      pv.color,
      pv.size,
      p.id AS product_id,
      p.name AS product_name
    FROM inventory i
    JOIN product_variants pv ON i.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE i.stock > 0 AND i.stock <= i.min_stock
    ORDER BY i.stock ASC
  `);

  const [outOfStockRows] = await pool.query(`
    SELECT 
      i.id,
      i.variant_id,
      i.stock,
      i.min_stock,
      pv.sku,
      pv.color,
      pv.size,
      p.id AS product_id,
      p.name AS product_name
    FROM inventory i
    JOIN product_variants pv ON i.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE i.stock = 0
    ORDER BY p.name ASC
  `);

  const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM product_variants');
  const totalVariants = totalRows[0] ? parseInt(totalRows[0].total, 10) : 0;

  const lowStock = lowStockRows.map((row) => ({
    id: row.id,
    variantId: row.variant_id,
    stock: parseInt(row.stock, 10),
    minStock: parseInt(row.min_stock, 10),
    sku: row.sku,
    color: row.color,
    size: row.size,
    productId: row.product_id,
    productName: row.product_name,
  }));

  const outOfStock = outOfStockRows.map((row) => ({
    id: row.id,
    variantId: row.variant_id,
    stock: parseInt(row.stock, 10),
    minStock: parseInt(row.min_stock, 10),
    sku: row.sku,
    color: row.color,
    size: row.size,
    productId: row.product_id,
    productName: row.product_name,
  }));

  return {
    lowStock,
    outOfStock,
    totalVariants,
  };
}

async function getTopProducts(limit = 10) {
  const pool = getPool();
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));

  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      pv.sku,
      SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN product_variants pv ON oi.variant_id = pv.id
    GROUP BY p.id, pv.sku
    ORDER BY total_sold DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [safeLimit]);

  return rows.map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    totalSold: parseInt(row.total_sold, 10),
  }));
}

module.exports = {
  getSalesReport,
  getInventoryReport,
  getTopProducts,
};
