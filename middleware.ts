import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Proteksi route /admin dan semua sub-routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Cek token dari cookie (set saat login)
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Tidak ada token, redirect ke login
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
