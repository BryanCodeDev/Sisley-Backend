const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');

function validateCreate(data) {
  if (!data.email || !String(data.email).trim()) {
    return { valid: false, message: 'El email es requerido' };
  }
  if (!data.password || !String(data.password).trim()) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  if (!data.firstName || !String(data.firstName).trim()) {
    return { valid: false, message: 'El nombre es requerido' };
  }
  if (!data.lastName || !String(data.lastName).trim()) {
    return { valid: false, message: 'El apellido es requerido' };
  }
  if (!data.roleId) {
    return { valid: false, message: 'El rol es requerido' };
  }

  const allowedStatuses = ['active', 'inactive', 'blocked'];
  if (data.status && !allowedStatuses.includes(data.status)) {
    return { valid: false, message: 'Estado inválido' };
  }

  return { valid: true };
}

async function listUsers(filters = {}) {
  const { items, total } = await userRepository.findAll(filters);
  return { items, total };
}

async function getUser(id) {
  return userRepository.findById(id);
}

async function createUser(data) {
  const validation = validateCreate(data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const existing = await userRepository.findAll({ search: data.email });
  const emailExists = existing.items.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (emailExists) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return userRepository.create({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    roleId: data.roleId,
    phone: data.phone || null,
    status: data.status || 'active',
  });
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

async function updateUser(id, data) {
  const validation = validateUpdate(id, data);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (data.email) {
    const existing = await userRepository.findAll({ search: data.email });
    const emailExists = existing.items.find((u) => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== id);
    if (emailExists) {
      throw new Error('Ya existe un usuario con ese email');
    }
  }

  if (data.password) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    data.passwordHash = passwordHash;
  }

  return userRepository.update(id, data);
}

async function deleteUser(id) {
  return userRepository.remove(id);
}

module.exports = {
  validateCreate,
  validateUpdate,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
