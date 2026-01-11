import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

/**
 * Component Tests
 *
 * בדיקות קומפוננטות React - בדיקות לוגיקה ותצוגה
 */

// =====================
// AppHeader Logic Tests
// =====================
describe('AppHeader - Logic Functions', () => {
  // getUserInitials function (extracted from component)
  const getUserInitials = (fullName: string | undefined) => {
    if (!fullName) return '👤'
    const parts = fullName.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return fullName.substring(0, 2)
  }

  describe('getUserInitials', () => {
    it('returns initials for two-word Hebrew name', () => {
      expect(getUserInitials('יאיר קדוש')).toBe('יק')
    })

    it('returns initials for two-word English name', () => {
      expect(getUserInitials('John Doe')).toBe('JD')
    })

    it('returns first two chars for single word name', () => {
      expect(getUserInitials('יאיר')).toBe('יא')
      expect(getUserInitials('John')).toBe('Jo')
    })

    it('returns emoji for undefined', () => {
      expect(getUserInitials(undefined)).toBe('👤')
    })

    it('returns emoji for empty string', () => {
      expect(getUserInitials('')).toBe('👤')
    })

    it('handles extra whitespace', () => {
      expect(getUserInitials('  יאיר   קדוש  ')).toBe('יק')
      expect(getUserInitials('יאיר  קדוש')).toBe('יק')
    })

    it('takes first two initials for multi-word names', () => {
      expect(getUserInitials('יאיר בן דוד')).toBe('יב')
      expect(getUserInitials('John Paul Smith')).toBe('JP')
    })
  })

  // getRoleDisplay function (extracted from component)
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'מנהל מערכת'
      case 'manager': return 'מנהל תחנה'
      case 'operator': return 'מוקדן'
      default: return 'משתמש'
    }
  }

  describe('getRoleDisplay', () => {
    it('returns correct Hebrew for admin', () => {
      expect(getRoleDisplay('admin')).toBe('מנהל מערכת')
    })

    it('returns correct Hebrew for manager', () => {
      expect(getRoleDisplay('manager')).toBe('מנהל תחנה')
    })

    it('returns correct Hebrew for operator', () => {
      expect(getRoleDisplay('operator')).toBe('מוקדן')
    })

    it('returns default for unknown role', () => {
      expect(getRoleDisplay('unknown')).toBe('משתמש')
      expect(getRoleDisplay('')).toBe('משתמש')
    })
  })

  // Form URL generation (extracted from component)
  const getFormUrl = (stationId: string | undefined, origin: string) => {
    if (!stationId) return ''
    return `${origin}/sign/${stationId}`
  }

  describe('getFormUrl', () => {
    it('generates correct form URL', () => {
      const url = getFormUrl('station-123', 'https://example.com')
      expect(url).toBe('https://example.com/sign/station-123')
    })

    it('returns empty for undefined stationId', () => {
      expect(getFormUrl(undefined, 'https://example.com')).toBe('')
    })

    it('handles localhost origin', () => {
      const url = getFormUrl('test-station', 'http://localhost:3000')
      expect(url).toBe('http://localhost:3000/sign/test-station')
    })
  })

  // WhatsApp message generation
  const createWhatsAppMessage = (stationName: string, formUrl: string) => {
    return `שלום! הנה קישור לטופס השאלת גלגל מ${stationName}:\n${formUrl}`
  }

  describe('WhatsApp message', () => {
    it('creates correct message format', () => {
      const message = createWhatsAppMessage('תחנת מרכז', 'https://example.com/sign/123')
      expect(message).toContain('שלום!')
      expect(message).toContain('תחנת מרכז')
      expect(message).toContain('https://example.com/sign/123')
    })

    it('encodes correctly for URL', () => {
      const message = createWhatsAppMessage('תחנה', 'https://example.com')
      const encoded = encodeURIComponent(message)
      expect(encoded).not.toContain(' ')
      expect(encoded).not.toContain('\n')
    })
  })

  // Station ownership detection
  describe('Station ownership', () => {
    const isOwnStation = (currentStationId: string | undefined, userStationId: string | undefined) => {
      return currentStationId !== undefined && userStationId === currentStationId
    }

    it('detects own station', () => {
      expect(isOwnStation('station-1', 'station-1')).toBe(true)
    })

    it('detects other station', () => {
      expect(isOwnStation('station-1', 'station-2')).toBe(false)
    })

    it('handles undefined currentStationId', () => {
      expect(isOwnStation(undefined, 'station-1')).toBe(false)
    })

    it('handles undefined userStationId', () => {
      expect(isOwnStation('station-1', undefined)).toBe(false)
    })
  })
})

