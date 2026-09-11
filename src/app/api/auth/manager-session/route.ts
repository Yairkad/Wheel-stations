import { NextRequest, NextResponse } from 'next/server'
import { MANAGER_SESSION_COOKIE, getManagerSessionFromRequest, revokeManagerSession } from '@/lib/manager-session'

// GET /api/auth/manager-session — check if the current manager session is still valid
export async function GET(request: NextRequest) {
  const session = await getManagerSessionFromRequest(request)
  if (session) {
    return NextResponse.json({ authenticated: true, role: session.role })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

// DELETE /api/auth/manager-session — logout: revoke the session in the DB, then clear the cookie
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(MANAGER_SESSION_COOKIE)?.value
  if (token) {
    await revokeManagerSession(token)
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(MANAGER_SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return response
}
