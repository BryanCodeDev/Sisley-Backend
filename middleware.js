import { NextResponse } from 'next/server';

function getTokenFromRequest(request) {
  const cookie = request.cookies.get('sisley_token');
  return cookie ? cookie.value : null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-token', token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
