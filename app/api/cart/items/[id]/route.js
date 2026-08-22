import { handleCors, jsonResponse } from '../../../../../utils';
import cartService from '../../../../../modules/cart/cart.service';
import authCustomerService from '../../../../../modules/auth-customer/auth-customer.service';

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;
  if (!token) return null;
  const decoded = await authCustomerService.verifyToken(token);
  return decoded;
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const sessionId = request.headers.get('x-session-id') || 'default-session';
    const body = await request.json();
    const { quantity } = body;
    const itemId = params.id;

    if (!itemId || quantity === undefined) {
      return jsonResponse({ success: false, message: 'Item y cantidad son requeridos' }, 400, cors.headers);
    }

    const customer = await getAuthenticatedCustomer(request);
    const cart = await cartService.updateItemQuantity(customer ? customer.sub : null, sessionId, itemId, quantity);
    return jsonResponse({ success: true, data: cart }, 200, cors.headers);
  } catch (error) {
    console.error('[CART_ITEMS] PUT error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar item' }, 400, cors.headers);
  }
}

export async function DELETE(request, { params }) {
  const cors = await handleCors(request);
  try {
    const sessionId = request.headers.get('x-session-id') || 'default-session';
    const itemId = params.id;

    if (!itemId) {
      return jsonResponse({ success: false, message: 'Item requerido' }, 400, cors.headers);
    }

    const customer = await getAuthenticatedCustomer(request);
    const cart = await cartService.removeItem(customer ? customer.sub : null, sessionId, itemId);
    return jsonResponse({ success: true, data: cart }, 200, cors.headers);
  } catch (error) {
    console.error('[CART_ITEMS] DELETE error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al eliminar item' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
