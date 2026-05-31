import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle domain-based routing for admin.qualiflow.ai
 *
 * When deployed to admin.qualiflow.ai:
 * - Only /admin/* routes are accessible
 * - All other routes redirect to /admin/login
 * - X-Robots-Tag: noindex header is added to all responses
 *
 * On other domains (localhost, preview URLs):
 * - All routes are accessible (full app behavior)
 */

// Allowed path prefixes on the admin domain
const ADMIN_ALLOWED_PREFIXES = [
  '/admin',           // Admin routes
  '/api/auth',        // NextAuth API routes
  '/api/admin',       // Admin API routes (if any)
  '/_next',           // Next.js internals (JS/CSS bundles)
  '/favicon',         // Favicon variants
  '/monitoring',      // Sentry tunnel
  '/robots.txt',      // SEO robots file
];

// Static asset file extensions that should always be served
const STATIC_ASSET_EXTENSIONS = [
  '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif',
  '.css', '.js', '.map', '.woff', '.woff2', '.ttf', '.eot',
  '.json', '.xml', '.txt',
];

function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Detect admin domain (production or any admin. subdomain for preview)
  const isAdminDomain = hostname === 'admin.qualiflow.ai' || hostname.startsWith('admin.');

  if (isAdminDomain) {
    // Check if path is allowed on admin domain
    const isAllowedPrefix = ADMIN_ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isAsset = isStaticAsset(pathname);

    if (!isAllowedPrefix && !isAsset) {
      // Redirect non-admin routes to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Add security headers for admin domain
    const response = NextResponse.next();

    // Prevent search engines from indexing admin portal
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

    // Additional security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (root favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
