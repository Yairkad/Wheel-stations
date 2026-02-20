import { describe, it, expect } from 'vitest'
import {
  hebrewToEnglishMakes,
  hebrewToEnglishModels,
  modelToMake,
  extractRimSize
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
      expect(value, `value for key "${key}" is empty`).toBeTruthy()
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
      expect(value, `value for key "${key}" is empty`).toBeTruthy()
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
      expect(value, `value for key "${key}" is empty`).toBeTruthy()
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
