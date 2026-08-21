import { handleCors, jsonResponse } from '../../../utils';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';
import inventoryService from '../../../modules/inventory/inventory.service';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      variantId: searchParams.get('variantId') || '',
      storeId: searchParams.get('storeId') || '',
      warehouseId: searchParams.get('warehouseId') || '',
      lowStock: searchParams.get('lowStock') === 'true',
    };

    const items = await inventoryService.listInventory(filters);

    return jsonResponse(
      {
        success: true,
        data: items,
      },
      200,
      cors.headers
    );
  } catch (error) {
    console.error('[INVENTORY] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener inventario' }, 500, cors.headers);
  }
}

export async function POST(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'inventory.update');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const { variantId, storeId, warehouseId, quantity, type, reason } = body;

    if (!variantId || quantity === undefined || quantity === null || !type) {
      return jsonResponse({ success: false, message: 'variantId, quantity y type son requeridos' }, 400, cors.headers);
    }

    const result = await inventoryService.adjustStock(variantId, storeId || null, warehouseId || null, quantity, type, reason || null, authResult.user.sub);

    await logAudit(authResult.user.sub, 'adjust_stock', 'inventory', String(variantId), null, { type, quantity, newStock: result.newStock });

    return jsonResponse({ success: true, data: result }, 200, cors.headers);
  } catch (error) {
    console.error('[INVENTORY] POST error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al ajustar inventario' }, 400, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
