import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware that refreshes the Supabase session for all routes,
 * and restricts /admin/* routes to authenticated admin users.
 */
export async function middleware(request: NextRequest) {
  // Update Supabase session cookies
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Simple in‑memory rate limiting for auth requests (5 attempts per minute per IP)
  if (pathname.startsWith('/api/auth') && request.method === 'POST') {
    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const globalAny = globalThis as any;
    globalAny.__authRateLimit = globalAny.__authRateLimit || {};
    const store = globalAny.__authRateLimit;
    const record = store[ip] || { count: 0, firstAttempt: now };
    if (now - record.firstAttempt > 60_000) {
      // Reset after a minute
      record.count = 1;
      record.firstAttempt = now;
    } else {
      record.count += 1;
    }
    store[ip] = record;
    if (record.count > 5) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow public admin login and API auth routes
    if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/auth')) {
      return response;
    }

    // Create a Supabase client scoped to this request to read session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no authenticated user, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images / media files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};