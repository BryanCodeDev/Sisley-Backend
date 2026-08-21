import { handleCors, jsonResponse } from '../../../../../utils';
import authCustomerService from '../../../../../modules/auth-customer/auth-customer.service';

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = authCustomerService.verifyToken(token);

  if (!decoded) {
    return null;
  }

  return decoded;
}

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const customer = await getAuthenticatedCustomer(request);

    if (!customer) {
      return jsonResponse({ success: false, message: 'No autenticado' }, 401, cors.headers);
    }

    const fullCustomer = await authCustomerService.findCustomerById(customer.sub);

    if (!fullCustomer) {
      return jsonResponse({ success: false, message: 'Cliente no encontrado' }, 404, cors.headers);
    }

    const { password_hash, ...safeCustomer } = fullCustomer;

    return jsonResponse({
      success: true,
      data: {
        ...safeCustomer,
        firstName: safeCustomer.first_name,
        lastName: safeCustomer.last_name,
        fullName: `${safeCustomer.first_name} ${safeCustomer.last_name}`,
      },
    }, 200, cors.headers);
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error al obtener cliente' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
