import { handleCors, jsonResponse } from '../../../../utils';
import categoryService from '../../../../modules/categories/category.service';

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const category = await categoryService.getCategory(id);

    if (!category) {
      return jsonResponse({ success: false, message: 'Categoría no encontrada' }, 404, cors.headers);
    }

    return jsonResponse({ success: true, data: category }, 200, cors.headers);
  } catch (error) {
    console.error('[CATEGORIES] GET by id error:', error.message);
    return jsonResponse({ success: false, message: 'Error al obtener categoría' }, 500, cors.headers);
  }
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const body = await request.json();
    const category = await categoryService.updateCategory(id, body);
    return jsonResponse({ success: true, data: category }, 200, cors.headers);
  } catch (error) {
    console.error('[CATEGORIES] PUT error:', error.message);
    const status = error.message === 'Categoría no encontrada' ? 404 : 400;
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar categoría' }, status, cors.headers);
  }
}

export async function DELETE(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    await categoryService.deleteCategory(id);
    return jsonResponse({ success: true, message: 'Categoría desactivada correctamente' }, 200, cors.headers);
  } catch (error) {
    console.error('[CATEGORIES] DELETE error:', error.message);
    return jsonResponse({ success: false, message: 'Error al eliminar categoría' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
