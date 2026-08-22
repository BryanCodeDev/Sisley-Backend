const inventoryRepository = require('./inventory.repository');
const { getPool } = require('../../database/connection');

async function listInventory(filters = {}) {
  return inventoryRepository.getInventory(filters);
}

async function adjustStock(variantId, storeId, warehouseId, quantity, type, reason, userId) {
  if (!variantId || quantity === undefined || quantity === null) {
    throw new Error('Parámetros de ajuste inválidos');
  }

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let query = 'SELECT id, stock FROM inventory WHERE variant_id = ?';
    const params = [variantId];

    if (storeId !== null && storeId !== undefined) {
      query += ' AND store_id = ?';
      params.push(storeId);
    } else {
      query += ' AND store_id IS NULL';
    }

    if (warehouseId !== null && warehouseId !== undefined) {
      query += ' AND warehouse_id = ?';
      params.push(warehouseId);
    } else {
      query += ' AND warehouse_id IS NULL';
    }

    const [invRows] = await connection.query(query, params);

    if (!invRows[0]) {
      throw new Error('Registro de inventario no encontrado');
    }

    const currentStock = parseInt(invRows[0].stock, 10);
    const stockOperation = type === 'in' || type === 'return' ? 'add' : type === 'out' || type === 'sale' ? 'subtract' : 'set';
    let newStock = currentStock;

    if (stockOperation === 'add') {
      newStock = currentStock + Math.abs(quantity);
    } else if (stockOperation === 'subtract') {
      newStock = currentStock - Math.abs(quantity);
      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }
    } else {
      newStock = quantity;
      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }
    }

    await connection.query(
      'UPDATE inventory SET stock = ? WHERE id = ?',
      [newStock, invRows[0].id]
    );

    await inventoryRepository.createMovement({
      variantId,
      storeId,
      warehouseId,
      type,
      quantity: Math.abs(quantity),
      reason,
      userId,
    });

    await connection.commit();
    return { variantId, storeId, warehouseId, newStock };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  listInventory,
  adjustStock,
};