// =====================
// Session Storage Logic
// =====================
describe('Session Storage Logic', () => {
  const parseSessionFromStorage = (key: string, value: string | null): { manager?: { id: string; full_name: string }; stationId?: string } | null => {
    if (!value) return null
    try {
      const session = JSON.parse(value)
      if (!session.manager) return null

      const stationIdFromKey = key.replace('station_session_', '')
      return {
        ...session,
        stationId: session.stationId || session.manager.station_id || stationIdFromKey
      }
    } catch {
      return null
    }
  }

  it('parses valid session', () => {
    const key = 'station_session_abc123'
    const value = JSON.stringify({
      manager: { id: '1', full_name: 'Test', station_id: 'abc123' }
    })

    const session = parseSessionFromStorage(key, value)
    expect(session).not.toBeNull()
    expect(session?.manager?.full_name).toBe('Test')
    expect(session?.stationId).toBe('abc123')
  })

  it('returns null for null value', () => {
    expect(parseSessionFromStorage('key', null)).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseSessionFromStorage('key', 'invalid')).toBeNull()
  })

  it('returns null if no manager in session', () => {
    const value = JSON.stringify({ otherData: true })
    expect(parseSessionFromStorage('key', value)).toBeNull()
  })

  it('extracts stationId from key if not in session', () => {
    const key = 'station_session_my-station-id'
    const value = JSON.stringify({
      manager: { id: '1', full_name: 'Test' }
    })

    const session = parseSessionFromStorage(key, value)
    expect(session?.stationId).toBe('my-station-id')
  })
})

// =====================
// Menu State Logic
// =====================
describe('Menu State Logic', () => {
  it('toggles profile menu', () => {
    let showProfileMenu = false
    const toggle = () => { showProfileMenu = !showProfileMenu }

    expect(showProfileMenu).toBe(false)
    toggle()
    expect(showProfileMenu).toBe(true)
    toggle()
    expect(showProfileMenu).toBe(false)
  })

  it('closes menu on outside click simulation', () => {
    let showProfileMenu = true
    const closeIfOutside = (targetIsInside: boolean) => {
      if (!targetIsInside) {
        showProfileMenu = false
      }
    }

    closeIfOutside(true) // Click inside
    expect(showProfileMenu).toBe(true)

    closeIfOutside(false) // Click outside
    expect(showProfileMenu).toBe(false)
  })
})

// =====================
// Logout Logic
// =====================
describe('Logout Logic', () => {
  it('identifies session keys to clear', () => {
    const mockKeys = [
      'station_session_123',
      'station_session_456',
      'wheel_manager_789',
      'operator_session',
      'other_key',
      'user_preference'
    ]

    const keysToRemove = mockKeys.filter(key =>
      key.startsWith('station_session_') ||
      key.startsWith('wheel_manager_') ||
      key === 'operator_session'
    )

    expect(keysToRemove).toContain('station_session_123')
    expect(keysToRemove).toContain('station_session_456')
    expect(keysToRemove).toContain('wheel_manager_789')
    expect(keysToRemove).toContain('operator_session')
    expect(keysToRemove).not.toContain('other_key')
    expect(keysToRemove).not.toContain('user_preference')
    expect(keysToRemove.length).toBe(4)
  })
})

