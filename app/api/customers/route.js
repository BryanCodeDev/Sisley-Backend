import { handleCors, jsonResponse } from '../../../utils';
import customerService from '../../../modules/customers/customer.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || '',
      search: searchParams.get('search') || '',
      orderBy: searchParams.get('orderBy') || 'newest',
    };

    const { items, total } = await customerService.listCustomers(filters);

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
    console.error('[CUSTOMERS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener clientes' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'register') {
      const body = await request.json();
      const { firstName, lastName, email, password, phone, documentType, documentNumber } = body;

      if (!firstName || !lastName || !email || !password) {
        return jsonResponse({ success: false, message: 'Nombre, apellido, email y contraseña son requeridos' }, 400, cors.headers);
      }

      const existing = await customerService.listCustomers({ search: email });
      const emailExists = existing.items.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return jsonResponse({ success: false, message: 'Ya existe un cliente con ese email' }, 400, cors.headers);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const customer = await customerService.createCustomer({
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        documentType: documentType || null,
        documentNumber: documentNumber || null,
        status: 'active',
      });

      const { password_hash, ...safeCustomer } = customer;
      return jsonResponse({ success: true, data: safeCustomer }, 201, cors.headers);
    }

    const authResult = await requirePermission(request, 'customers.create');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const customer = await customerService.createCustomer(body);
    await logAudit(authResult.user.sub, 'create_customer', 'customers', String(customer.id), null, { email: customer.email });
    return jsonResponse({ success: true, data: customer }, 201, cors.headers);
  } catch (error) {
    console.error('[CUSTOMERS] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear cliente' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
