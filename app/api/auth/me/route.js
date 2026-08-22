import { NextResponse } from 'next/server';
import { handleCors, jsonResponse } from '../../../../utils';
import { verifyToken } from '../../../../modules/auth/auth.service';

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

    const { password_hash: _pw, ...safeUser } = decoded;

    return jsonResponse(
      {
        success: true,
        data: {
          id: decoded.sub,
          email: decoded.email,
          firstName: decoded.first_name,
          lastName: decoded.last_name,
          phone: decoded.phone,
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
