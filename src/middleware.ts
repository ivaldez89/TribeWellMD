import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/about', '/privacy', '/terms', '/login', '/register', '/investors', '/partners', '/accessibility', '/support', '/feedback', '/faq'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if current path is a public route (exact match)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('tribewellmd-auth');

  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|login).*)',
  ],
};
