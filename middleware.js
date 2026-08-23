import { NextResponse } from 'next/server';

function getTokenFromRequest(request) {
  const cookie = request.cookies.get('sisley_token');
  return cookie ? cookie.value : null;
}

function normalizeOrigin(origin) {
  if (!origin) return '';
  return origin.replace(/\/$/, '');
}

function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://sisleyy.netlify.app,http://localhost:3000';
  return raw.split(',').map(o => normalizeOrigin(o));
}

function getCorsHeaders(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  const allowedOrigins = getAllowedOrigins();

  if (!normalizedOrigin || !allowedOrigins.includes(normalizedOrigin)) {
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
    console.log(`[CORS] Sin headers ${pathname} origin=${origin} allowed=${JSON.stringify(getAllowedOrigins())}`);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
