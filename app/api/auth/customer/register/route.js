import { NextResponse } from 'next/server';
import { handleCors, jsonResponse } from '../../../../../utils';
import authCustomerService from '../../../../../modules/auth-customer/auth-customer.service';

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, documentType, documentNumber } = body;

    if (!firstName || !lastName || !email || !password) {
      return jsonResponse({ success: false, message: 'Nombre, apellido, email y contraseña son requeridos' }, 400, cors.headers);
    }

    const existing = await authCustomerService.findByEmail(email);
    if (existing) {
      return jsonResponse({ success: false, message: 'Ya existe un cliente con ese email' }, 400, cors.headers);
    }

    const passwordHash = await require('bcryptjs').hash(password, 10);
    const customer = await authCustomerService.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      documentType: documentType || null,
      documentNumber: documentNumber || null,
      status: 'active',
    });

    const token = authCustomerService.generateToken(customer);
    const result = {
      token,
      customer: {
        ...customer,
        firstName: customer.first_name,
        lastName: customer.last_name,
        fullName: `${customer.first_name} ${customer.last_name}`,
      },
    };

    const response = NextResponse.json(
      { success: true, data: result },
      201,
      { headers: cors.headers }
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
    return jsonResponse({ success: false, message: error.message || 'Error al registrar cliente' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
