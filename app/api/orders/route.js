import { handleCors, jsonResponse } from '../../../utils';
import orderService from '../../../modules/orders/order.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || '',
      search: searchParams.get('search') || '',
      orderBy: searchParams.get('orderBy') || 'newest',
      customerId: searchParams.get('customerId') || '',
    };

    const { items, total } = await orderService.listOrders(filters);

    return jsonResponse(
      {
        success: true,
        data: items,
        pagination: {
          page: parseInt(filters.page, 10),
          limit: parseInt(filters.limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(filters.limit, 10)) || 1,
        },
      },
      200,
      cors.headers
    );
  } catch (error) {
    console.error('[ORDERS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener pedidos' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'orders.create');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const order = await orderService.createOrder(body);
    await logAudit(authResult.user.sub, 'create_order', 'orders', String(order.id), null, { orderNumber: order.orderNumber, total: order.total });
    return jsonResponse({ success: true, data: order }, 201, cors.headers);
  } catch (error) {
    console.error('[ORDERS] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear pedido' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
