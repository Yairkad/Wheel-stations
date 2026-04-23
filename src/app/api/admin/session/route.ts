import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/admin-auth'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

// GET /api/admin/session — check if session is valid (used by usePunctureAdminAuth)
export async function GET(request: NextRequest) {
  if (await validateAdminSession(request)) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

// DELETE /api/admin/session — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return response
}
