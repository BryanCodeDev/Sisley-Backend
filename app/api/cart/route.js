import { handleCors, jsonResponse } from '../../../utils';
import cartService from '../../../modules/cart/cart.service';
import authCustomerService from '../../../modules/auth-customer/auth-customer.service';

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;
  if (!token) return null;
  const decoded = authCustomerService.verifyToken(token);
  return decoded;
}

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const sessionId = request.headers.get('x-session-id') || 'default-session';
    const customer = await getAuthenticatedCustomer(request);
    const cart = await cartService.getCart(customer ? customer.sub : null, sessionId);
    if (!cart) {
      return jsonResponse({ success: true, data: { items: [] } }, 200, cors.headers);
    }
    return jsonResponse({ success: true, data: cart }, 200, cors.headers);
  } catch (error) {
    console.error('[CART] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener carrito' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const sessionId = request.headers.get('x-session-id') || 'default-session';
    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || !quantity) {
      return jsonResponse({ success: false, message: 'Variante y cantidad son requeridas' }, 400, cors.headers);
    }

    const customer = await getAuthenticatedCustomer(request);
    const cart = await cartService.addItem(customer ? customer.sub : null, sessionId, { variantId, quantity });
    return jsonResponse({ success: true, data: cart }, 200, cors.headers);
  } catch (error) {
    console.error('[CART] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al agregar al carrito' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
