import { handleCors, jsonResponse } from '../../../utils';
import roleService from '../../../modules/users/role.service';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const roles = await roleService.listRoles();
    return jsonResponse({ success: true, data: roles }, 200, cors.headers);
  } catch (error) {
    console.error('[ROLES] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener roles' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
