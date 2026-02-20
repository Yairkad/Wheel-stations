import { describe, it, expect } from 'vitest'
import { getDistrictColor, getDistrictName } from '@/lib/districts'
import { VERSION, SESSION_VERSION } from '@/lib/version'

/**
 * Districts & Version Tests
 *
 * בדיקות אמיתיות על קוד האפליקציה:
 * - src/lib/districts.ts
 * - src/lib/version.ts
 *
 * מטרה: לוודא שהפונקציות לחישוב צבע/שם מחוז ומספר גרסה
 * עובדות תקין אחרי כל שינוי בקוד.
 */

// =====================
// VERSION
// =====================
describe('VERSION - גרסת האפליקציה', () => {
  it('is a valid semver string (X.Y.Z)', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('is a non-empty string', () => {
    expect(typeof VERSION).toBe('string')
    expect(VERSION.length).toBeGreaterThan(0)
  })
})

// =====================
// SESSION_VERSION
// =====================
describe('SESSION_VERSION - גרסת הסשן', () => {
  it('is a positive integer', () => {
    expect(typeof SESSION_VERSION).toBe('number')
    expect(Number.isInteger(SESSION_VERSION)).toBe(true)
    expect(SESSION_VERSION).toBeGreaterThan(0)
  })
})

// =====================
// getDistrictColor
// =====================
describe('getDistrictColor - צבע מחוז', () => {
  const mockDistricts = [
    { id: '1', code: 'north', name: 'צפון', color: '#FF0000' },
    { id: '2', code: 'south', name: 'דרום', color: '#00FF00' },
    { id: '3', code: 'center', name: 'מרכז', color: '#0000FF' },
  ]

  it('returns correct color for "north"', () => {
    expect(getDistrictColor('north', mockDistricts)).toBe('#FF0000')
  })

  it('returns correct color for "south"', () => {
    expect(getDistrictColor('south', mockDistricts)).toBe('#00FF00')
  })

  it('returns correct color for "center"', () => {
    expect(getDistrictColor('center', mockDistricts)).toBe('#0000FF')
  })

  it('returns default gray (#6b7280) for null district code', () => {
    expect(getDistrictColor(null, mockDistricts)).toBe('#6b7280')
  })

  it('returns default gray (#6b7280) for undefined district code', () => {
    expect(getDistrictColor(undefined, mockDistricts)).toBe('#6b7280')
  })

  it('returns default gray (#6b7280) for unknown district code', () => {
    expect(getDistrictColor('unknown-code', mockDistricts)).toBe('#6b7280')
  })

  it('returns a valid hex color string', () => {
    const color = getDistrictColor('north', mockDistricts)
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('returns hex color even when no districts array provided', () => {
    const color = getDistrictColor('north')
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

// =====================
// getDistrictName
// =====================
describe('getDistrictName - שם מחוז', () => {
  const mockDistricts = [
    { id: '1', code: 'north', name: 'צפון', color: '#FF0000' },
    { id: '2', code: 'south', name: 'דרום', color: '#00FF00' },
    { id: '3', code: 'center', name: 'מרכז', color: '#0000FF' },
  ]

  it('returns correct Hebrew name for "north"', () => {
    expect(getDistrictName('north', mockDistricts)).toBe('צפון')
  })

  it('returns correct Hebrew name for "south"', () => {
    expect(getDistrictName('south', mockDistricts)).toBe('דרום')
  })

  it('returns correct Hebrew name for "center"', () => {
    expect(getDistrictName('center', mockDistricts)).toBe('מרכז')
  })

  it('returns "ללא מחוז" for null district code', () => {
    expect(getDistrictName(null, mockDistricts)).toBe('ללא מחוז')
  })

  it('returns "ללא מחוז" for undefined district code', () => {
    expect(getDistrictName(undefined, mockDistricts)).toBe('ללא מחוז')
  })

  it('returns the code itself for unknown district', () => {
    expect(getDistrictName('unknown-code', mockDistricts)).toBe('unknown-code')
  })

  it('returns a non-empty string', () => {
    const name = getDistrictName('north', mockDistricts)
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })
})
