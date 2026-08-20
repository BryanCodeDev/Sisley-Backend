import { NextResponse } from 'next/server';
import { verifyToken } from './modules/auth/auth.service';
import { jsonResponse } from './utils';

function getTokenFromRequest(request) {
  const cookie = request.cookies.get('sisley_token');
  return cookie ? cookie.value : null;
}

function isPublicPath(pathname) {
  const publicPaths = ['/api/auth/login', '/api/auth/logout', '/api/health', '/api/categories', '/api/products', '/api/customers', '/api/orders'];
  return publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

function isAdminPath(pathname) {
  return pathname.startsWith('/admin') || pathname.startsWith('/api/');
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('sisley_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(decoded.sub));
  requestHeaders.set('x-user-email', decoded.email);
  requestHeaders.set('x-user-role', decoded.role);
  requestHeaders.set('x-user-permissions', decoded.permissions ? decoded.permissions.join(',') : '');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
