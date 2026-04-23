import { NextRequest, NextResponse } from 'next/server'
import { validateSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect core admin pages. Punctures section has its own auth system.
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/punctures')
  ) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!token || !await validateSessionToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
