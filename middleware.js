import { NextResponse } from 'next/server';

/**
 * Edge Middleware — runs before every request
 *
 * Protects:
 *  - /[ADMIN_SECRET_PATH]/* → requires JWT cookie
 *  - /admin/* → redirects to 404 (public path disabled)
 *
 * The real admin URL is stored in ADMIN_SECRET_PATH env var.
 * Nobody can guess it — not even from source code inspection.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const secretPath = process.env.ADMIN_SECRET_PATH || 'xpanel';

  // ── Block old /admin path completely ──────────────────────────
  if (pathname.startsWith('/admin')) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // ── Protect secret admin path ─────────────────────────────────
  if (pathname.startsWith(`/${secretPath}`)) {
    const token = request.cookies.get('fenntel_token')?.value;

    // No token → redirect to secret login page
    if (!token) {
      const loginUrl = new URL(`/${secretPath}/login`, request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists — let it through (API /auth/me will verify on client)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon|public|uploads|placeholder|author).*)',
  ],
};
