import { handleCors, jsonResponse } from '../../../utils';
import reportsService from '../../../modules/reports/reports.service';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    let requiredPermission = 'reports.read';

    if (reportType === 'inventory') {
      requiredPermission = 'inventory.read';
    }

    const authResult = await requirePermission(request, requiredPermission);
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    if (reportType === 'inventory') {
      const data = await reportsService.getInventoryStatus();
      return jsonResponse({ success: true, data }, 200, cors.headers);
    }

    if (reportType === 'top-products') {
      const limit = searchParams.get('limit') || '10';
      const data = await reportsService.getTopSelling(limit);
      return jsonResponse({ success: true, data }, 200, cors.headers);
    }

    const period = searchParams.get('period') || 'day';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const data = await reportsService.getSales({ period, startDate, endDate });

    await logAudit(authResult.user.sub, 'view_sales_report', 'reports', null, null, { period, startDate, endDate });

    return jsonResponse({ success: true, data }, 200, cors.headers);
  } catch (error) {
    console.error('[REPORTS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener reportes' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
