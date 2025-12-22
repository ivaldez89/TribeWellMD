import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Public routes that don't require authentication
const publicRoutes = ['/', '/about', '/privacy', '/terms', '/login', '/register', '/investors', '/partners', '/accessibility', '/support', '/feedback', '/faq', '/impact', '/impact/local'];

export async function middleware(request: NextRequest) {
  // Update Supabase session (refreshes auth tokens) and get user
  const { response, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Skip auth for API routes and auth callback
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return response;
  }

  // Check if current path is a public route (exact match)
  if (publicRoutes.includes(pathname)) {
    return response;
  }

  // Check for Supabase authenticated user
  if (user) {
    return response;
  }

  // Check for legacy auth cookie (for backwards compatibility during migration)
  const authCookie = request.cookies.get('tribewellmd-auth');
  if (authCookie?.value === 'authenticated') {
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
