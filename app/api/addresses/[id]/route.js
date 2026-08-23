import { handleCors, jsonResponse } from '../../../../utils';
import { getAuthenticatedUser } from '../../../../middleware/requirePermission';
import authCustomerService from '../../../../modules/auth-customer/auth-customer.service';
import addressService from '../../../../modules/addresses/addresses.service';
import { logAudit } from '../../../../utils/audit';

async function getAuthenticatedCustomer(request) {
  const token = request.cookies.get('sisley_customer_token')?.value;
  if (!token) return null;
  const decoded = await authCustomerService.verifyToken(token);
  return decoded;
}

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;

    const customer = await getAuthenticatedCustomer(request);
    const admin = await getAuthenticatedUser(request);

    if (!customer && !admin) {
      return jsonResponse({ success: false, message: 'No autorizado' }, 401, cors.headers);
    }

    const address = await addressService.getAddress(id);
    if (!address) {
      return jsonResponse({ success: false, message: 'Dirección no encontrada' }, 404, cors.headers);
    }

    return jsonResponse({ success: true, data: address }, 200, cors.headers);
  } catch (error) {
    console.error('[ADDRESSES] GET by id error:', error.message);
    return jsonResponse({ success: false, message: 'Error al obtener dirección' }, 500, cors.headers);
  }
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const customer = await getAuthenticatedCustomer(request);
    const admin = await getAuthenticatedUser(request);

    if (!customer && !admin) {
      return jsonResponse({ success: false, message: 'No autorizado' }, 401, cors.headers);
    }

    const { id } = params;
    const body = await request.json();
    const address = await addressService.updateAddress(id, body);

    const auditUserId = admin ? admin.sub : customer?.sub;
    if (auditUserId) {
      await logAudit(auditUserId, 'update_address', 'addresses', id, null, { address: address.address });
    }

    return jsonResponse({ success: true, data: address }, 200, cors.headers);
  } catch (error) {
    console.error('[ADDRESSES] PUT error:', error.message);
    const status = error.message === 'Dirección no encontrada' ? 404 : 400;
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar dirección' }, status, cors.headers);
  }
}

export async function DELETE(request, { params }) {
  const cors = await handleCors(request);
  try {
    const customer = await getAuthenticatedCustomer(request);
    const admin = await getAuthenticatedUser(request);

    if (!customer && !admin) {
      return jsonResponse({ success: false, message: 'No autorizado' }, 401, cors.headers);
    }

    const { id } = params;
    await addressService.deleteAddress(id);

    const auditUserId = admin ? admin.sub : customer?.sub;
    if (auditUserId) {
      await logAudit(auditUserId, 'delete_address', 'addresses', id, null, null);
    }

    return jsonResponse({ success: true, message: 'Dirección eliminada correctamente' }, 200, cors.headers);
  } catch (error) {
    console.error('[ADDRESSES] DELETE error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al eliminar dirección' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
