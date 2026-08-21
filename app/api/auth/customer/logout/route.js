import { handleCors, jsonResponse } from '../../../../../utils';

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const response = new Response(
      JSON.stringify({ success: true, message: 'Sesión cerrada' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...cors.headers } }
    );

    response.cookies.set('sisley_customer_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error al cerrar sesión' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
