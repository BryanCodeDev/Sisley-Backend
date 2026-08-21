import { handleCors, jsonResponse } from '../../../../utils';
import cartService from '../../../../modules/cart/cart.service';
import authCustomerService from '../../../../modules/auth-customer/auth-customer.service';

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;
  if (!token) return null;
  const decoded = authCustomerService.verifyToken(token);
  return decoded;
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const sessionId = request.headers.get('x-session-id') || 'default-session';
    const customer = await getAuthenticatedCustomer(request);
    const cart = await cartService.getCart(customer ? customer.sub : null, sessionId);
    if (cart) {
      const { clearCart } = require('../../../../modules/cart/cart.repository');
      await clearCart(cart.id);
    }
    return jsonResponse({ success: true, data: { items: [] } }, 200, cors.headers);
  } catch (error) {
    console.error('[CART] CLEAR error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al limpiar carrito' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
