import { handleCors, jsonResponse, getClearCookieOptions } from '../../../../../utils';
import { logout } from '../../../../../modules/auth-customer/auth-customer.service';

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const token = request.cookies.get('sisley_customer_token')?.value;

    if (token) {
      try {
        const decoded = require('../../../../../modules/auth-customer/auth-customer.service').verifyToken(token);
        if (decoded) {
          await logout(decoded.sub);
        }
      } catch {
        // no bloquear logout
      }
    }

    const response = new Response(
      JSON.stringify({ success: true, message: 'Sesión cerrada' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...cors.headers } }
    );

    response.cookies.set('sisley_customer_token', '', getClearCookieOptions(process.env.NODE_ENV === 'production'));

    return response;
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error al cerrar sesión' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
