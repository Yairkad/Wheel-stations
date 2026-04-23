'use client'

import { useRouter } from 'next/navigation'

interface AdminAuth {
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

// Middleware validates the admin_session cookie before any /admin/* page loads.
// If this hook runs, the user is already authenticated — no localStorage check needed.
export function useAdminAuth(): AdminAuth {
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' })
    router.push('/')
  }

  return { isAuthenticated: true, isLoading: false, logout }
}
