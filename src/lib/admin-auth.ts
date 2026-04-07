/**
 * Admin authentication utilities
 * Centralized admin password management
 */

import { createClient } from '@supabase/supabase-js'

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

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('password', trimmedPassword)
    .eq('is_active', true)

  if (!users?.length) return false

  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('id')
    .in('user_id', users.map((u: { id: string }) => u.id))
    .eq('role', 'admin')
    .eq('is_active', true)
    .limit(1)

  return (adminRoles?.length ?? 0) > 0
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
