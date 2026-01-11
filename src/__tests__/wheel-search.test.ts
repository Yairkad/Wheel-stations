import { describe, it, expect } from 'vitest'

/**
 * Wheel Search Tests
 *
 * בדיקות לוגיקת חיפוש גלגל לפי מפרט רכב
 */

// =====================
// Wheel specification matching
// =====================
interface WheelSpec {
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
  rim_size?: string
}

interface Wheel extends WheelSpec {
  id: string
  wheel_number: string
  is_available: boolean
  is_donut: boolean
}

// Mock wheels database
const mockWheels: Wheel[] = [
  { id: '1', wheel_number: 'A1', bolt_count: 5, bolt_spacing: 114.3, center_bore: 60.1, rim_size: '16', is_available: true, is_donut: false },
  { id: '2', wheel_number: 'A2', bolt_count: 5, bolt_spacing: 114.3, center_bore: 66.1, rim_size: '17', is_available: true, is_donut: false },
  { id: '3', wheel_number: 'B1', bolt_count: 4, bolt_spacing: 100, center_bore: 54.1, rim_size: '15', is_available: true, is_donut: false },
  { id: '4', wheel_number: 'B2', bolt_count: 4, bolt_spacing: 100, center_bore: 54.1, rim_size: '15', is_available: false, is_donut: false },
  { id: '5', wheel_number: 'C1', bolt_count: 5, bolt_spacing: 112, center_bore: 57.1, rim_size: '16', is_available: true, is_donut: true },
  { id: '6', wheel_number: 'D1', bolt_count: 5, bolt_spacing: 114.3, center_bore: null, rim_size: '16', is_available: true, is_donut: false },
]

// =====================
// Basic matching logic
// =====================
describe('Wheel Spec Matching - Basic', () => {
  const matchesSpec = (wheel: Wheel, spec: WheelSpec): boolean => {
    // Must match bolt count
    if (wheel.bolt_count !== spec.bolt_count) return false

    // Must match bolt spacing
    if (wheel.bolt_spacing !== spec.bolt_spacing) return false

    return true
  }

  it('matches wheel with exact bolt pattern', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 114.3 }
    const matches = mockWheels.filter(w => matchesSpec(w, spec))

    expect(matches.length).toBe(3) // A1, A2, D1
    expect(matches.map(m => m.wheel_number)).toContain('A1')
    expect(matches.map(m => m.wheel_number)).toContain('A2')
  })

  it('does not match different bolt count', () => {
    const spec: WheelSpec = { bolt_count: 4, bolt_spacing: 114.3 }
    const matches = mockWheels.filter(w => matchesSpec(w, spec))

    expect(matches.length).toBe(0)
  })

  it('does not match different bolt spacing', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 100 }
    const matches = mockWheels.filter(w => matchesSpec(w, spec))

    expect(matches.length).toBe(0)
  })
})

// =====================
// Center bore matching
// =====================
describe('Wheel Spec Matching - Center Bore', () => {
  const matchesWithCenterBore = (wheel: Wheel, spec: WheelSpec): boolean => {
    // Must match bolt pattern
    if (wheel.bolt_count !== spec.bolt_count) return false
    if (wheel.bolt_spacing !== spec.bolt_spacing) return false

    // Center bore check (wheel CB must be >= vehicle CB, or wheel has no CB specified)
    if (spec.center_bore && wheel.center_bore) {
      if (wheel.center_bore < spec.center_bore) return false
    }

    return true
  }

  it('matches wheel with equal or larger center bore', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 114.3, center_bore: 60.1 }
    const matches = mockWheels.filter(w => matchesWithCenterBore(w, spec))

    // A1 (60.1), A2 (66.1), D1 (null - no CB)
    expect(matches.length).toBe(3)
  })

  it('excludes wheel with smaller center bore', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 114.3, center_bore: 67 }
    const matches = mockWheels.filter(w => matchesWithCenterBore(w, spec))

    // Only D1 (null) matches - A1 (60.1) and A2 (66.1) are too small
    expect(matches.length).toBe(1)
    expect(matches[0].wheel_number).toBe('D1')
  })

  it('wheel without center bore matches any spec', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 114.3, center_bore: 100 }
    const wheelWithoutCB = mockWheels.find(w => w.wheel_number === 'D1')!

    const matches = matchesWithCenterBore(wheelWithoutCB, spec)
    expect(matches).toBe(true)
  })
})

// =====================
// Availability filtering
// =====================
describe('Wheel Search - Availability', () => {
  it('filters only available wheels', () => {
    const available = mockWheels.filter(w => w.is_available)
    expect(available.length).toBe(5) // All except B2

    const unavailable = mockWheels.filter(w => !w.is_available)
    expect(unavailable.length).toBe(1)
    expect(unavailable[0].wheel_number).toBe('B2')
  })

  it('can include unavailable wheels in search', () => {
    const allWheels = mockWheels
    const spec: WheelSpec = { bolt_count: 4, bolt_spacing: 100 }

    const allMatches = allWheels.filter(w =>
      w.bolt_count === spec.bolt_count && w.bolt_spacing === spec.bolt_spacing
    )

    expect(allMatches.length).toBe(2) // B1 and B2
  })
})

