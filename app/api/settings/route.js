import { handleCors, jsonResponse } from '../../../utils';
import settingsService from '../../../modules/settings/settings.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const settings = await settingsService.getAll();
    return jsonResponse({ success: true, data: settings }, 200, cors.headers);
  } catch (error) {
    console.error('[SETTINGS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener configuración' }, 500, cors.headers);
  }
}

export async function PUT(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'settings.update');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const body = await request.json();
    const { key, value, type, description } = body;

    if (!key || value === undefined) {
      return jsonResponse({ success: false, message: 'key y value son requeridos' }, 400, cors.headers);
    }

    const updated = await settingsService.update(key, value, type);

    await logAudit(authResult.user.sub, 'update_setting', 'settings', key, null, { key, value, type });

    return jsonResponse({ success: true, data: updated }, 200, cors.headers);
  } catch (error) {
    console.error('[SETTINGS] PUT error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al actualizar configuración' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
