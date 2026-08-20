import { handleCors, jsonResponse } from '../../../../utils';
import customerService from '../../../../modules/customers/customer.service';

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const customer = await customerService.getCustomer(id);

    if (!customer) {
      return jsonResponse({ success: false, message: 'Cliente no encontrado' }, 404, cors.headers);
    }

    return jsonResponse({ success: true, data: customer }, 200, cors.headers);
  } catch (error) {
    console.error('[CUSTOMERS] GET by id error:', error.message);
    return jsonResponse({ success: false, message: 'Error al obtener cliente' }, 500, cors.headers);
  }
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const body = await request.json();
    const customer = await customerService.updateCustomer(id, body);
    return jsonResponse({ success: true, data: customer }, 200, cors.headers);
  } catch (error) {
    console.error('[CUSTOMERS] PUT error:', error.message);
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar cliente' }, status, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