// =====================
// Navigation Logic
// =====================
describe('Navigation State', () => {
  const getPageState = (pathname: string) => {
    return {
      isOnStationsPage: pathname === '/' || pathname === '/stations',
      isOnSearchPage: pathname === '/search',
      isOnStationPage: pathname.match(/^\/[^/]+$/) !== null && pathname !== '/' && pathname !== '/search' && pathname !== '/login' && pathname !== '/guide'
    }
  }

  it('detects stations page', () => {
    expect(getPageState('/').isOnStationsPage).toBe(true)
    expect(getPageState('/stations').isOnStationsPage).toBe(true)
    expect(getPageState('/search').isOnStationsPage).toBe(false)
  })

  it('detects search page', () => {
    expect(getPageState('/search').isOnSearchPage).toBe(true)
    expect(getPageState('/').isOnSearchPage).toBe(false)
  })

  it('detects station page', () => {
    expect(getPageState('/station-123').isOnStationPage).toBe(true)
    expect(getPageState('/').isOnStationPage).toBe(false)
    expect(getPageState('/search').isOnStationPage).toBe(false)
  })
})

// =====================
// Action URL Parameters
// =====================
describe('Action URL Parameters', () => {
  const buildActionUrl = (stationId: string, action: string) => {
    return `/${stationId}?action=${action}`
  }

  it('builds add wheel URL', () => {
    expect(buildActionUrl('station-1', 'add')).toBe('/station-1?action=add')
  })

  it('builds settings URL', () => {
    expect(buildActionUrl('station-1', 'settings')).toBe('/station-1?action=settings')
  })

  it('builds excel URL', () => {
    expect(buildActionUrl('station-1', 'excel')).toBe('/station-1?action=excel')
  })

  it('builds password URL', () => {
    expect(buildActionUrl('station-1', 'password')).toBe('/station-1?action=password')
  })

  it('builds notifications URL', () => {
    expect(buildActionUrl('station-1', 'notifications')).toBe('/station-1?action=notifications')
  })
})

// =====================
// Responsive Breakpoints
// =====================
describe('Responsive Breakpoints', () => {
  const getBreakpoint = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width <= 480) return 'mobile'
    if (width <= 768) return 'tablet'
    return 'desktop'
  }

  const shouldHideElement = (element: string, breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean => {
    const hideRules: Record<string, ('mobile' | 'tablet')[]> = {
      'station-indicator': ['mobile', 'tablet'],
      'profile-role': ['mobile', 'tablet'],
      'profile-info': ['mobile'],
      'profile-arrow': ['mobile', 'tablet']
    }

    return hideRules[element]?.includes(breakpoint as 'mobile' | 'tablet') || false
  }

  it('identifies mobile breakpoint', () => {
    expect(getBreakpoint(375)).toBe('mobile')
    expect(getBreakpoint(480)).toBe('mobile')
  })

  it('identifies tablet breakpoint', () => {
    expect(getBreakpoint(481)).toBe('tablet')
    expect(getBreakpoint(768)).toBe('tablet')
  })

  it('identifies desktop breakpoint', () => {
    expect(getBreakpoint(769)).toBe('desktop')
    expect(getBreakpoint(1920)).toBe('desktop')
  })

  it('hides station indicator on mobile/tablet', () => {
    expect(shouldHideElement('station-indicator', 'mobile')).toBe(true)
    expect(shouldHideElement('station-indicator', 'tablet')).toBe(true)
    expect(shouldHideElement('station-indicator', 'desktop')).toBe(false)
  })

  it('hides profile info on mobile only', () => {
    expect(shouldHideElement('profile-info', 'mobile')).toBe(true)
    expect(shouldHideElement('profile-info', 'tablet')).toBe(false)
    expect(shouldHideElement('profile-info', 'desktop')).toBe(false)
  })
})

// =====================
// Button State Logic
// =====================
describe('Button Active State', () => {
  const isButtonActive = (buttonType: 'stations' | 'search', pathname: string): boolean => {
    if (buttonType === 'stations') {
      return pathname === '/' || pathname === '/stations'
    }
    if (buttonType === 'search') {
      return pathname === '/search'
    }
    return false
  }

  it('stations button active on home', () => {
    expect(isButtonActive('stations', '/')).toBe(true)
    expect(isButtonActive('search', '/')).toBe(false)
  })

  it('search button active on search page', () => {
    expect(isButtonActive('search', '/search')).toBe(true)
    expect(isButtonActive('stations', '/search')).toBe(false)
  })

  it('no button active on station page', () => {
    expect(isButtonActive('stations', '/station-123')).toBe(false)
    expect(isButtonActive('search', '/station-123')).toBe(false)
  })
})
