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
    async function checkAuth() {
      // Check admin session cookie (set by main login)
      try {
        const res = await fetch('/api/admin/session')
        if (res.ok) {
          setIsAuthenticated(true)
          setRole('admin')
          setPayload({}) // Cookie handles auth — no password needed in request body
          setIsLoading(false)
          return
        }
      } catch (e) { console.error('Admin session check failed:', e) }

      // Check puncture manager auth (localStorage)
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
    }

    checkAuth()
  }, [router])

  const logout = () => {
    if (role === 'admin') {
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
