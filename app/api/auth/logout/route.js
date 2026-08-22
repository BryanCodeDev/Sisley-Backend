import { NextResponse } from 'next/server';
import { handleCors, jsonResponse } from '../../../../utils';
import { verifyToken } from '../../../../modules/auth/auth.service';
import { logAudit } from '../../../../utils/audit';

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const token = request.cookies.get('sisley_token')?.value;

    if (!token) {
      return jsonResponse({ success: true, message: 'Sesión cerrada' }, 200, cors.headers);
    }

    const decoded = await verifyToken(token);

    if (decoded) {
      await logAudit(decoded.sub, 'logout', 'auth', null, null, { email: decoded.email });
    }

    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada' },
      {
        status: 200,
        headers: cors.headers,
      }
    );
    response.cookies.set('sisley_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada' },
      {
        status: 200,
        headers: cors.headers,
      }
    );
    response.cookies.set('sisley_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
