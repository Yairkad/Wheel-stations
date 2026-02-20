import { describe, it, expect } from 'vitest'
import { findPCD, extractMakeFromHebrew, PCD_DATABASE } from '@/lib/pcd-database'

/**
 * PCD Database Tests
 *
 * בדיקות אמיתיות על קוד האפליקציה:
 * - src/lib/pcd-database.ts
 *
 * מטרה: לוודא שה-PCD database וכל הפונקציות שעליו עובדות תקין
 * אחרי כל שינוי בקוד.
 */

// =====================
// Data integrity
// =====================
describe('PCD_DATABASE - תקינות נתונים', () => {
  it('is not empty', () => {
    expect(PCD_DATABASE.length).toBeGreaterThan(50)
  })

  it('all entries have required fields', () => {
    for (const entry of PCD_DATABASE) {
      expect(entry.make, `make missing in entry: ${JSON.stringify(entry)}`).toBeTruthy()
      expect(entry.model, `model missing in entry: ${JSON.stringify(entry)}`).toBeTruthy()
      expect(entry.bolt_count, `bolt_count missing in entry: ${entry.make} ${entry.model}`).toBeGreaterThan(0)
      expect(entry.bolt_spacing, `bolt_spacing missing in entry: ${entry.make} ${entry.model}`).toBeGreaterThan(0)
      expect(entry.year_from, `year_from missing in entry: ${entry.make} ${entry.model}`).toBeGreaterThan(1900)
    }
  })

  it('all makes are lowercase English', () => {
    for (const entry of PCD_DATABASE) {
      expect(entry.make, `make is not lowercase: "${entry.make}"`).toBe(entry.make.toLowerCase())
    }
  })

  it('all models are lowercase English', () => {
    for (const entry of PCD_DATABASE) {
      expect(entry.model, `model is not lowercase: "${entry.model}"`).toBe(entry.model.toLowerCase())
    }
  })

  it('year_to is null or greater than year_from', () => {
    for (const entry of PCD_DATABASE) {
      if (entry.year_to !== null) {
        expect(entry.year_to, `year_to (${entry.year_to}) < year_from (${entry.year_from}) for ${entry.make} ${entry.model}`)
          .toBeGreaterThanOrEqual(entry.year_from)
      }
    }
  })

  it('contains Toyota, Hyundai, Kia, VW, BMW, Mercedes', () => {
    const makes = PCD_DATABASE.map(e => e.make)
    expect(makes).toContain('toyota')
    expect(makes).toContain('hyundai')
    expect(makes).toContain('kia')
    expect(makes).toContain('volkswagen')
    expect(makes).toContain('bmw')
    expect(makes).toContain('mercedes')
  })
})

