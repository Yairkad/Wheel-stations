/**
 * Admin authentication utilities
 * Centralized admin password management
 */

// Server-side admin password (for API routes)
export const WHEELS_ADMIN_PASSWORD = process.env.WHEELS_ADMIN_PASSWORD

// Client-side admin password (for admin pages)
export const WHEELS_ADMIN_PASSWORD_CLIENT = process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD

/**
 * Verify admin password (server-side)
 * Returns true if password matches, false otherwise
 * Throws error if WHEELS_ADMIN_PASSWORD is not configured
 */
export function verifyAdminPassword(password: string | null): boolean {
  if (!WHEELS_ADMIN_PASSWORD) {
    throw new Error('WHEELS_ADMIN_PASSWORD environment variable is not configured')
  }
  return password === WHEELS_ADMIN_PASSWORD
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
