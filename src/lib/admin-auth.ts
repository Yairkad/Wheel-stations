import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'
import { validateSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

/**
 * Verify admin auth by personal password (used by punctures system).
 * Checks only against DB — no static/generic passwords.
 */
export async function verifyAdminAuth(adminPassword: string | null): Promise<boolean> {
  const trimmedPassword = adminPassword?.trim() || null
  if (!trimmedPassword) return false

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('user_id, users!inner(id, password, is_active)')
    .eq('role', 'admin')
    .eq('is_active', true)

  if (!adminRoles?.length) return false

  for (const row of adminRoles) {
    const user = Array.isArray(row.users) ? row.users[0] : row.users as { id: string; password: string | null; is_active: boolean } | null
    if (!user || !user.is_active || !user.password) continue
    const pwCheck = await verifyPassword(trimmedPassword, user.password)
    if (pwCheck.valid) {
      if (pwCheck.newHash) {
        await supabase.from('users').update({ password: pwCheck.newHash }).eq('id', user.id)
      }
      return true
    }
  }

  return false
}

/**
 * Validate admin session cookie (server-side).
 * Use in API routes — cannot be bypassed by client-side manipulation.
 */
export async function validateAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return false
  return validateSessionToken(token)
}
