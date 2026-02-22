import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function untuk decode JWT dan cek expiry
function isTokenValid(token: string): boolean {
  try {
    // Cek format token (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode payload (bagian tengah)
    const payload = JSON.parse(atob(parts[1]));

    // Cek expiry jika ada
    if (payload.exp) {
      const expiry = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        return false; // Token expired
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get('auth_token')?.value;
  const userToken = request.cookies.get('user_auth_token')?.value;

  const isAdminTokenValid = !!adminToken && isTokenValid(adminToken);
  const isUserTokenValid = !!userToken && isTokenValid(userToken);

  if (pathname === '/login' && isAdminTokenValid) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (pathname === '/user/login' && isUserTokenValid) {
    return NextResponse.redirect(new URL('/user/home', request.url));
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isUserProtectedRoute =
    pathname === '/user/home' ||
    pathname.startsWith('/user/home/') ||
    pathname === '/user/profile' ||
    pathname.startsWith('/user/profile/') ||
    pathname === '/user/favorites' ||
    pathname.startsWith('/user/favorites/') ||
    pathname === '/user/umkm/create' ||
    pathname.startsWith('/user/umkm/create/');

  // Proteksi route /admin dan semua sub-routes
  if (isAdminRoute) {
    if (!isAdminTokenValid) {
      // Tidak ada token atau token tidak valid, redirect ke login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteksi route user yang memerlukan login
  if (isUserProtectedRoute) {
    if (!isUserTokenValid) {
      const loginUrl = new URL('/user/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  if (isAdminRoute || isUserProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/user/login',
    '/admin',
    '/admin/:path*',
    '/user/home',
    '/user/home/:path*',
    '/user/profile',
    '/user/profile/:path*',
    '/user/favorites',
    '/user/favorites/:path*',
    '/user/umkm/create',
    '/user/umkm/create/:path*'
  ],
};
