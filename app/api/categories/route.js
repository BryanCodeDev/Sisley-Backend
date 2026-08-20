import { handleCors, jsonResponse } from '../../../utils';
import categoryService from '../../../modules/categories/category.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      status: searchParams.get('status') || 'active',
      search: searchParams.get('search') || '',
      orderBy: searchParams.get('orderBy') || 'position',
    };

    const { items, total } = await categoryService.listCategories(filters);

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
    console.error('[CATEGORIES] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener categorías' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'categories.create');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const category = await categoryService.createCategory(body);
    await logAudit(authResult.user.sub, 'create_category', 'categories', String(category.id), null, { name: category.name });
    return jsonResponse({ success: true, data: category }, 201, cors.headers);
  } catch (error) {
    console.error('[CATEGORIES] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al crear categoría' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
