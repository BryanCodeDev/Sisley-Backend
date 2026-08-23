import { NextResponse } from 'next/server';
import config from './config';

function getTokenFromRequest(request) {
  const cookie = request.cookies.get('sisley_token');
  return cookie ? cookie.value : null;
}

function getCorsHeaders(origin) {
  const allowedOrigins = (config.frontendUrl || 'http://localhost:3000').split(',');

  if (!origin || !allowedOrigins.includes(origin)) {
    return null;
  }

  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
    'Access-Control-Allow-Credentials': 'true',
  });
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    if (!corsHeaders) {
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
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
