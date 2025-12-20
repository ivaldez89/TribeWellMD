import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple password protection
// Change these credentials as needed
const VALID_USERNAME = 'tribewellmd';
const VALID_PASSWORD = 'preview2024';

export function middleware(request: NextRequest) {
  // Skip auth for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('tribewellmd-auth');

  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Check for login attempt
  if (request.nextUrl.pathname === '/login') {
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
