/**
 * Server-validated session tokens for station/super/puncture managers.
 * DB-backed (see supabase/migrations/20260911_add_manager_sessions.sql) so a
 * specific login can be revoked remotely without touching the account password
 * — unlike admin-session.ts's stateless signed cookie, validity here is a DB
 * lookup, not a signature check.
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const MANAGER_SESSION_COOKIE = 'manager_session'
export const MANAGER_SESSION_MAX_AGE = 7 * 24 * 60 * 60 // seconds (a week)

export type ManagerSessionRole = 'station_manager' | 'super_manager' | 'puncture_manager'

export interface ManagerSessionIdentity {
  userId: string
  role: ManagerSessionRole
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Issues a new session for a manager and stores it. Returns the raw token to set as a cookie. */
export async function createManagerSession(userId: string, role: ManagerSessionRole): Promise<string> {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + MANAGER_SESSION_MAX_AGE * 1000).toISOString()

  await supabase.from('manager_sessions').insert({ token, user_id: userId, role, expires_at: expiresAt })
  // Opportunistic cleanup on new-session creation — fire-and-forget, doesn't block the response
  supabase.rpc('cleanup_expired_manager_sessions').then(() => {}, () => {})

  return token
}

/** Validates a raw token (not expired, not revoked) and bumps last_used_at on success. */
export async function validateManagerSession(token: string): Promise<ManagerSessionIdentity | null> {
  if (!token) return null

  const { data } = await supabase
    .from('manager_sessions')
    .select('user_id, role, expires_at, revoked_at')
    .eq('token', token)
    .single()

  if (!data || data.revoked_at || new Date(data.expires_at) < new Date()) return null

  // Fire-and-forget — a last_used_at that's stale by a few requests doesn't matter
  supabase.from('manager_sessions').update({ last_used_at: new Date().toISOString() }).eq('token', token).then(() => {}, () => {})

  return { userId: data.user_id, role: data.role as ManagerSessionRole }
}

/** Reads the session cookie off an incoming request and validates it. */
export async function getManagerSessionFromRequest(request: NextRequest): Promise<ManagerSessionIdentity | null> {
  const token = request.cookies.get(MANAGER_SESSION_COOKIE)?.value
  if (!token) return null
  return validateManagerSession(token)
}

/** Revokes a session by its raw token (used on logout). */
export async function revokeManagerSession(token: string): Promise<void> {
  if (!token) return
  await supabase.from('manager_sessions').update({ revoked_at: new Date().toISOString() }).eq('token', token)
}
