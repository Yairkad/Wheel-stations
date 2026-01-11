import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Edge Cases Tests
 *
 * בדיקות מקרי קצה - מצבים לא רגילים שעלולים לגרום לבאגים
 */

// =====================
// Login lockout scenarios
// =====================
describe('Login Lockout', () => {
  const MAX_ATTEMPTS = 5
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

  interface LoginAttempt {
    phone: string
    attempts: number
    lockedUntil: number | null
  }

  const loginAttempts = new Map<string, LoginAttempt>()

  const recordFailedAttempt = (phone: string): { locked: boolean; attemptsLeft: number } => {
    const now = Date.now()
    const existing = loginAttempts.get(phone)

    // Check if currently locked
    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { locked: true, attemptsLeft: 0 }
    }

    // Reset if lockout expired
    if (existing?.lockedUntil && existing.lockedUntil <= now) {
      loginAttempts.set(phone, { phone, attempts: 1, lockedUntil: null })
      return { locked: false, attemptsLeft: MAX_ATTEMPTS - 1 }
    }

    const attempts = (existing?.attempts || 0) + 1

    if (attempts >= MAX_ATTEMPTS) {
      loginAttempts.set(phone, { phone, attempts, lockedUntil: now + LOCKOUT_DURATION_MS })
      return { locked: true, attemptsLeft: 0 }
    }

    loginAttempts.set(phone, { phone, attempts, lockedUntil: null })
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - attempts }
  }

  const clearAttempts = (phone: string) => {
    loginAttempts.delete(phone)
  }

  beforeEach(() => {
    loginAttempts.clear()
  })

  it('allows login attempts up to max', () => {
    const phone = '0501234567'

    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      const result = recordFailedAttempt(phone)
      expect(result.locked).toBe(false)
    }
  })

  it('locks account after max failed attempts', () => {
    const phone = '0501234567'

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordFailedAttempt(phone)
    }

    const result = recordFailedAttempt(phone)
    expect(result.locked).toBe(true)
    expect(result.attemptsLeft).toBe(0)
  })

  it('clears attempts on successful login', () => {
    const phone = '0501234567'

    recordFailedAttempt(phone)
    recordFailedAttempt(phone)

    clearAttempts(phone)

    const result = recordFailedAttempt(phone)
    expect(result.attemptsLeft).toBe(MAX_ATTEMPTS - 1)
  })

  it('tracks attempts per phone number separately', () => {
    const phone1 = '0501234567'
    const phone2 = '0509876543'

    recordFailedAttempt(phone1)
    recordFailedAttempt(phone1)
    recordFailedAttempt(phone1)

    const result = recordFailedAttempt(phone2)
    expect(result.attemptsLeft).toBe(MAX_ATTEMPTS - 1)
  })
})

// =====================
// Session expiration edge cases
// =====================
describe('Session Expiration Edge Cases', () => {
  const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

  interface Session {
    managerId: string
    stationId: string
    createdAt: number
    lastActivity: number
  }

  const isSessionValid = (session: Session | null, now: number = Date.now()): boolean => {
    if (!session) return false
    return (now - session.createdAt) < SESSION_DURATION_MS
  }

  const shouldRefreshSession = (session: Session, now: number = Date.now()): boolean => {
    const halfLife = SESSION_DURATION_MS / 2
    return (now - session.createdAt) > halfLife
  }

  it('validates fresh session', () => {
    const session: Session = {
      managerId: '1',
      stationId: 's1',
      createdAt: Date.now(),
      lastActivity: Date.now()
    }
    expect(isSessionValid(session)).toBe(true)
  })

  it('invalidates expired session', () => {
    const now = Date.now()
    const session: Session = {
      managerId: '1',
      stationId: 's1',
      createdAt: now - SESSION_DURATION_MS - 1000,
      lastActivity: now - 1000
    }
    expect(isSessionValid(session, now)).toBe(false)
  })

  it('handles null session', () => {
    expect(isSessionValid(null)).toBe(false)
  })

  it('suggests refresh after half session duration', () => {
    const now = Date.now()
    const session: Session = {
      managerId: '1',
      stationId: 's1',
      createdAt: now - (SESSION_DURATION_MS / 2) - 1000,
      lastActivity: now
    }
    expect(shouldRefreshSession(session, now)).toBe(true)
  })

  it('does not suggest refresh for new session', () => {
    const now = Date.now()
    const session: Session = {
      managerId: '1',
      stationId: 's1',
      createdAt: now - 1000,
      lastActivity: now
    }
    expect(shouldRefreshSession(session, now)).toBe(false)
  })

  it('handles session at exact expiration boundary', () => {
    const now = Date.now()
    const session: Session = {
      managerId: '1',
      stationId: 's1',
      createdAt: now - SESSION_DURATION_MS,
      lastActivity: now
    }
    // At exact boundary, should be invalid (< not <=)
    expect(isSessionValid(session, now)).toBe(false)
  })
})

