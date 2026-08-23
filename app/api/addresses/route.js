import { handleCors, jsonResponse } from '../../../utils';
import { getAuthenticatedUser, getAuthenticatedCustomer } from '../../../middleware/requirePermission';
import addressService from '../../../modules/addresses/addresses.service';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const customer = await getAuthenticatedCustomer(request);
    const admin = await getAuthenticatedUser(request);

    if (!customer && !admin) {
      return jsonResponse({ success: false, message: 'No autorizado' }, 401, cors.headers);
    }

    let targetCustomerId = customerId;
    if (customer && !targetCustomerId) {
      targetCustomerId = String(customer.sub);
    }

    if (!targetCustomerId) {
      return jsonResponse({ success: false, message: 'customerId es requerido' }, 400, cors.headers);
    }

    const items = await addressService.listAddresses(targetCustomerId);
    return jsonResponse({ success: true, data: items }, 200, cors.headers);
  } catch (error) {
    console.error('[ADDRESSES] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener direcciones' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const customer = await getAuthenticatedCustomer(request);
    const admin = await getAuthenticatedUser(request);

    if (!customer && !admin) {
      return jsonResponse({ success: false, message: 'No autorizado' }, 401, cors.headers);
    }

    const body = await request.json();
    let targetCustomerId = body.customerId;

    if (customer && !targetCustomerId) {
      targetCustomerId = customer.sub;
    }

    if (!targetCustomerId) {
      return jsonResponse({ success: false, message: 'customerId es requerido' }, 400, cors.headers);
    }

    const address = await addressService.createAddress({
      ...body,
      customerId: targetCustomerId,
    });

    return jsonResponse({ success: true, data: address }, 201, cors.headers);
  } catch (error) {
    console.error('[ADDRESSES] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear dirección' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
