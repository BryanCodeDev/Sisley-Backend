const { verifyToken } = require('../modules/auth/auth.service');

async function getAuthenticatedUser(request) {
  const token = request.cookies.get('sisley_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  return decoded;
}

async function requirePermission(request, requiredPermission) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { authorized: false, status: 401, message: 'No autenticado' };
  }

  const userPermissions = user.permissions || [];

  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    return { authorized: false, status: 403, message: 'No tienes permisos para realizar esta acción' };
  }

  return { authorized: true, user };
}

module.exports = {
  getAuthenticatedUser,
  requirePermission,
};
