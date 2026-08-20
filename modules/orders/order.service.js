const orderRepository = require('./order.repository');
const productRepository = require('../products/product.repository');
const { getPool } = require('../../database/connection');

async function updateVariantStock(variantId, newStock) {
  const pool = getPool();
  await pool.query('UPDATE product_variants SET stock = ? WHERE id = ?', [newStock, variantId]);
}

function validateCreate(data) {
  if (!data.customerId) {
    return { valid: false, message: 'El cliente es requerido' };
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, message: 'Debe incluir al menos un producto' };
  }

  for (const item of data.items) {
    if (!item.variantId) {
      return { valid: false, message: 'Cada item debe tener una variante' };
    }
    if (!item.quantity || item.quantity <= 0) {
      return { valid: false, message: 'La cantidad debe ser mayor a 0' };
    }
    if (item.unitPrice === undefined || item.unitPrice === null || isNaN(Number(item.unitPrice))) {
      return { valid: false, message: 'El precio unitario es inválido' };
    }
  }

  const allowedStatuses = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  if (data.status && !allowedStatuses.includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }

  return { valid: true };
}

async function listOrders(filters = {}) {
  const { items, total } = await orderRepository.findAll(filters);
  return { items, total };
}

async function getOrder(id) {
  return orderRepository.findById(id);
}

async function createOrder(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const subtotal = (data.items || []).reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shipping = Number(data.shipping || 0);
  const discount = Number(data.discount || 0);
  const tax = Number(data.tax || 0);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const enrichedItems = [];
  for (const item of data.items) {
    const product = await productRepository.findById(item.productId);
    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`);
    }

    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) {
      throw new Error(`Variante no encontrada: ${item.variantId}`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name} - ${variant.color} ${variant.size}`);
    }

    enrichedItems.push({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.unitPrice) * item.quantity,
    });
  }

  const orderData = {
    customerId: data.customerId,
    status: data.status || 'PENDING',
    subtotal,
    discount,
    tax,
    shipping,
    total,
    shippingAddressId: data.shippingAddressId,
    paymentMethod: data.paymentMethod || null,
    notes: data.notes || null,
    items: enrichedItems,
  };

  const order = await orderRepository.create(orderData);

  for (const item of enrichedItems) {
    const product = await productRepository.findById(item.productId);
    const variant = product.variants.find((v) => v.id === item.variantId);
    const newStock = Math.max(0, variant.stock - item.quantity);
    await updateVariantStock(item.variantId, newStock);
  }

  return order;
}

async function changeOrderStatus(id, status, notes = null, userId = null) {
  const allowedStatuses = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Estado inválido');
  }
  await orderRepository.updateStatus(id, status, notes, userId);
}

module.exports = {
  validateCreate,
  listOrders,
  getOrder,
  createOrder,
  changeOrderStatus,
};
