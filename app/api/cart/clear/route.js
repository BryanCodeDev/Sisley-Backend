import { handleCors, jsonResponse } from '../../../../utils';
import { getAuthenticatedCustomer } from '../../../../middleware/requirePermission';
import cartService from '../../../../modules/cart/cart.service';

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
