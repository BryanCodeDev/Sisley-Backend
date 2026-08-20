const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const authRepository = require('./auth.repository');

function generateToken(user) {
  const permissions = user.permissions ? user.permissions.split(',') : [];
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role_name,
      permissions,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

async function login(email, password) {
  const user = await authRepository.findUserWithRoleAndPermissions(email);

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (user.status === 'blocked') {
    throw new Error('Usuario bloqueado');
  }

  if (user.status === 'inactive') {
    throw new Error('Usuario inactivo');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateToken(user);
  const permissions = user.permissions ? user.permissions.split(',') : [];

  await authRepository.updateLastLogin(user.id);

  const { password_hash, ...safeUser } = user;

  return {
    token,
    user: {
      ...safeUser,
      role: user.role_name,
      permissions,
    },
  };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  login,
  verifyToken,
};
