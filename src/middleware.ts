import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Public routes that don't require authentication
const publicRoutes = ['/', '/about', '/privacy', '/terms', '/login', '/register', '/forgot-password', '/reset-password', '/investors', '/partners', '/accessibility', '/support', '/feedback', '/faq', '/impact', '/impact/local'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for API routes and auth callback
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Check if current path is a public route (exact match)
  if (publicRoutes.includes(pathname)) {
    // Still update session for public routes (keeps session fresh)
    return await updateSession(request);
  }

  // Update Supabase session and check auth
  const response = await updateSession(request);

  // Check for Supabase auth cookie (sb-* cookies)
  const hasSupabaseAuth = request.cookies.getAll().some(cookie =>
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  );

  // Also check legacy cookie for backwards compatibility
  const legacyAuthCookie = request.cookies.get('tribewellmd-auth');

  if (hasSupabaseAuth || legacyAuthCookie?.value === 'authenticated') {
    return response;
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
