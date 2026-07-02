import { describe, it, expect } from 'vitest'
import {
  hebrewToEnglishMakes,
  hebrewToEnglishModels,
  modelToMake,
  extractRimSize,
  getTireDiameterMm
} from '@/lib/vehicle-mappings'

/**
 * Vehicle Mappings Tests
 *
 * בדיקות אמיתיות על קוד האפליקציה:
 * - src/lib/vehicle-mappings.ts
 *
 * מטרה: לוודא שה-mappings בין עברית לאנגלית ופונקציית חילוץ גודל גלגל
 * עובדים תקין אחרי כל שינוי בקוד.
 */

// =====================
// hebrewToEnglishMakes
// =====================
describe('hebrewToEnglishMakes - תרגום יצרן מעברית לאנגלית', () => {
  it('has entries (not empty)', () => {
    expect(Object.keys(hebrewToEnglishMakes).length).toBeGreaterThan(10)
  })

  it('maps "טויוטה" → "Toyota"', () => {
    expect(hebrewToEnglishMakes['טויוטה']).toBe('Toyota')
  })

  it('maps "יונדאי" → "Hyundai"', () => {
    expect(hebrewToEnglishMakes['יונדאי']).toBe('Hyundai')
  })

  it('maps "פולקסווגן" → "Volkswagen"', () => {
    expect(hebrewToEnglishMakes['פולקסווגן']).toBe('Volkswagen')
  })

  it('maps "במוו" → "BMW"', () => {
    expect(hebrewToEnglishMakes['במוו']).toBe('BMW')
  })

  it('maps "מרצדס" → "Mercedes-Benz"', () => {
    expect(hebrewToEnglishMakes['מרצדס']).toBe('Mercedes-Benz')
  })

  it('maps "פורד" → "Ford"', () => {
    expect(hebrewToEnglishMakes['פורד']).toBe('Ford')
  })

  it('maps "ניסאן" → "Nissan"', () => {
    expect(hebrewToEnglishMakes['ניסאן']).toBe('Nissan')
  })

  it('maps "אאודי" → "Audi"', () => {
    expect(hebrewToEnglishMakes['אאודי']).toBe('Audi')
  })

  it('returns undefined for unknown make', () => {
    expect(hebrewToEnglishMakes['לא ידוע']).toBeUndefined()
  })

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(hebrewToEnglishMakes)) {
      expect(value.length, `value for key "${key}" is empty`).toBeGreaterThan(0)
      expect(typeof value).toBe('string')
    }
  })
})

// =====================
// hebrewToEnglishModels
// =====================
describe('hebrewToEnglishModels - תרגום דגם מעברית לאנגלית', () => {
  it('has entries (not empty)', () => {
    expect(Object.keys(hebrewToEnglishModels).length).toBeGreaterThan(20)
  })

  it('maps "קורולה" → "Corolla"', () => {
    expect(hebrewToEnglishModels['קורולה']).toBe('Corolla')
  })

  it('maps "גולף" → "Golf"', () => {
    expect(hebrewToEnglishModels['גולף']).toBe('Golf')
  })

  it('maps "טוסון" → "Tucson"', () => {
    expect(hebrewToEnglishModels['טוסון']).toBe('Tucson')
  })

  it('maps "קשקאי" → "Qashqai"', () => {
    expect(hebrewToEnglishModels['קשקאי']).toBe('Qashqai')
  })

  it('maps "פאביה" → "Fabia"', () => {
    expect(hebrewToEnglishModels['פאביה']).toBe('Fabia')
  })

  it('maps "סיוויק" → "Civic"', () => {
    expect(hebrewToEnglishModels['סיוויק']).toBe('Civic')
  })

  it('returns undefined for unknown model', () => {
    expect(hebrewToEnglishModels['לא ידוע']).toBeUndefined()
  })

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(hebrewToEnglishModels)) {
      expect(value.length, `value for key "${key}" is empty`).toBeGreaterThan(0)
      expect(typeof value).toBe('string')
    }
  })
})

