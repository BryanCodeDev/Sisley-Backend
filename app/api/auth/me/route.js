import { handleCors, jsonResponse } from '../../../../utils';
import { verifyToken } from '../../../../modules/auth/auth.service';
import authRepository from '../../../../modules/auth/auth.repository';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const token = request.cookies.get('sisley_token')?.value;
    if (!token) {
      return jsonResponse({ success: false, message: 'No autenticado' }, 401, cors.headers);
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return jsonResponse({ success: false, message: 'Token inválido o expirado' }, 401, cors.headers);
    }

    const dbUser = await authRepository.findUserById(decoded.sub);

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
          role: decoded.role,
          permissions: decoded.permissions || [],
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
