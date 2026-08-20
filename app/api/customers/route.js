import { handleCors, jsonResponse } from '../../../utils';
import customerService from '../../../modules/customers/customer.service';

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
    };

    const { items, total } = await customerService.listCustomers(filters);

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
    console.error('[CUSTOMERS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener clientes' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const body = await request.json();
    const customer = await customerService.createCustomer(body);
    return jsonResponse({ success: true, data: customer }, 201, cors.headers);
  } catch (error) {
    console.error('[CUSTOMERS] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear cliente' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
