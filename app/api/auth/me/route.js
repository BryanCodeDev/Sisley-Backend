import { handleCors, jsonResponse } from '../../../../utils';
import { getAuthenticatedUser } from '../../../../middleware/requirePermission';
import authRepository from '../../../../modules/auth/auth.repository';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return jsonResponse({ success: false, message: 'No autenticado' }, 401, cors.headers);
    }

    const dbUser = await authRepository.findUserById(user.sub);

    if (!dbUser) {
      return jsonResponse({ success: false, message: 'Usuario no encontrado' }, 404, cors.headers);
    }

    const { password_hash: _pw, ...safeUser } = dbUser;

    return jsonResponse(
      {
        success: true,
        data: {
          id: safeUser.id,
          email: safeUser.email,
          firstName: safeUser.first_name,
          lastName: safeUser.last_name,
          phone: safeUser.phone,
          role: user.role,
          permissions: user.permissions || [],
        },
      },
      200,
      cors.headers
    );
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error al obtener usuario' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