// =====================
// findPCD - Year range matching
// =====================
describe('findPCD - Year range matching', () => {
  it('Toyota Corolla 2000 → 4×100 (1983-2006 range)', () => {
    const result = findPCD('toyota', 'corolla', 2000)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(4)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('Toyota Corolla 2015 → 5×114.3 (2007-2018 range)', () => {
    const result = findPCD('toyota', 'corolla', 2015)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Toyota Corolla 2022 → 5×100 (2019-current range)', () => {
    const result = findPCD('toyota', 'corolla', 2022)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('VW Golf 2000 → 5×100 (1997-2003 range)', () => {
    const result = findPCD('volkswagen', 'golf', 2000)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('VW Golf 2020 → 5×112 (2003-current range)', () => {
    const result = findPCD('volkswagen', 'golf', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(112)
  })

  it('Skoda Octavia 2010 → 5×100 (1996-2012 range)', () => {
    const result = findPCD('skoda', 'octavia', 2010)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('Skoda Octavia 2020 → 5×112 (2013-current range)', () => {
    const result = findPCD('skoda', 'octavia', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(112)
  })

  it('Toyota Yaris 2015 → 4×100 (pre-2020)', () => {
    const result = findPCD('toyota', 'yaris', 2015)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(4)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('Toyota Yaris 2022 → 5×100 (2020+)', () => {
    const result = findPCD('toyota', 'yaris', 2022)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(100)
  })
})

// =====================
// findPCD - Returns null when expected
// =====================
describe('findPCD - Returns null for invalid inputs', () => {
  it('returns null for completely unknown make', () => {
    const result = findPCD('unknownmake', 'unknownmodel', 2020)
    expect(result).toBeNull()
  })

  it('returns null for known make but unknown model', () => {
    const result = findPCD('toyota', 'unknownmodel', 2020)
    expect(result).toBeNull()
  })

  it('returns null for year before any entry in range', () => {
    const result = findPCD('toyota', 'corolla', 1970)
    expect(result).toBeNull()
  })
})

// =====================
// findPCD - Model variants
// =====================
describe('findPCD - Model variants matching', () => {
  it('Mazda CX-5 via variant "cx5"', () => {
    const result = findPCD('mazda', 'cx5', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Toyota RAV4 via variant "rav 4"', () => {
    const result = findPCD('toyota', 'rav 4', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Toyota C-HR via variant "chr"', () => {
    const result = findPCD('toyota', 'chr', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Nissan X-Trail via variant "xtrail"', () => {
    const result = findPCD('nissan', 'xtrail', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Hyundai Santa Fe via variant "santafe"', () => {
    const result = findPCD('hyundai', 'santafe', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_spacing).toBe(114.3)
  })
})

// =====================
// findPCD - Known makes with specific bolt patterns
// =====================
describe('findPCD - Known bolt patterns per make', () => {
  it('BMW 3 Series 2020 → 5×120', () => {
    const result = findPCD('bmw', '3 series', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(120)
  })

  it('Mercedes C-Class 2020 → 5×112', () => {
    const result = findPCD('mercedes', 'c-class', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(112)
  })

  it('Hyundai Tucson 2020 → 5×114.3', () => {
    const result = findPCD('hyundai', 'tucson', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(114.3)
  })

  it('Kia Picanto 2020 → 4×100', () => {
    const result = findPCD('kia', 'picanto', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(4)
    expect(result?.bolt_spacing).toBe(100)
  })

  it('Ford Fiesta 2020 → 4×108', () => {
    const result = findPCD('ford', 'fiesta', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(4)
    expect(result?.bolt_spacing).toBe(108)
  })

  it('Volvo XC60 2020 → 5×108', () => {
    const result = findPCD('volvo', 'xc60', 2020)
    expect(result).not.toBeNull()
    expect(result?.bolt_count).toBe(5)
    expect(result?.bolt_spacing).toBe(108)
  })
})

// =====================
// extractMakeFromHebrew
// =====================
describe('extractMakeFromHebrew - Hebrew manufacturer name extraction', () => {
  it('extracts "toyota" from "טויוטה"', () => {
    expect(extractMakeFromHebrew('טויוטה')).toBe('toyota')
  })

  it('extracts "hyundai" from "יונדאי"', () => {
    expect(extractMakeFromHebrew('יונדאי')).toBe('hyundai')
  })

  it('extracts "volkswagen" from "פולקסווגן"', () => {
    expect(extractMakeFromHebrew('פולקסווגן')).toBe('volkswagen')
  })

  it('extracts "kia" from "קיה"', () => {
    expect(extractMakeFromHebrew('קיה')).toBe('kia')
  })

  it('extracts "bmw" from "ב.מ.וו"', () => {
    expect(extractMakeFromHebrew('ב.מ.וו')).toBe('bmw')
  })

  it('extracts "bmw" from "במוו"', () => {
    expect(extractMakeFromHebrew('במוו')).toBe('bmw')
  })

  it('extracts "mercedes" from "מרצדס"', () => {
    expect(extractMakeFromHebrew('מרצדס')).toBe('mercedes')
  })

  it('extracts "toyota" from string with country suffix "טויוטה יפן"', () => {
    expect(extractMakeFromHebrew('טויוטה יפן')).toBe('toyota')
  })

  it('extracts "ford" from "פורד"', () => {
    expect(extractMakeFromHebrew('פורד')).toBe('ford')
  })

  it('extracts "audi" from "אאודי"', () => {
    expect(extractMakeFromHebrew('אאודי')).toBe('audi')
  })

  it('returns null for completely unknown Hebrew text', () => {
    // A string that doesn't match any known make
    expect(extractMakeFromHebrew('חברה לא ידועה בכלל')).toBeNull()
  })
})
