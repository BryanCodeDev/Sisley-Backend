import { NextResponse } from 'next/server';
import { handleCors, jsonResponse } from '../../../../../utils';
import authCustomerService from '../../../../../modules/auth-customer/auth-customer.service';

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({ success: false, message: 'Email y contraseña son requeridos' }, 400, cors.headers);
    }

    const result = await authCustomerService.login(email, password);

    const response = NextResponse.json(
      { success: true, data: result },
      {
        status: 200,
        headers: cors.headers,
      }
    );

    response.cookies.set('sisley_customer_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || 'Error en el login' }, 401, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