// =====================
// modelToMake - cross-file consistency
// =====================
describe('modelToMake - מיפוי דגם ליצרן', () => {
  it('has entries (not empty)', () => {
    expect(Object.keys(modelToMake).length).toBeGreaterThan(20)
  })

  it('maps "Corolla" → "Toyota"', () => {
    expect(modelToMake['Corolla']).toBe('Toyota')
  })

  it('maps "Golf" → "Volkswagen"', () => {
    expect(modelToMake['Golf']).toBe('Volkswagen')
  })

  it('maps "Tucson" → "Hyundai"', () => {
    expect(modelToMake['Tucson']).toBe('Hyundai')
  })

  it('maps "Sportage" → "Kia"', () => {
    expect(modelToMake['Sportage']).toBe('Kia')
  })

  it('maps "CX-5" → "Mazda"', () => {
    expect(modelToMake['CX-5']).toBe('Mazda')
  })

  it('maps "Qashqai" → "Nissan"', () => {
    expect(modelToMake['Qashqai']).toBe('Nissan')
  })

  it('maps "Octavia" → "Skoda"', () => {
    expect(modelToMake['Octavia']).toBe('Skoda')
  })

  it('returns undefined for unknown model', () => {
    expect(modelToMake['UnknownModel']).toBeUndefined()
  })

  it('is consistent with hebrewToEnglishModels: "קורולה" → Corolla → Toyota', () => {
    const englishModel = hebrewToEnglishModels['קורולה']
    expect(englishModel).toBe('Corolla')
    expect(modelToMake[englishModel]).toBe('Toyota')
  })

  it('is consistent: "גולף" → Golf → Volkswagen', () => {
    const englishModel = hebrewToEnglishModels['גולף']
    expect(englishModel).toBe('Golf')
    expect(modelToMake[englishModel]).toBe('Volkswagen')
  })

  it('is consistent: "טוסון" → Tucson → Hyundai', () => {
    const englishModel = hebrewToEnglishModels['טוסון']
    expect(englishModel).toBe('Tucson')
    expect(modelToMake[englishModel]).toBe('Hyundai')
  })

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(modelToMake)) {
      expect(value.length, `value for key "${key}" is empty`).toBeGreaterThan(0)
      expect(typeof value).toBe('string')
    }
  })
})

// =====================
// extractRimSize
// =====================
describe('extractRimSize - חילוץ גודל גלגל ממחרוזת צמיג', () => {
  it('extracts 16 from "205/55R16"', () => {
    expect(extractRimSize('205/55R16')).toBe(16)
  })

  it('extracts 17 from "225/45R17"', () => {
    expect(extractRimSize('225/45R17')).toBe(17)
  })

  it('extracts 18 from "235/40R18"', () => {
    expect(extractRimSize('235/40R18')).toBe(18)
  })

  it('extracts 15 from "175/70R15"', () => {
    expect(extractRimSize('175/70R15')).toBe(15)
  })

  it('extracts 19 from "245/35R19"', () => {
    expect(extractRimSize('245/35R19')).toBe(19)
  })

  it('handles lowercase "r" in "205/55r16"', () => {
    expect(extractRimSize('205/55r16')).toBe(16)
  })

  it('returns null for null input', () => {
    expect(extractRimSize(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(extractRimSize(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractRimSize('')).toBeNull()
  })

  it('returns null for string without rim size pattern', () => {
    expect(extractRimSize('invalid')).toBeNull()
  })

  it('returns null for string with only numbers', () => {
    expect(extractRimSize('205/55')).toBeNull()
  })
})

// =====================
// getTireDiameterMm
// =====================
describe('getTireDiameterMm - חישוב קוטר גלגול כולל ממחרוזת צמיג', () => {
  it('computes overall diameter for "205/55R16"', () => {
    // 16*25.4 + 2*(205*55/100) = 406.4 + 225.5 = 631.9
    expect(getTireDiameterMm('205/55R16')).toBeCloseTo(631.9, 1)
  })

  it('computes overall diameter for "225/45R17"', () => {
    // 17*25.4 + 2*(225*45/100) = 431.8 + 202.5 = 634.3
    expect(getTireDiameterMm('225/45R17')).toBeCloseTo(634.3, 1)
  })

  it('a smaller rim with a taller sidewall can have a similar overall diameter to a larger rim', () => {
    const d17 = getTireDiameterMm('215/55R17')
    const d18 = getTireDiameterMm('215/50R18')
    expect(d17).not.toBeNull()
    expect(d18).not.toBeNull()
    expect(Math.abs(d17! - d18!) / d17!).toBeLessThan(0.03)
  })

  it('returns null for null input', () => {
    expect(getTireDiameterMm(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(getTireDiameterMm(undefined)).toBeNull()
  })

  it('returns null for string without a width/aspect-ratio prefix', () => {
    expect(getTireDiameterMm('R16')).toBeNull()
  })

  it('returns null for string without a rim size and no override given', () => {
    expect(getTireDiameterMm('205/55')).toBeNull()
  })

  it('uses rimSizeOverride when the tire string has no rim suffix (wheels.tire_size format)', () => {
    expect(getTireDiameterMm('205/55', 16)).toBeCloseTo(getTireDiameterMm('205/55R16')!, 5)
  })

  it('prefers rimSizeOverride even when the string also has its own rim suffix', () => {
    expect(getTireDiameterMm('205/55R16', 17)).toBeCloseTo(getTireDiameterMm('205/55R17')!, 5)
  })

  it('returns null when rimSizeOverride is null and the string has no rim suffix', () => {
    expect(getTireDiameterMm('205/55', null)).toBeNull()
  })
})
