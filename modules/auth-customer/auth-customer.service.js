const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const authCustomerRepository = require('./auth-customer.repository');

function generateToken(customer, sessionId) {
  return jwt.sign(
    {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
      firstName: customer.first_name,
      lastName: customer.last_name,
      sid: sessionId,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

async function login(email, password) {
  const customer = await authCustomerRepository.findByEmail(email);

  if (!customer) {
    throw new Error('Credenciales inválidas');
  }

  if (customer.status === 'blocked') {
    throw new Error('Cliente bloqueado');
  }

  if (customer.status === 'inactive') {
    throw new Error('Cliente inactivo');
  }

  const passwordMatch = await require('bcryptjs').compare(password, customer.password_hash);

  if (!passwordMatch) {
    throw new Error('Credenciales inválidas');
  }

  const sessionId = uuidv4();
  await authCustomerRepository.createSession(customer.id, sessionId);

  const token = generateToken(customer, sessionId);

  await authCustomerRepository.updateLastLogin(customer.id);

  const { password_hash, ...safeCustomer } = customer;

  return {
    token,
    customer: {
      ...safeCustomer,
      firstName: customer.first_name,
      lastName: customer.last_name,
      fullName: `${customer.first_name} ${customer.last_name}`,
    },
  };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'customer') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

async function validateSession(customerId, sessionId) {
  try {
    const currentSessionId = await authCustomerRepository.getCurrentSessionId(customerId);
    return currentSessionId === sessionId;
  } catch (error) {
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return true;
    }
    throw error;
  }
}

async function findCustomerById(id) {
  return authCustomerRepository.findById(id);
}

async function findByEmail(email) {
  return authCustomerRepository.findByEmail(email);
}

async function create(data) {
  return authCustomerRepository.create(data);
}

async function logout(customerId) {
  await authCustomerRepository.clearSession(customerId);
}

module.exports = {
  generateToken,
  login,
  verifyToken,
  validateSession,
  findCustomerById,
  findByEmail,
  create,
  logout,
};
