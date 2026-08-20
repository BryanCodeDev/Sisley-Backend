const categoryRepository = require('./category.repository');

function validateCreate(data) {
  if (!data.name || !String(data.name).trim()) {
    return { valid: false, message: 'El nombre es requerido' };
  }
  if (!data.slug || !String(data.slug).trim()) {
    return { valid: false, message: 'El slug es requerido' };
  }

  const allowedStatuses = ['active', 'inactive'];
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
  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }
  return { valid: true };
}

async function listCategories(filters = {}) {
  const items = await categoryRepository.findAll(filters);
  const total = await categoryRepository.count(filters);
  return { items, total };
}

async function getCategory(id) {
  return categoryRepository.findById(id);
}

async function getCategoryBySlug(slug) {
  return categoryRepository.findBySlug(slug);
}

async function createCategory(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const existing = await categoryRepository.findBySlug(data.slug);
  if (existing) {
    throw new Error('Ya existe una categoría con ese slug');
  }

  return categoryRepository.create(data);
}

async function updateCategory(id, data) {
  const validation = validateUpdate(id, data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (data.slug) {
    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing && existing.id !== id) {
      throw new Error('Ya existe una categoría con ese slug');
    }
  }

  return categoryRepository.update(id, data);
}

async function deleteCategory(id) {
  return categoryRepository.remove(id);
}

module.exports = {
  validateCreate,
  validateUpdate,
  listCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
