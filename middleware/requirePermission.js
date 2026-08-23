const { verifyToken, validateSession } = require('../modules/auth/auth.service');
const { verifyToken: verifyCustomerToken, validateSession: validateCustomerSession } = require('../modules/auth-customer/auth-customer.service');

async function getAuthenticatedUser(request) {
  const token = request.cookies.get('sisley_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return null;
  }

  const sessionValid = await validateSession(decoded.sub, decoded.sid);
  if (!sessionValid) {
    return null;
  }

  return decoded;
}

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = await verifyCustomerToken(token);

  if (!decoded) {
    return null;
  }

  const sessionValid = await validateCustomerSession(decoded.sub, decoded.sid);
  if (!sessionValid) {
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

async function requireCustomerAuth(request) {
  const customer = await getAuthenticatedCustomer(request);

  if (!customer) {
    return { authorized: false, status: 401, message: 'No autenticado' };
  }

  return { authorized: true, customer };
}

module.exports = {
  getAuthenticatedUser,
  getAuthenticatedCustomer,
  requirePermission,
  requireCustomerAuth,
};
