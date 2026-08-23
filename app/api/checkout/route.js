import { handleCors, jsonResponse } from '../../../utils';
import { requirePermission, getAuthenticatedCustomer } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';
import orderService from '../../../modules/orders/order.service';
import cartService from '../../../modules/cart/cart.service';

async function getCartForRequest(request) {
  const sessionId = request.headers.get('x-session-id') || 'default-session';
  const customer = await getAuthenticatedCustomer(request);
  return cartService.getCart(customer ? customer.sub : null, sessionId);
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const body = await request.json();
    const { shippingAddressId, shippingMethod, paymentMethod, notes, customerId } = body;

    if (!shippingAddressId) {
      return jsonResponse({ success: false, message: 'La dirección de envío es requerida' }, 400, cors.headers);
    }

    const customer = await getAuthenticatedCustomer(request);
    const authResult = await requirePermission(request, 'orders.create');

    let targetCustomerId = customerId;

    if (authResult.authorized) {
      targetCustomerId = customerId || authResult.user.sub;
    } else if (customer) {
      targetCustomerId = customer.sub;
    } else {
      return jsonResponse({ success: false, message: 'No autorizado. Inicia sesión para continuar.' }, 401, cors.headers);
    }

    const cart = await getCartForRequest(request);
    if (!cart || !cart.items || cart.items.length === 0) {
      return jsonResponse({ success: false, message: 'El carrito está vacío' }, 400, cors.headers);
    }

    const orderItems = cart.items.map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));

    const order = await orderService.createOrder({
      customerId: targetCustomerId,
      status: 'PAYMENT_PENDING',
      shippingAddressId,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || null,
      items: orderItems,
    });

    const cartRepository = require('../../../modules/cart/cart.repository');
    await cartRepository.clearCart(cart.id);

    const auditUserId = authResult.authorized ? authResult.user.sub : customer?.sub;
    if (auditUserId) {
      await logAudit(auditUserId, 'create_order', 'orders', String(order.id), null, { orderNumber: order.orderNumber, total: order.total });
    }

    return jsonResponse({ success: true, data: order }, 201, cors.headers);
  } catch (error) {
    console.error('[CHECKOUT] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al procesar el pedido' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
