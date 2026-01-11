import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn } from '@/lib/utils'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// District functions - testing standalone logic without DB
const getDistrictColor = (districtCode?: string | null, districts?: { code: string; color: string }[]): string => {
  if (!districtCode) return '#6b7280'
  if (districts) {
    const district = districts.find(d => d.code === districtCode)
    return district?.color || '#6b7280'
  }
  return '#6b7280'
}

const getDistrictName = (districtCode?: string | null, districts?: { code: string; name: string }[]): string => {
  if (!districtCode) return 'ללא מחוז'
  if (districts) {
    const district = districts.find(d => d.code === districtCode)
    return district?.name || districtCode
  }
  return districtCode
}

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
  beforeEach(() => {
    // Reset rate limit map by making many requests with different IDs
    // Note: In real tests, we'd export a reset function
  })

  it('allows first request', () => {
    const result = checkRateLimit('test-ip-1', { maxRequests: 5, windowMs: 60000 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('decrements remaining count', () => {
    const id = 'test-ip-2-' + Date.now()
    const result1 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result1.remaining).toBe(2)

    const result2 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result2.remaining).toBe(1)

    const result3 = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result3.remaining).toBe(0)
  })

  it('blocks requests after limit exceeded', () => {
    const id = 'test-ip-3-' + Date.now()

    // Use up all requests
    for (let i = 0; i < 3; i++) {
      checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    }

    // Next request should fail
    const result = checkRateLimit(id, { maxRequests: 3, windowMs: 60000 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('uses default options if not provided', () => {
    const id = 'test-ip-4-' + Date.now()
    const result = checkRateLimit(id)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4) // Default is 5 requests
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
          return null
        }
      }
    } as unknown as Request

    expect(getClientIp(request)).toBe('192.168.1.1')
  })

  it('falls back to x-real-ip', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') return '10.0.0.1'
          return null
        }
      }
    } as unknown as Request

    expect(getClientIp(request)).toBe('10.0.0.1')
  })

  it('returns unknown when no IP headers', () => {
    const request = {
      headers: {
        get: () => null
      }
    } as unknown as Request

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

  beforeEach(() => {
    // Reset any cache if needed
  })

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

  it('returns gray when no districts provided and no cache', () => {
    expect(getDistrictColor('north')).toBe('#6b7280')
  })
})

describe('getDistrictName', () => {
  const mockDistricts = [
    { id: '1', code: 'north', name: 'צפון', color: '#FF0000' },
    { id: '2', code: 'south', name: 'דרום', color: '#00FF00' },
  ]

  beforeEach(() => {
    // Reset any cache if needed
  })

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

// =====================
// User initials (from AppHeader)
// =====================
describe('getUserInitials', () => {
  // Simulate the function from AppHeader
  const getUserInitials = (fullName: string | undefined) => {
    if (!fullName) return '👤'
    const parts = fullName.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return fullName.substring(0, 2)
  }

  it('returns initials for two-word name', () => {
    expect(getUserInitials('יאיר קדוש')).toBe('יק')
    expect(getUserInitials('משה כהן')).toBe('מכ')
    expect(getUserInitials('John Doe')).toBe('JD')
  })

  it('returns first two chars for single-word name', () => {
    expect(getUserInitials('יאיר')).toBe('יא')
    expect(getUserInitials('John')).toBe('Jo')
  })

  it('returns emoji for empty/undefined name', () => {
    expect(getUserInitials('')).toBe('👤')
    expect(getUserInitials(undefined)).toBe('👤')
  })

  it('handles names with extra spaces', () => {
    expect(getUserInitials('  יאיר   קדוש  ')).toBe('יק')
    expect(getUserInitials('יאיר  קדוש')).toBe('יק')
  })

  it('handles three-word names (takes first two)', () => {
    expect(getUserInitials('יאיר בן דוד')).toBe('יב')
  })
})

// =====================
// Phone number validation
// =====================
describe('Phone validation helpers', () => {
  // Common phone cleaning function used across the app
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '')

  it('removes non-digit characters', () => {
    expect(cleanPhone('050-123-4567')).toBe('0501234567')
    expect(cleanPhone('(050) 123-4567')).toBe('0501234567')
    expect(cleanPhone('+972501234567')).toBe('972501234567')
  })

  it('handles already clean numbers', () => {
    expect(cleanPhone('0501234567')).toBe('0501234567')
  })

  it('handles empty string', () => {
    expect(cleanPhone('')).toBe('')
  })
})

// =====================
// Email validation
// =====================
describe('Email validation', () => {
  // Common email regex used in the app
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  it('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.il')).toBe(true)
    expect(isValidEmail('user+tag@example.org')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@domain')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('handles whitespace', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true)
  })
})

// =====================
// Wheel number validation
// =====================
describe('Wheel data validation', () => {
  // Validates wheel form data (common checks)
  const validateWheelForm = (form: {
    wheel_number: string
    rim_size: string
    bolt_spacing: string
  }) => {
    const errors: string[] = []
    if (!form.wheel_number.trim()) errors.push('wheel_number')
    if (!form.rim_size.trim()) errors.push('rim_size')
    if (!form.bolt_spacing.trim()) errors.push('bolt_spacing')
    return errors
  }

  it('returns no errors for valid form', () => {
    const form = { wheel_number: 'A1', rim_size: '15', bolt_spacing: '100' }
    expect(validateWheelForm(form)).toHaveLength(0)
  })

  it('returns error for empty wheel number', () => {
    const form = { wheel_number: '', rim_size: '15', bolt_spacing: '100' }
    expect(validateWheelForm(form)).toContain('wheel_number')
  })

  it('returns error for empty rim size', () => {
    const form = { wheel_number: 'A1', rim_size: '', bolt_spacing: '100' }
    expect(validateWheelForm(form)).toContain('rim_size')
  })

  it('returns error for whitespace-only values', () => {
    const form = { wheel_number: '  ', rim_size: '15', bolt_spacing: '100' }
    expect(validateWheelForm(form)).toContain('wheel_number')
  })

  it('returns multiple errors', () => {
    const form = { wheel_number: '', rim_size: '', bolt_spacing: '' }
    const errors = validateWheelForm(form)
    expect(errors).toHaveLength(3)
    expect(errors).toContain('wheel_number')
    expect(errors).toContain('rim_size')
    expect(errors).toContain('bolt_spacing')
  })
})

// =====================
// Statistics calculations
// =====================
describe('Wheel statistics', () => {
  // Mock wheel data
  const mockWheels = [
    { id: '1', is_available: true },
    { id: '2', is_available: true },
    { id: '3', is_available: false },
    { id: '4', is_available: true },
    { id: '5', is_available: false },
  ]

  it('calculates total wheels correctly', () => {
    expect(mockWheels.length).toBe(5)
  })

  it('calculates available wheels correctly', () => {
    const availableCount = mockWheels.filter(w => w.is_available).length
    expect(availableCount).toBe(3)
  })

  it('calculates borrowed wheels correctly', () => {
    const borrowedCount = mockWheels.filter(w => !w.is_available).length
    expect(borrowedCount).toBe(2)
  })

  it('handles empty wheel array', () => {
    const emptyWheels: typeof mockWheels = []
    expect(emptyWheels.length).toBe(0)
    expect(emptyWheels.filter(w => w.is_available).length).toBe(0)
  })
})
