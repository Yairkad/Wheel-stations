'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuth {
  isAuthenticated: boolean
  password: string
  isLoading: boolean
  logout: () => void
}

export function useAdminAuth(): AdminAuth {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedAuth = localStorage.getItem('wheels_admin_auth')
    if (savedAuth) {
      try {
        const { expiry, pwd } = JSON.parse(savedAuth)
        if (expiry && new Date().getTime() < expiry) {
          setIsAuthenticated(true)
          setPassword(pwd || '')
        } else {
          localStorage.removeItem('wheels_admin_auth')
          router.push('/admin/login')
        }
      } catch {
        localStorage.removeItem('wheels_admin_auth')
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
    setIsLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem('wheels_admin_auth')
    setIsAuthenticated(false)
    setPassword('')
    router.push('/admin/login')
  }

  return { isAuthenticated, password, isLoading, logout }
}
