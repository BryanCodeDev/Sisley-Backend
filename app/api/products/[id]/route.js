import { handleCors, jsonResponse } from '../../../../utils';
import productService from '../../../../modules/products/product.service';
import { requirePermission } from '../../../../middleware/requirePermission';
import { logAudit } from '../../../../utils/audit';

export async function GET(request, { params }) {
  const cors = await handleCors(request);
  try {
    const { id } = params;
    const product = await productService.getProduct(id);

    if (!product) {
      return jsonResponse({ success: false, message: 'Producto no encontrado' }, 404, cors.headers);
    }

    return jsonResponse({ success: true, data: product }, 200, cors.headers);
  } catch (error) {
    console.error('[PRODUCTS] GET by id error:', error.message);
    return jsonResponse({ success: false, message: 'Error al obtener producto' }, 500, cors.headers);
  }
}

export async function PUT(request, { params }) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'products.update');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const { id } = params;
    const body = await request.json();
    const product = await productService.updateProduct(id, body);
    await logAudit(authResult.user.sub, 'update_product', 'products', String(product.id), null, { name: product.name });
    return jsonResponse({ success: true, data: product }, 200, cors.headers);
  } catch (error) {
    console.error('[PRODUCTS] PUT error:', error.message);
    const status = error.message === 'Producto no encontrado' ? 404 : 400;
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar producto' }, status, cors.headers);
  }
}

export async function DELETE(request, { params }) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'products.delete');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const { id } = params;
    await productService.deleteProduct(id);
    await logAudit(authResult.user.sub, 'delete_product', 'products', id, null, null);
    return jsonResponse({ success: true, message: 'Producto desactivado correctamente' }, 200, cors.headers);
  } catch (error) {
    console.error('[PRODUCTS] DELETE error:', error.message);
    return jsonResponse({ success: false, message: 'Error al eliminar producto' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
