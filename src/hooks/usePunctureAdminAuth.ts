'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type PunctureAdminRole = 'admin' | 'puncture_manager'

interface PunctureAdminAuth {
  isAuthenticated: boolean
  role: PunctureAdminRole | null
  isLoading: boolean
  authPayload: () => Record<string, string>
  logout: () => void
}

export function usePunctureAdminAuth(): PunctureAdminAuth {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<PunctureAdminRole | null>(null)
  const [payload, setPayload] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check full admin first
    const adminAuth = localStorage.getItem('wheels_admin_auth')
    if (adminAuth) {
      try {
        const { expiry, pwd } = JSON.parse(adminAuth)
        if (expiry && new Date().getTime() < expiry) {
          setIsAuthenticated(true)
          setRole('admin')
          setPayload({ admin_password: pwd ?? '' })
          setIsLoading(false)
          return
        }
      } catch { /* ignore */ }
    }
    // Check puncture manager auth
    const pmAuth = localStorage.getItem('puncture_manager_auth')
    if (pmAuth) {
      try {
        const { expiry, phone, password } = JSON.parse(pmAuth)
        if (expiry && new Date().getTime() < expiry) {
          setIsAuthenticated(true)
          setRole('puncture_manager')
          setPayload({ pm_phone: phone, pm_password: password })
          setIsLoading(false)
          return
        } else {
          localStorage.removeItem('puncture_manager_auth')
        }
      } catch {
        localStorage.removeItem('puncture_manager_auth')
      }
    }
    setIsLoading(false)
    router.push('/admin/punctures/login')
  }, [router])

  const logout = () => {
    if (role === 'admin') {
      // Full admin: just navigate away, keep the main admin session active
      router.push('/admin')
      return
    }
    localStorage.removeItem('puncture_manager_auth')
    setIsAuthenticated(false)
    setRole(null)
    router.push('/admin/punctures/login')
  }

  return { isAuthenticated, role, isLoading, authPayload: () => payload, logout }
}