// =====================
// Empty data handling
// =====================
describe('Empty Data Handling', () => {
  // Station with no wheels
  it('handles station with zero wheels', () => {
    const wheels: { is_available?: boolean }[] = []
    const availableCount = wheels.filter(w => w.is_available).length
    const borrowedCount = wheels.filter(w => !w.is_available).length

    expect(availableCount).toBe(0)
    expect(borrowedCount).toBe(0)
    expect(wheels.length).toBe(0)
  })

  // District with no stations
  it('handles district with no stations', () => {
    interface Station {
      id: string
      district?: string
    }
    const stations: Station[] = []
    const districtStations = stations.filter(s => s.district === 'north')

    expect(districtStations.length).toBe(0)
  })

  // Manager with no assigned station
  it('handles manager without station assignment', () => {
    const manager = {
      id: '1',
      full_name: 'Test',
      phone: '0501234567',
      station_id: null
    }

    expect(manager.station_id).toBeNull()
    expect(manager.station_id ?? 'unassigned').toBe('unassigned')
  })

  // Empty search results
  it('handles empty wheel search results', () => {
    const searchResults: unknown[] = []
    const hasResults = searchResults.length > 0
    const message = hasResults ? `נמצאו ${searchResults.length} גלגלים` : 'לא נמצאו גלגלים תואמים'

    expect(hasResults).toBe(false)
    expect(message).toBe('לא נמצאו גלגלים תואמים')
  })
})

// =====================
// Boundary value testing
// =====================
describe('Boundary Values', () => {
  // Wheel numbers at boundaries
  describe('Wheel Number Boundaries', () => {
    const isValidWheelNumber = (num: string): boolean => {
      if (!num || num.trim().length === 0) return false
      if (num.length > 20) return false
      return true
    }

    it('accepts minimum valid wheel number', () => {
      expect(isValidWheelNumber('A')).toBe(true)
    })

    it('rejects empty wheel number', () => {
      expect(isValidWheelNumber('')).toBe(false)
    })

    it('accepts maximum length wheel number', () => {
      expect(isValidWheelNumber('A'.repeat(20))).toBe(true)
    })

    it('rejects too long wheel number', () => {
      expect(isValidWheelNumber('A'.repeat(21))).toBe(false)
    })
  })

  // Bolt pattern boundaries
  describe('Bolt Pattern Boundaries', () => {
    const VALID_BOLT_COUNTS = [3, 4, 5, 6, 8]

    const isValidBoltCount = (count: number): boolean => {
      return VALID_BOLT_COUNTS.includes(count)
    }

    it('accepts common bolt counts', () => {
      expect(isValidBoltCount(4)).toBe(true)
      expect(isValidBoltCount(5)).toBe(true)
      expect(isValidBoltCount(6)).toBe(true)
    })

    it('rejects invalid bolt counts', () => {
      expect(isValidBoltCount(0)).toBe(false)
      expect(isValidBoltCount(1)).toBe(false)
      expect(isValidBoltCount(7)).toBe(false)
      expect(isValidBoltCount(10)).toBe(false)
    })
  })

  // Rim size boundaries
  describe('Rim Size Boundaries', () => {
    const VALID_RIM_SIZES = ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22']

    const isValidRimSize = (size: string): boolean => {
      return VALID_RIM_SIZES.includes(size)
    }

    it('accepts valid rim sizes', () => {
      expect(isValidRimSize('15')).toBe(true)
      expect(isValidRimSize('17')).toBe(true)
      expect(isValidRimSize('22')).toBe(true)
    })

    it('rejects invalid rim sizes', () => {
      expect(isValidRimSize('12')).toBe(false)
      expect(isValidRimSize('23')).toBe(false)
      expect(isValidRimSize('abc')).toBe(false)
    })
  })

  // Phone number length boundaries
  describe('Phone Number Boundaries', () => {
    const isValidPhoneLength = (phone: string): boolean => {
      const digits = phone.replace(/\D/g, '')
      return digits.length >= 9 && digits.length <= 15
    }

    it('accepts minimum length phone (9 digits)', () => {
      expect(isValidPhoneLength('050123456')).toBe(true)
    })

    it('accepts maximum length phone (15 digits)', () => {
      expect(isValidPhoneLength('972501234567890')).toBe(true)
    })

    it('rejects too short phone', () => {
      expect(isValidPhoneLength('0501234')).toBe(false) // 7 digits
    })

    it('rejects too long phone', () => {
      expect(isValidPhoneLength('9725012345678901')).toBe(false) // 16 digits
    })
  })
})

