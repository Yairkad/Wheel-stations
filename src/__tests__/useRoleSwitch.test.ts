import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { roleKey, useRoleSwitch, resolveActiveRoleEntry } from '@/hooks/useRoleSwitch'
import type { RoleResult } from '@/lib/types'

/**
 * roleKey + useRoleSwitch
 *
 * These consolidate what used to be 5 near-identical copies of role-switching
 * logic (AppHeader, operator/page, call-center/page, AdminSidebar, login page).
 * Tests focus on: (1) roleKey uniquely disambiguating same-role entries, and
 * (2) switchToRole writing the exact session shape each consumer page expects.
 */

function setLocation(href = 'http://localhost/') {
  const locationMock = { href }
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: locationMock,
  })
  return locationMock
}

describe('roleKey - מזהה ייחודי לרשומת תפקיד', () => {
  it('uses station_id as the disambiguator for station_manager', () => {
    const r: RoleResult = { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1' } }
    expect(roleKey(r)).toBe('station_manager:st-1')
  })

  it('uses call_center_id as the disambiguator for operator', () => {
    const r: RoleResult = { role: 'operator', label: 'מוקדן', data: { call_center_id: 'cc-1' } }
    expect(roleKey(r)).toBe('operator:cc-1')
  })

  it('falls back to sub_role when neither station_id nor call_center_id is present', () => {
    const r: RoleResult = { role: 'operator', label: 'מוקדן', data: { sub_role: 'manager' } }
    expect(roleKey(r)).toBe('operator:manager')
  })

  it('falls back to an empty disambiguator when nothing distinguishes the entry', () => {
    const r: RoleResult = { role: 'admin', label: 'ניהול מערכת', data: {} }
    expect(roleKey(r)).toBe('admin:')
  })

  it('produces distinct keys for two operator entries at different call centers (the case this was built for)', () => {
    const a: RoleResult = { role: 'operator', label: 'מוקדן', data: { call_center_id: 'cc-1' } }
    const b: RoleResult = { role: 'operator', label: 'מוקדן', data: { call_center_id: 'cc-2' } }
    expect(roleKey(a)).not.toBe(roleKey(b))
  })

  it('prefers station_id over call_center_id/sub_role if a data object somehow has both', () => {
    const r: RoleResult = { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1', call_center_id: 'cc-9', sub_role: 'x' } }
    expect(roleKey(r)).toBe('station_manager:st-1')
  })
})

describe('useRoleSwitch - קריאת מצב מ-localStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty when nothing is stored', () => {
    const { result } = renderHook(() => useRoleSwitch())
    expect(result.current.authRoles).toEqual([])
    expect(result.current.activeRole).toBe('')
    expect(result.current.switchingRole).toBe(false)
  })

  it('loads authRoles/activeRole/activeSubRole from localStorage on mount', () => {
    const roles: RoleResult[] = [
      { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1' } },
      { role: 'operator', label: 'מוקדן', data: { call_center_id: 'cc-1', sub_role: 'operator' } },
    ]
    localStorage.setItem('auth_roles', JSON.stringify(roles))
    localStorage.setItem('active_role', 'operator')
    localStorage.setItem('active_sub_role', 'operator')

    const { result } = renderHook(() => useRoleSwitch())
    expect(result.current.authRoles).toHaveLength(2)
    expect(result.current.activeRole).toBe('operator')
    expect(result.current.activeRoleEntry?.data.call_center_id).toBe('cc-1')
    expect(result.current.currentRoleLabel).toBe('מוקדן')
  })

  it('does not throw and falls back to empty when auth_roles is malformed JSON', () => {
    localStorage.setItem('auth_roles', '{not json')
    const { result } = renderHook(() => useRoleSwitch())
    expect(result.current.authRoles).toEqual([])
  })
})

describe('useRoleSwitch.switchToRole - כתיבת session ונווט', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('writes station_session_{id} and navigates to /{stationId} for station_manager', () => {
    const loc = setLocation()
    const { result } = renderHook(() => useRoleSwitch())
    const role: RoleResult = { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-42', station_name: 'תחנה לדוגמה' } }

    act(() => { result.current.switchToRole(role) })

    const saved = JSON.parse(localStorage.getItem('station_session_st-42')!)
    expect(saved.stationId).toBe('st-42')
    expect(saved.stationName).toBe('תחנה לדוגמה')
    expect(saved.manager.type).toBe('wheel_station')
    expect(loc.href).toBe('/st-42')
    expect(result.current.switchingToKey).toBe(roleKey(role))
  })

  it('writes operator_session with role="operator" and navigates to /operator for a plain operator', () => {
    const loc = setLocation()
    const { result } = renderHook(() => useRoleSwitch())
    const role: RoleResult = { role: 'operator', label: 'מוקדן', data: { id: 'u1', call_center_id: 'cc-1', call_center_name: 'מוקד א', sub_role: 'operator' } }

    act(() => { result.current.switchToRole(role) })

    const saved = JSON.parse(localStorage.getItem('operator_session')!)
    expect(saved.role).toBe('operator')
    expect(saved.callCenterId).toBe('cc-1')
    expect(loc.href).toBe('/operator')
  })

  it('routes a manager sub_role operator entry to /call-center instead of /operator', () => {
    const loc = setLocation()
    const { result } = renderHook(() => useRoleSwitch())
    const role: RoleResult = { role: 'operator', label: 'מוקדן', data: { id: 'u1', call_center_id: 'cc-1', sub_role: 'manager' } }

    act(() => { result.current.switchToRole(role) })

    const saved = JSON.parse(localStorage.getItem('operator_session')!)
    expect(saved.role).toBe('manager')
    expect(loc.href).toBe('/call-center')
  })

  it('writes super_manager_session and navigates to /super-manager for district_manager', () => {
    const loc = setLocation()
    const { result } = renderHook(() => useRoleSwitch())
    const role: RoleResult = { role: 'district_manager', label: 'מנהל מחוז', data: { id: 'u2', full_name: 'דנה', allowed_districts: ['מרכז'] } }

    act(() => { result.current.switchToRole(role) })

    const saved = JSON.parse(localStorage.getItem('super_manager_session')!)
    expect(saved.superManager.allowed_districts).toEqual(['מרכז'])
    expect(loc.href).toBe('/super-manager')
  })

  it('clears active_sub_role when the target role has no sub_role', () => {
    localStorage.setItem('active_sub_role', 'manager')
    setLocation()
    const { result } = renderHook(() => useRoleSwitch())
    const role: RoleResult = { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1' } }

    act(() => { result.current.switchToRole(role) })

    expect(localStorage.getItem('active_sub_role')).toBeNull()
  })

  it('persists active_station_id when switching to a station_manager entry, and clears it for other roles', () => {
    setLocation()
    const { result } = renderHook(() => useRoleSwitch())

    act(() => { result.current.switchToRole({ role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-7' } }) })
    expect(localStorage.getItem('active_station_id')).toBe('st-7')

    act(() => { result.current.switchToRole({ role: 'district_manager', label: 'מנהל מחוז', data: { id: 'u1', full_name: 'x' } }) })
    expect(localStorage.getItem('active_station_id')).toBeNull()
  })
})

describe('resolveActiveRoleEntry - זיהוי הרשומה הפעילה למנהל של כמה תחנות', () => {
  it('disambiguates two station_manager entries (2+ stations) by active_station_id, not just by role', () => {
    const roles: RoleResult[] = [
      { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1', station_name: 'תחנה א' } },
      { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-2', station_name: 'תחנה ב' } },
    ]
    const entry = resolveActiveRoleEntry(roles, 'station_manager', null, 'st-2')
    expect(entry?.data.station_id).toBe('st-2')
  })

  it('falls back to the first matching role when no active_station_id is stored (legacy sessions)', () => {
    const roles: RoleResult[] = [
      { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-1' } },
      { role: 'station_manager', label: 'מנהל תחנה', data: { station_id: 'st-2' } },
    ]
    const entry = resolveActiveRoleEntry(roles, 'station_manager', null, null)
    expect(entry?.data.station_id).toBe('st-1')
  })

  it('still disambiguates operator entries by sub_role exactly as before (no regression)', () => {
    const roles: RoleResult[] = [
      { role: 'operator', label: 'מוקדן', data: { call_center_id: 'cc-1', sub_role: 'operator' } },
      { role: 'operator', label: 'מנהל מוקד', data: { call_center_id: 'cc-1', sub_role: 'manager' } },
    ]
    const entry = resolveActiveRoleEntry(roles, 'operator', 'manager', null)
    expect(entry?.data.sub_role).toBe('manager')
  })
})
