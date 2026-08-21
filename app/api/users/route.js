import { handleCors, jsonResponse } from '../../../utils';
import userService from '../../../modules/users/user.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'users.read');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || '',
      search: searchParams.get('search') || '',
    };

    const { items, total } = await userService.listUsers(filters);

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
    console.error('[USERS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener usuarios' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'users.create');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const { email, password, firstName, lastName, roleId, phone, status } = body;

    if (!email || !password || !firstName || !lastName || !roleId) {
      return jsonResponse({ success: false, message: 'Email, contraseña, nombre, apellido y rol son requeridos' }, 400, cors.headers);
    }

    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      roleId,
      phone: phone || null,
      status: status || 'active',
    });

    const { password_hash, ...safeUser } = user;
    await logAudit(authResult.user.sub, 'create_user', 'users', String(user.id), null, { email: user.email });

    return jsonResponse({ success: true, data: safeUser }, 201, cors.headers);
  } catch (error) {
    console.error('[USERS] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear usuario' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
