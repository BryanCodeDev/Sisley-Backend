import { handleCors, jsonResponse } from '../../../utils';
import productService from '../../../modules/products/product.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'active',
      categoryId: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      orderBy: searchParams.get('orderBy') || 'featured',
      inStock: searchParams.get('inStock') || '',
    };

    const { items, total } = await productService.listProducts(filters);

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
    console.error('[PRODUCTS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener productos' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'products.create');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const product = await productService.createProduct(body);
    await logAudit(authResult.user.sub, 'create_product', 'products', String(product.id), null, { name: product.name });
    return jsonResponse({ success: true, data: product }, 201, cors.headers);
  } catch (error) {
    console.error('[PRODUCTS] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear producto' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
