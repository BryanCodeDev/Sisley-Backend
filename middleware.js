import { NextResponse } from 'next/server';

function getTokenFromRequest(request) {
  const cookie = request.cookies.get('sisley_token');
  return cookie ? cookie.value : null;
}

function normalizeOrigin(origin) {
  if (!origin) return '';
  return origin.replace(/\/$/, '');
}

function extractHostname(url) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.startsWith('www.')) {
      return hostname.substring(4);
    }
    return hostname;
  } catch {
    const cleaned = url.replace(/\/$/, '').split(':')[0];
    if (cleaned.startsWith('www.')) {
      return cleaned.substring(4);
    }
    return cleaned;
  }
}

function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://sisleyy.netlify.app,http://localhost:3000';
  return raw.split(',').map(o => normalizeOrigin(o));
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  const normalizedOrigin = normalizeOrigin(origin);
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  const originHostname = extractHostname(normalizedOrigin);
  const allowedHostnames = allowedOrigins.map(o => extractHostname(o));

  return allowedHostnames.includes(originHostname);
}

function getCorsHeaders(origin) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin || !isOriginAllowed(origin)) {
    return null;
  }

  return new Headers({
    'Access-Control-Allow-Origin': normalizedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
    'Access-Control-Allow-Credentials': 'true',
  });
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  console.log(`[MIDDLEWARE] ${request.method} ${pathname} origin=${origin}`);

  if (request.method === 'OPTIONS') {
    if (!corsHeaders) {
      console.log(`[CORS] OPTIONS rechazado ${pathname} origin=${origin}`);
      return new NextResponse(null, { status: 403 });
    }
    console.log(`[CORS] OPTIONS preflight ${pathname} origin=${origin}`);
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  if (pathname.startsWith('/admin')) {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next();

  if (corsHeaders) {
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    console.log(`[CORS] ${request.method} ${pathname} origin=${origin}`);
  } else if (origin) {
    const allowed = getAllowedOrigins();
    console.log(`[CORS] BLOQUEADO ${pathname} origin=${origin}`);
    console.log(`[CORS] Origen permitidos: ${JSON.stringify(allowed)}`);
    console.log(`[CORS] Hostname permitidos: ${JSON.stringify(allowed.map(o => extractHostname(o)))}`);
    console.log(`[CORS] Origin hostname: ${extractHostname(origin)}`);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
