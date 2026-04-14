/**
 * Admin authentication utilities
 * Centralized admin password management
 */

import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'

// Server-side admin password (for API routes)
export const WHEELS_ADMIN_PASSWORD = process.env.WHEELS_ADMIN_PASSWORD

// Client-side admin password (for admin pages)
export const WHEELS_ADMIN_PASSWORD_CLIENT = process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD

/**
 * Verify admin password (server-side, sync)
 * Returns true if password matches the static admin password
 */
export function verifyAdminPassword(password: string | null): boolean {
  if (!WHEELS_ADMIN_PASSWORD) {
    throw new Error('WHEELS_ADMIN_PASSWORD environment variable is not configured')
  }
  return password === WHEELS_ADMIN_PASSWORD
}

/**
 * Verify admin auth (server-side, async)
 * Accepts EITHER the static WHEELS_ADMIN_PASSWORD
 * OR the personal password of a unified admin user (users table + user_roles with role='admin')
 */
export async function verifyAdminAuth(adminPassword: string | null): Promise<boolean> {
  const trimmedPassword = adminPassword?.trim() || null
  // First check static admin password (fast path)
  if (WHEELS_ADMIN_PASSWORD && trimmedPassword === WHEELS_ADMIN_PASSWORD.trim()) return true
  if (!trimmedPassword) return false

  // Check if this is a valid unified admin user's password
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all active admin users with their passwords
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
 * Verify admin password (client-side)
 * Returns true if password matches, false otherwise
 */
export function verifyAdminPasswordClient(password: string): boolean {
  if (!WHEELS_ADMIN_PASSWORD_CLIENT) {
    console.error('NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD environment variable is not configured')
    return false
  }
  return password === WHEELS_ADMIN_PASSWORD_CLIENT
}
