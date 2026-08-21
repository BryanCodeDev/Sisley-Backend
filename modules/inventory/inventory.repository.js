const { getPool } = require('../../database/connection');

const mapRow = (row) => ({
  id: row.id,
  variantId: row.variant_id,
  storeId: row.store_id,
  warehouseId: row.warehouse_id,
  stock: parseInt(row.stock, 10),
  minStock: parseInt(row.min_stock, 10),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  variant: row.variant_id ? {
    id: row.variant_id,
    sku: row.variant_sku,
    price: Number(row.variant_price),
    color: row.variant_color,
    size: row.variant_size,
    productId: row.product_id,
    productName: row.product_name,
  } : null,
  store: row.store_id ? {
    id: row.store_id,
    name: row.store_name,
    city: row.store_city,
  } : null,
  warehouse: row.warehouse_id ? {
    id: row.warehouse_id,
    name: row.warehouse_name,
  } : null,
});

async function getInventory(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.variantId) {
    conditions.push('i.variant_id = ?');
    params.push(filters.variantId);
  }

  if (filters.storeId) {
    conditions.push('i.store_id = ?');
    params.push(filters.storeId);
  }

  if (filters.warehouseId) {
    conditions.push('i.warehouse_id = ?');
    params.push(filters.warehouseId);
  }

  if (filters.lowStock) {
    conditions.push('i.stock <= i.min_stock');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      i.*,
      pv.sku AS variant_sku,
      pv.price AS variant_price,
      pv.color AS variant_color,
      pv.size AS variant_size,
      pv.product_id,
      p.name AS product_name,
      s.name AS store_name,
      s.city AS store_city,
      w.name AS warehouse_name
    FROM inventory i
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN stores s ON i.store_id = s.id
    LEFT JOIN warehouses w ON i.warehouse_id = w.id
    ${where}
    ORDER BY i.id ASC
  `;

  const [rows] = await pool.query(query, params);
  return rows.map(mapRow);
}

async function updateStock(variantId, storeId, warehouseId, newStock) {
  const pool = getPool();
  await pool.query(
    'UPDATE inventory SET stock = ? WHERE variant_id = ? AND store_id = ? AND warehouse_id = ?',
    [newStock, variantId, storeId, warehouseId]
  );
}

async function createMovement(data) {
  const pool = getPool();
  const allowedTypes = ['in', 'out', 'adjustment', 'sale', 'transfer', 'return'];
  if (!allowedTypes.includes(data.type)) {
    throw new Error('Tipo de movimiento inválido');
  }

  const [result] = await pool.query(
    `INSERT INTO inventory_movements (variant_id, store_id, warehouse_id, type, quantity, reason, reference, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.variantId,
      data.storeId || null,
      data.warehouseId || null,
      data.type,
      data.quantity,
      data.reason || null,
      data.reference || null,
      data.userId || null,
    ]
  );
  return result.insertId;
}

module.exports = {
  getInventory,
  updateStock,
  createMovement,
};
