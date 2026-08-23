const { createPool, getPool } = require('../database/connection');
const config = require('../config');

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
  'Access-Control-Allow-Credentials': 'true',
});

const allowedOrigins = (config.frontendUrl || 'http://localhost:3000').split(',');

function getCorsOrigin(requestOrigin) {
  if (requestOrigin) {
    if (allowedOrigins.includes(requestOrigin)) return requestOrigin;
  }
  return allowedOrigins[0] || '*';
}

async function handleCors(request) {
  const requestOrigin = request.headers.get('origin') || '';
  const origin = getCorsOrigin(requestOrigin);
  const headers = corsHeaders(origin);

  console.log(`[CORS] ${request.method} ${request.nextUrl?.pathname || request.url} origin=${requestOrigin} -> allow=${origin}`);

  if (request.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS preflight -> 204`);
    return new Response(null, { status: 204, headers });
  }

  return { origin, headers };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

async function withConnection(handler) {
  if (!getPool()) {
    createPool();
  }
  return handler(getPool());
}

async function checkDatabase() {
  if (!getPool()) {
    createPool();
  }
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT 1 AS db_ok');
    return rows[0] && rows[0].db_ok === 1;
  } catch (error) {
    console.error('[DB] Health check failed:', error.message);
    return false;
  }
}

module.exports = {
  handleCors,
  jsonResponse,
  withConnection,
  checkDatabase,
  corsHeaders,
  getCorsOrigin,
};
