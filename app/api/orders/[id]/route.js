import { handleCors, jsonResponse } from '../../../../utils';
import orderService from '../../../../modules/orders/order.service';

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const order = await orderService.getOrder(id);

    if (!order) {
      return jsonResponse({ success: false, message: 'Pedido no encontrado' }, 404, cors.headers);
    }

    return jsonResponse({ success: true, data: order }, 200, cors.headers);
  } catch (error) {
    console.error('[ORDERS] GET by id error:', error.message);
    return jsonResponse({ success: false, message: 'Error al obtener pedido' }, 500, cors.headers);
  }
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const body = await request.json();
    await orderService.changeOrderStatus(id, body.status, body.notes, body.userId || null);
    return jsonResponse({ success: true, message: 'Estado actualizado correctamente' }, 200, cors.headers);
  } catch (error) {
    console.error('[ORDERS] PUT error:', error.message);
    const status = error.message === 'Pedido no encontrado' ? 404 : error.message === 'Estado inválido' ? 400 : 500;
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar pedido' }, status, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
