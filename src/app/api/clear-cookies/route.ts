import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  // Create response that will delete all cookies
  const response = NextResponse.json({
    message: 'All cookies cleared',
    clearedCount: allCookies.length,
    cookies: allCookies.map(c => c.name)
  });

  // Delete each cookie
  allCookies.forEach(cookie => {
    response.cookies.delete(cookie.name);
  });

  return response;
}
