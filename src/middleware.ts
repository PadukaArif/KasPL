import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that do not require device authorization
const PUBLIC_PATHS = [
  '/enter-code',
  '/admin',
  '/api',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/icons',
  '/sw.js',
  '/workbox-',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware check for public assets, API routes, enter-code, and admin pages
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  // Check for device token in cookies
  const deviceToken = req.cookies.get('kaspl_device_token')?.value;

  if (!deviceToken) {
    const enterCodeUrl = new URL('/enter-code', req.url);
    enterCodeUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(enterCodeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, _next, favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
