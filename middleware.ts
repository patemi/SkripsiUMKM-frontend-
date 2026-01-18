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

  // Proteksi route /admin dan semua sub-routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Cek token dari cookie (set saat login)
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !isTokenValid(token)) {
      // Tidak ada token atau token tidak valid, redirect ke login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
