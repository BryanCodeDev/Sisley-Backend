import { handleCors, jsonResponse } from '../../../utils';
import { requirePermission } from '../../../middleware/requirePermission';
import { logAudit } from '../../../utils/audit';
import { getPool } from '../../../database/connection';

const mapRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  action: row.action,
  module: row.module,
  recordId: row.record_id,
  oldValues: row.old_values,
  newValues: row.new_values,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
  createdAt: row.created_at,
});

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const authResult = await requirePermission(request, 'reports.read');
    if (!authResult.authorized) {
      return jsonResponse({ success: false, message: authResult.message }, authResult.status, cors.headers);
    }

    const pool = getPool();
    const { searchParams } = new URL(request.url);

    const conditions = [];
    const params = [];

    const module = searchParams.get('module');
    if (module) {
      conditions.push('module = ?');
      params.push(module);
    }

    const action = searchParams.get('action');
    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    const userId = searchParams.get('userId');
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '50', 10), 100));
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total FROM audit_logs ${where}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0] ? parseInt(countRows[0].total, 10) : 0;

    const query = `
      SELECT 
        id, user_id, action, module, record_id, old_values, new_values, ip_address, user_agent, created_at
      FROM audit_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, limit, offset]);
    const items = rows.map(mapRow);

    return jsonResponse(
      {
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      200,
      cors.headers
    );
  } catch (error) {
    console.error('[AUDIT-LOGS] GET error:', error.message);
    return jsonResponse({ success: false, message: error.message || 'Error al obtener logs de auditoría' }, 500, cors.headers);
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
