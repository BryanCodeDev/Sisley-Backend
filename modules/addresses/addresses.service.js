const addressRepository = require('./addresses.repository');

function validateCreate(data) {
  if (!data.customerId) {
    return { valid: false, message: 'El cliente es requerido' };
  }
  if (!data.firstName || !data.lastName || !data.address || !data.city || !data.department || !data.phone) {
    return { valid: false, message: 'Todos los campos de dirección son requeridos' };
  }
  return { valid: true };
}

async function listAddresses(customerId) {
  return addressRepository.findByCustomer(customerId);
}

async function getAddress(id) {
  return addressRepository.findById(id);
}

async function createAddress(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  return addressRepository.create(data);
}

async function updateAddress(id, data) {
  return addressRepository.update(id, data);
}

async function deleteAddress(id) {
  return addressRepository.remove(id);
}

module.exports = {
  validateCreate,
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
};
