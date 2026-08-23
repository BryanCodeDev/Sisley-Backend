const customerRepository = require('./customer.repository');

function validateCreate(data) {
  if (!data.email || !String(data.email).trim()) {
    return { valid: false, message: 'El email es requerido' };
  }
  if (!data.firstName || !String(data.firstName).trim()) {
    return { valid: false, message: 'El nombre es requerido' };
  }
  if (!data.lastName || !String(data.lastName).trim()) {
    return { valid: false, message: 'El apellido es requerido' };
  }

  const allowedStatuses = ['active', 'inactive', 'blocked'];
  if (data.status && !allowedStatuses.includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }

  return { valid: true };
}

function validateUpdate(id, data) {
  if (!id) {
    return { valid: false, message: 'ID requerido' };
  }
  if (data.email !== undefined && !String(data.email).trim()) {
    return { valid: false, message: 'El email no puede estar vacío' };
  }
  if (data.status && !['active', 'inactive', 'blocked'].includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }
  return { valid: true };
}

async function listCustomers(filters = {}) {
  const items = await customerRepository.findAll(filters);
  const total = await customerRepository.count(filters);
  return { items, total };
}

async function getCustomer(id) {
  return customerRepository.findById(id);
}

async function createCustomer(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const existing = await customerRepository.findAll({ search: data.email });
  const emailExists = existing.items.find((c) => c.email.toLowerCase() === data.email.toLowerCase());
  if (emailExists) {
    throw new Error('Ya existe un cliente con ese email');
  }

  return customerRepository.create(data);
}

async function updateCustomer(id, data) {
  const validation = validateUpdate(id, data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (data.email) {
    const existing = await customerRepository.findAll({ search: data.email });
    const emailExists = existing.items.find((c) => c.email.toLowerCase() === data.email.toLowerCase() && c.id !== id);
    if (emailExists) {
      throw new Error('Ya existe un cliente con ese email');
    }
  }

  return customerRepository.update(id, data);
}

async function deleteCustomer(id) {
  return customerRepository.remove(id);
}

module.exports = {
  validateCreate,
  validateUpdate,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
