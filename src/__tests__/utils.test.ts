import { describe, it, expect, beforeEach } from 'vitest'
import { cn } from '@/lib/utils'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getDistrictColor, getDistrictName } from '@/lib/districts'

// =====================
// cn (className utility)
// =====================
describe('cn - className utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })
})

// =====================
// Rate Limiter
// =====================
describe('checkRateLimit', () => {
  it('allows first request', () => {
    const result = checkRateLimit('test-ip-1', { maxRequests: 5, windowMs: 60000 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('decrements remaining count', () => {
    const id = crypto.randomUUID()
    const result1 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result1.remaining).toBe(2)

    const result2 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result2.remaining).toBe(1)

    const result3 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result3.remaining).toBe(0)
  })

  it('blocks requests after limit exceeded', () => {
    const id = crypto.randomUUID()
    for (let i = 0; i < 3; i++) {
      checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    }
    const result = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('uses default options if not provided', () => {
    const id = crypto.randomUUID()
    const result = checkRateLimit(id)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = {
      headers: { get: (name: string) => name === 'x-forwarded-for' ? '192.168.1.1, 10.0.0.1' : null }
    } as unknown as Request
    expect(getClientIp(request)).toBe('192.168.1.1')
  })

  it('falls back to x-real-ip', () => {
    const request = {
      headers: { get: (name: string) => name === 'x-real-ip' ? '10.0.0.1' : null }
    } as unknown as Request
    expect(getClientIp(request)).toBe('10.0.0.1')
  })

  it('returns unknown when no IP headers', () => {
    const request = { headers: { get: () => null } } as unknown as Request
    expect(getClientIp(request)).toBe('unknown')
  })
})

// =====================
// District utilities
// =====================
describe('getDistrictColor', () => {
  const mockDistricts = [
    { id: '1', code: 'north', name: 'צפון', color: '#FF0000' },
    { id: '2', code: 'south', name: 'דרום', color: '#00FF00' },
    { id: '3', code: 'center', name: 'מרכז', color: '#0000FF' },
  ]

  it('returns correct color for valid district', () => {
    expect(getDistrictColor('north', mockDistricts)).toBe('#FF0000')
    expect(getDistrictColor('south', mockDistricts)).toBe('#00FF00')
    expect(getDistrictColor('center', mockDistricts)).toBe('#0000FF')
  })

  it('returns gray for null/undefined district', () => {
    expect(getDistrictColor(null, mockDistricts)).toBe('#6b7280')
    expect(getDistrictColor(undefined, mockDistricts)).toBe('#6b7280')
  })

  it('returns gray for unknown district', () => {
    expect(getDistrictColor('unknown', mockDistricts)).toBe('#6b7280')
  })

  it('returns a valid hex color string', () => {
    expect(getDistrictColor('north', mockDistricts)).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

describe('getDistrictName', () => {
  const mockDistricts = [
    { id: '1', code: 'north', name: 'צפון', color: '#FF0000' },
    { id: '2', code: 'south', name: 'דרום', color: '#00FF00' },
  ]

  it('returns correct name for valid district', () => {
    expect(getDistrictName('north', mockDistricts)).toBe('צפון')
    expect(getDistrictName('south', mockDistricts)).toBe('דרום')
  })

  it('returns "ללא מחוז" for null/undefined', () => {
    expect(getDistrictName(null, mockDistricts)).toBe('ללא מחוז')
    expect(getDistrictName(undefined, mockDistricts)).toBe('ללא מחוז')
  })

  it('returns the code itself for unknown district', () => {
    expect(getDistrictName('unknown', mockDistricts)).toBe('unknown')
  })
})
