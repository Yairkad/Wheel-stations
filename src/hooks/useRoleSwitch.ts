'use client'

import { useState, useEffect, useCallback } from 'react'
import { SESSION_VERSION } from '@/lib/version'
import type { RoleResult } from '@/lib/types'

interface UseRoleSwitchResult {
  authRoles: RoleResult[]
  activeRole: string
  activeSubRole: string | null
  activeRoleEntry: RoleResult | undefined
  currentRoleLabel: string | undefined
  switchToRole: (role: RoleResult) => void
  switchingRole: boolean
  switchingToKey: string | null
}

function getRoleDisplay(role: string, label?: string): string {
  if (label) return label
  switch (role) {
    case 'admin': return 'מנהל מערכת'
    case 'station_manager': return 'מנהל תחנה'
    case 'district_manager': return 'מנהל מחוז'
    case 'editor': return 'עורך'
    case 'operator': return 'מוקדן'
    default: return 'משתמש'
  }
}

// Multiple RoleResult entries can share the same `role` (e.g. an operator working
// two call centers, or a manager of two stations) — `r.role` alone isn't a unique
// identifier. This gives every entry a stable per-entry key, used both as the React
// `key` and to track exactly which entry is mid-switch (so only the clicked one
// animates, not every row sharing its role).
export function roleKey(r: RoleResult): string {
  const d = r.data as Record<string, unknown>
  const disambiguator = (d.station_id ?? d.call_center_id ?? d.sub_role ?? '') as string
  return `${r.role}:${disambiguator}`
}

// Reads a person's roles + currently-active one from localStorage, and provides
// switchToRole() to persist a new session and navigate there. Single source of
// truth for what used to be 5 near-identical copies (AppHeader, operator page,
// call-center page, AdminSidebar, login page's post-auth role picker).
export function useRoleSwitch(): UseRoleSwitchResult {
  const [authRoles, setAuthRoles] = useState<RoleResult[]>([])
  const [activeRole, setActiveRole] = useState('')
  const [activeSubRole, setActiveSubRole] = useState<string | null>(null)
  const [switchingToKey, setSwitchingToKey] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_roles')
      if (stored) setAuthRoles(JSON.parse(stored))
    } catch { /* ignore */ }
    setActiveRole(localStorage.getItem('active_role') || '')
    setActiveSubRole(localStorage.getItem('active_sub_role'))
  }, [])

  const switchToRole = useCallback((r: RoleResult) => {
    setSwitchingToKey(roleKey(r))
    localStorage.setItem('active_role', r.role)
    if (r.data?.sub_role) localStorage.setItem('active_sub_role', r.data.sub_role as string)
    else localStorage.removeItem('active_sub_role')
    setActiveRole(r.role)
    setActiveSubRole((r.data?.sub_role as string) || null)

    const d = r.data
    const pwd = localStorage.getItem('auth_password') || ''
    // A hard navigation (not router.push) is deliberate: several role combinations
    // resolve to the exact same URL (e.g. two operator entries for different call
    // centers both land on /operator), so a client-side push would be a same-route
    // no-op — the page never remounts, its one-time session-read effect never
    // re-runs, and the user is left looking at the PREVIOUS role's data forever
    // while only the header's role chip updates. A full reload guarantees every
    // page re-reads the freshly-written session from scratch.
    switch (r.role) {
      case 'station_manager': {
        localStorage.setItem(`station_session_${d.station_id as string}`, JSON.stringify({
          manager: { ...d, type: 'wheel_station' },
          stationId: d.station_id,
          stationName: d.station_name,
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        window.location.href = `/${d.station_id as string}`
        break
      }
      case 'operator': {
        localStorage.setItem('operator_session', JSON.stringify({
          user: { id: d.id, full_name: d.full_name, phone: d.phone, title: d.title, is_primary: d.is_primary },
          role: d.sub_role === 'manager' ? 'manager' : 'operator',
          callCenterId: d.call_center_id,
          callCenterName: d.call_center_name,
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        window.location.href = d.sub_role === 'manager' ? '/call-center' : '/operator'
        break
      }
      case 'district_manager': {
        localStorage.setItem('super_manager_session', JSON.stringify({
          superManager: { id: d.id, full_name: d.full_name, phone: d.phone, allowed_districts: d.allowed_districts, can_edit: d.can_edit ?? false },
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        window.location.href = '/super-manager'
        break
      }
      case 'editor': {
        localStorage.setItem('puncture_manager_auth', JSON.stringify({
          expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          phone: d.phone,
          password: pwd,
        }))
        window.location.href = '/admin/punctures'
        break
      }
      case 'admin': {
        localStorage.setItem('wheels_admin_auth', JSON.stringify({
          expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          pwd,
        }))
        window.location.href = '/admin'
        break
      }
    }
  }, [])

  const activeRoleEntry = authRoles.find(r => {
    if (r.role !== activeRole) return false
    if (activeSubRole && r.data?.sub_role) return r.data.sub_role === activeSubRole
    return !activeSubRole
  }) ?? authRoles.find(r => r.role === activeRole) ?? authRoles[0]

  const currentRoleLabel = activeRoleEntry ? getRoleDisplay(activeRoleEntry.role, activeRoleEntry.label) : undefined

  return { authRoles, activeRole, activeSubRole, activeRoleEntry, currentRoleLabel, switchToRole, switchingRole: switchingToKey !== null, switchingToKey }
}
