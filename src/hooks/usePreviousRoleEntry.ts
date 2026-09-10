'use client'

import { useEffect, useState } from 'react'
import type { RoleResult } from '@/lib/types'
import { resolveActiveRoleEntry } from '@/hooks/useRoleSwitch'

// Resolves which role (if any) the user switched away from most recently — written
// to localStorage by useRoleSwitch.switchToRole() — so an exit-confirmation dialog
// can offer "switch back to X" as an explicit option instead of only exit/cancel.
export function usePreviousRoleEntry(authRoles: RoleResult[], activeRole: string): RoleResult | undefined {
  const [previousRoleEntry, setPreviousRoleEntry] = useState<RoleResult | undefined>(undefined)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('previous_role_snapshot')
      if (!raw || authRoles.length === 0) { setPreviousRoleEntry(undefined); return }
      const snap = JSON.parse(raw) as { role: string; subRole: string | null; stationId: string | null }
      if (snap.role === activeRole) { setPreviousRoleEntry(undefined); return }
      const entry = resolveActiveRoleEntry(authRoles, snap.role, snap.subRole, snap.stationId)
      setPreviousRoleEntry(entry && entry.role === snap.role ? entry : undefined)
    } catch { setPreviousRoleEntry(undefined) }
  }, [authRoles, activeRole])

  return previousRoleEntry
}