// =====================
// Donut wheel handling
// =====================
describe('Wheel Search - Donut Wheels', () => {
  it('can filter out donut wheels', () => {
    const regularWheels = mockWheels.filter(w => !w.is_donut)
    expect(regularWheels.length).toBe(5)
  })

  it('can search only donut wheels', () => {
    const donutWheels = mockWheels.filter(w => w.is_donut)
    expect(donutWheels.length).toBe(1)
    expect(donutWheels[0].wheel_number).toBe('C1')
  })

  it('includes donut in regular search by default', () => {
    const spec: WheelSpec = { bolt_count: 5, bolt_spacing: 112 }
    const matches = mockWheels.filter(w =>
      w.bolt_count === spec.bolt_count && w.bolt_spacing === spec.bolt_spacing
    )

    expect(matches.length).toBe(1)
    expect(matches[0].is_donut).toBe(true)
  })
})

// =====================
// Rim size filtering
// =====================
describe('Wheel Search - Rim Size', () => {
  it('can filter by rim size', () => {
    const size16 = mockWheels.filter(w => w.rim_size === '16')
    expect(size16.length).toBe(3) // A1, C1, D1
  })

  it('can search for multiple rim sizes', () => {
    const acceptableSizes = ['15', '16']
    const matches = mockWheels.filter(w => acceptableSizes.includes(w.rim_size || ''))

    expect(matches.length).toBe(5) // 15: B1, B2; 16: A1, C1, D1
  })

  it('handles wheels without rim size', () => {
    const wheelWithoutSize = { ...mockWheels[0], rim_size: undefined }
    expect(wheelWithoutSize.rim_size).toBeUndefined()
  })
})

// =====================
// Combined search
// =====================
describe('Wheel Search - Combined Criteria', () => {
  interface SearchCriteria {
    bolt_count: number
    bolt_spacing: number
    center_bore?: number
    rim_sizes?: string[]
    only_available?: boolean
    exclude_donuts?: boolean
  }

  const searchWheels = (wheels: Wheel[], criteria: SearchCriteria): Wheel[] => {
    return wheels.filter(wheel => {
      // Bolt pattern match
      if (wheel.bolt_count !== criteria.bolt_count) return false
      if (wheel.bolt_spacing !== criteria.bolt_spacing) return false

      // Center bore check
      if (criteria.center_bore && wheel.center_bore) {
        if (wheel.center_bore < criteria.center_bore) return false
      }

      // Rim size filter
      if (criteria.rim_sizes && criteria.rim_sizes.length > 0) {
        if (!wheel.rim_size || !criteria.rim_sizes.includes(wheel.rim_size)) return false
      }

      // Availability filter
      if (criteria.only_available && !wheel.is_available) return false

      // Donut filter
      if (criteria.exclude_donuts && wheel.is_donut) return false

      return true
    })
  }

  it('searches with all criteria', () => {
    const criteria: SearchCriteria = {
      bolt_count: 5,
      bolt_spacing: 114.3,
      center_bore: 60,
      rim_sizes: ['16', '17'],
      only_available: true,
      exclude_donuts: true
    }

    const results = searchWheels(mockWheels, criteria)

    expect(results.length).toBe(3) // A1, A2, D1
  })

  it('returns empty for no matches', () => {
    const criteria: SearchCriteria = {
      bolt_count: 6,
      bolt_spacing: 139.7,
      only_available: true
    }

    const results = searchWheels(mockWheels, criteria)
    expect(results.length).toBe(0)
  })

  it('returns all matching without optional filters', () => {
    const criteria: SearchCriteria = {
      bolt_count: 4,
      bolt_spacing: 100
    }

    const results = searchWheels(mockWheels, criteria)
    expect(results.length).toBe(2) // B1 and B2 (including unavailable)
  })
})

// =====================
// Search result sorting
// =====================
describe('Wheel Search - Result Sorting', () => {
  it('sorts by availability (available first)', () => {
    const sorted = [...mockWheels].sort((a, b) => {
      if (a.is_available === b.is_available) return 0
      return a.is_available ? -1 : 1
    })

    // First 5 should be available
    expect(sorted.slice(0, 5).every(w => w.is_available)).toBe(true)
    expect(sorted[5].is_available).toBe(false)
  })

  it('sorts by wheel number', () => {
    const sorted = [...mockWheels].sort((a, b) =>
      a.wheel_number.localeCompare(b.wheel_number)
    )

    expect(sorted[0].wheel_number).toBe('A1')
    expect(sorted[sorted.length - 1].wheel_number).toBe('D1')
  })
})