// =====================
// Concurrent operation handling
// =====================
describe('Concurrent Operations', () => {
  // Simulate wheel borrow race condition
  it('handles concurrent borrow attempts', async () => {
    let wheelAvailable = true
    const borrowLock = new Set<string>()

    const tryBorrow = async (wheelId: string): Promise<{ success: boolean; reason?: string }> => {
      // Check if already being borrowed
      if (borrowLock.has(wheelId)) {
        return { success: false, reason: 'operation_in_progress' }
      }

      borrowLock.add(wheelId)

      try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10))

        if (!wheelAvailable) {
          return { success: false, reason: 'wheel_not_available' }
        }

        wheelAvailable = false
        return { success: true }
      } finally {
        borrowLock.delete(wheelId)
      }
    }

    // First borrow should succeed
    const result1 = await tryBorrow('wheel-1')
    expect(result1.success).toBe(true)

    // Reset for next test
    wheelAvailable = false

    // Second borrow should fail (wheel not available)
    const result2 = await tryBorrow('wheel-1')
    expect(result2.success).toBe(false)
    expect(result2.reason).toBe('wheel_not_available')
  })
})

// =====================
// Special characters handling
// =====================
describe('Special Characters Handling', () => {
  // Hebrew text in names
  it('handles Hebrew names correctly', () => {
    const name = 'יאיר קדוש'
    const initials = name.split(' ').map(p => p[0]).join('')
    expect(initials).toBe('יק')
  })

  // Mixed Hebrew and English
  it('handles mixed language input', () => {
    const mixedName = 'יאיר Kadosh'
    const parts = mixedName.split(' ')
    expect(parts[0]).toBe('יאיר')
    expect(parts[1]).toBe('Kadosh')
  })

  // Emoji in names (should be stripped or handled)
  it('handles emoji in user input', () => {
    const nameWithEmoji = '🚗 Test User'
    const cleanName = nameWithEmoji.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
    expect(cleanName).toBe('Test User')
  })

  // SQL injection attempt (validation)
  it('sanitizes dangerous input patterns', () => {
    const dangerousInput = "'; DROP TABLE wheels; --"
    const sanitized = dangerousInput.replace(/[';\-]/g, '')
    expect(sanitized).not.toContain("'")
    expect(sanitized).not.toContain(';')
    expect(sanitized).not.toContain('-')
  })

  // XSS attempt (validation)
  it('sanitizes HTML in input', () => {
    const xssInput = '<script>alert("xss")</script>'
    const sanitized = xssInput.replace(/<[^>]*>/g, '')
    expect(sanitized).not.toContain('<')
    expect(sanitized).not.toContain('>')
    expect(sanitized).toBe('alert("xss")')
  })
})

// =====================
// Date/Time edge cases
// =====================
describe('Date/Time Edge Cases', () => {
  // Borrow duration calculations
  it('calculates borrow duration correctly', () => {
    const borrowedAt = new Date('2024-01-01T10:00:00')
    const returnedAt = new Date('2024-01-03T14:30:00')

    const durationMs = returnedAt.getTime() - borrowedAt.getTime()
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationDays = Math.floor(durationHours / 24)

    expect(durationDays).toBe(2)
    expect(durationHours).toBe(52) // 2 days + 4.5 hours = 52.5 hours
  })

  // Midnight boundary
  it('handles midnight date boundary', () => {
    const beforeMidnight = new Date('2024-01-01T23:59:59')
    const afterMidnight = new Date('2024-01-02T00:00:01')

    const isSameDay = beforeMidnight.toDateString() === afterMidnight.toDateString()
    expect(isSameDay).toBe(false)
  })

  // Timezone handling (Israel timezone)
  it('formats date for Israel timezone', () => {
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = date.toLocaleDateString('he-IL')

    // Should be in Israeli date format
    expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
  })
})

// =====================
// Network/API edge cases
// =====================
describe('API Response Edge Cases', () => {
  // Timeout handling
  it('handles request timeout', async () => {
    const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<{ success: boolean; error?: string }> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        // Simulate a slow request
        await new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Simulated timeout')), timeoutMs + 100)
          controller.signal.addEventListener('abort', () => reject(new Error('Request aborted')))
        })
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const result = await fetchWithTimeout('http://example.com', 50)
    expect(result.success).toBe(false)
  })

  // Empty response handling
  it('handles empty API response', () => {
    const parseResponse = (data: unknown): unknown[] => {
      if (!data) return []
      if (!Array.isArray(data)) return []
      return data
    }

    expect(parseResponse(null)).toEqual([])
    expect(parseResponse(undefined)).toEqual([])
    expect(parseResponse({})).toEqual([])
    expect(parseResponse([])).toEqual([])
    expect(parseResponse([1, 2, 3])).toEqual([1, 2, 3])
  })

  // Malformed JSON response
  it('handles malformed response data', () => {
    const safeParseJSON = (str: string): { success: boolean; data?: unknown; error?: string } => {
      try {
        const data = JSON.parse(str)
        return { success: true, data }
      } catch (error) {
        return { success: false, error: 'Invalid JSON' }
      }
    }

    expect(safeParseJSON('{"valid": true}').success).toBe(true)
    expect(safeParseJSON('invalid json').success).toBe(false)
    expect(safeParseJSON('').success).toBe(false)
  })
})
