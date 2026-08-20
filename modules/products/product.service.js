const productRepository = require('./product.repository');

function validateCreate(data) {
  if (!data.name || !String(data.name).trim()) {
    return { valid: false, message: 'El nombre es requerido' };
  }
  if (!data.slug || !String(data.slug).trim()) {
    return { valid: false, message: 'El slug es requerido' };
  }
  if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) {
    return { valid: false, message: 'El precio debe ser un número mayor o igual a 0' };
  }
  if (!data.sku || !String(data.sku).trim()) {
    return { valid: false, message: 'El SKU es requerido' };
  }
  if (!data.categoryId) {
    return { valid: false, message: 'La categoría es requerida' };
  }

  const allowedStatuses = ['active', 'inactive', 'draft'];
  if (data.status && !allowedStatuses.includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }

  return { valid: true };
}

function validateUpdate(id, data) {
  if (!id) {
    return { valid: false, message: 'ID requerido' };
  }
  if (data.name !== undefined && !String(data.name).trim()) {
    return { valid: false, message: 'El nombre no puede estar vacío' };
  }
  if (data.price !== undefined && (isNaN(Number(data.price)) || Number(data.price) < 0)) {
    return { valid: false, message: 'El precio debe ser un número mayor o igual a 0' };
  }
  if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }
  return { valid: true };
}

async function listProducts(filters = {}) {
  const { items, total } = await productRepository.findAll(filters);
  return { items, total };
}

async function getProduct(id) {
  return productRepository.findById(id);
}

async function getProductBySlug(slug) {
  return productRepository.findBySlug(slug);
}

async function createProduct(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const existing = await productRepository.findBySlug(data.slug);
  if (existing) {
    throw new Error('Ya existe un producto con ese slug');
  }

  const existingSku = await productRepository.findAll({ search: data.sku });
  const skuExists = existing.items.find((p) => p.sku === data.sku);
  if (skuExists) {
    throw new Error('Ya existe un producto con ese SKU');
  }

  return productRepository.create(data);
}

async function updateProduct(id, data) {
  const validation = validateUpdate(id, data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (data.slug) {
    const existing = await productRepository.findBySlug(data.slug);
    if (existing && existing.id !== id) {
      throw new Error('Ya existe un producto con ese slug');
    }
  }

  if (data.sku) {
    const existing = await productRepository.findAll({ search: data.sku });
    const skuExists = existing.items.find((p) => p.sku === data.sku && p.id !== id);
    if (skuExists) {
      throw new Error('Ya existe un producto con ese SKU');
    }
  }

  return productRepository.update(id, data);
}

async function deleteProduct(id) {
  return productRepository.remove(id);
}

module.exports = {
  validateCreate,
  validateUpdate,
  listProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
