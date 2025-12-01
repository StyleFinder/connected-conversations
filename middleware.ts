import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes - root and cards require authentication
  if (req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/cards')) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to root (category selection) if already logged in and trying to access login
  if (req.nextUrl.pathname === '/login') {
    if (session) {
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/cards/:path*', '/login'],
};
