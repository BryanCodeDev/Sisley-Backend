import { handleCors, jsonResponse } from '../../../../utils';
import userService from '../../../../modules/users/user.service';
import { requirePermission } from '../../../../middleware/requirePermission';

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'users.read');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const id = params?.id;
    if (!id) {
      return jsonResponse({ success: false, message: 'ID requerido' }, 400, cors.headers);
    }

    const user = await userService.getUser(id);
    if (!user) {
      return jsonResponse({ success: false, message: 'Usuario no encontrado' }, 404, cors.headers);
    }

    const { password_hash, ...safeUser } = user;
    return jsonResponse({ success: true, data: safeUser }, 200, cors.headers);
  } catch (error) {
    console.error('[USERS] GET by id error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener usuario' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
