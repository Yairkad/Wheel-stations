import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ScrapeResult } from '@/lib/vehicle-scrape'

const { scrapeVehicleFitment, vehicleModelsEq, errorReportsLimit, errorReportsInsert, fromMock } = vi.hoisted(() => {
  return {
    scrapeVehicleFitment: vi.fn(),
    vehicleModelsEq: vi.fn(),
    errorReportsLimit: vi.fn(),
    errorReportsInsert: vi.fn(),
    fromMock: vi.fn(),
  }
})

vi.mock('@/lib/vehicle-scrape', () => ({ scrapeVehicleFitment }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: fromMock }))
}))

// vehicle_models: .update({...}).eq('id', id) resolves directly (terminal)
// error_reports: .select().eq().eq().ilike().limit(1) resolves via errorReportsLimit,
//                .insert([...]) resolves via errorReportsInsert
fromMock.mockImplementation((table: string) => {
  if (table === 'vehicle_models') {
    return { update: vi.fn(() => ({ eq: vehicleModelsEq })) }
  }
  if (table === 'error_reports') {
    return {
      select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ ilike: vi.fn(() => ({ limit: errorReportsLimit })) })) })) })),
      insert: errorReportsInsert
    }
  }
  return {}
})

const { compareFitment, verifyVehicleModel } = await import('@/lib/vehicle-fitment-verification')

const baseRow = {
  id: 'row-1',
  make: 'Toyota',
  model: 'Corolla',
  year_from: 2020,
  bolt_count: 5,
  bolt_spacing: 114.3,
  center_bore: 60.1,
}

const matchingScrape: ScrapeResult = {
  make: 'Toyota', model: 'Corolla', year: 2020,
  bolt_count: 5, bolt_spacing: 114.3, center_bore: 60.1,
  rim_sizes: ['16'], rim_sizes_allowed: [16], tire_sizes: ['205/55R16'],
  source_url: 'https://www.wheelfitment.eu/x', source: 'wheelfitment.eu'
}

const mismatchedScrape: ScrapeResult = {
  ...matchingScrape,
  bolt_count: 4,
  bolt_spacing: 100,
}

describe('compareFitment', () => {
  it('matches identical fitment', () => {
    expect(compareFitment(baseRow, matchingScrape).matched).toBe(true)
  })

  it('flags a bolt_count mismatch', () => {
    const { matched, diffs } = compareFitment(baseRow, mismatchedScrape)
    expect(matched).toBe(false)
    expect(diffs.some(d => d.startsWith('bolt_count'))).toBe(true)
  })

  it('tolerates tiny floating point differences in bolt_spacing', () => {
    expect(compareFitment(baseRow, { ...matchingScrape, bolt_spacing: 114.32 }).matched).toBe(true)
  })

  it('flags a real center_bore mismatch beyond tolerance', () => {
    expect(compareFitment(baseRow, { ...matchingScrape, center_bore: 65 }).matched).toBe(false)
  })

  it('does not block on missing center_bore data on either side', () => {
    expect(compareFitment({ ...baseRow, center_bore: null }, matchingScrape).matched).toBe(true)
  })
})

describe('verifyVehicleModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vehicleModelsEq.mockResolvedValue({ error: null })
    errorReportsLimit.mockResolvedValue({ data: [], error: null })
    errorReportsInsert.mockResolvedValue({ data: [{}], error: null })
  })

  it('serves a fresh cached match from the DB without re-scraping', async () => {
    const row = { ...baseRow, scrape_checked_at: new Date().toISOString(), scrape_matched: true }
    const result = await verifyVehicleModel(row)
    expect(result).toEqual({ dataSource: 'db', scrapeMismatch: false })
    expect(scrapeVehicleFitment).not.toHaveBeenCalled()
  })

  it('serves a fresh cached mismatch from the stored snapshot without re-scraping', async () => {
    const row = {
      ...baseRow,
      scrape_checked_at: new Date().toISOString(),
      scrape_matched: false,
      scrape_snapshot: mismatchedScrape,
    }
    const result = await verifyVehicleModel(row)
    expect(result.dataSource).toBe('site')
    expect(result.scrapeMismatch).toBe(true)
    expect(result.siteData).toEqual(mismatchedScrape)
    expect(scrapeVehicleFitment).not.toHaveBeenCalled()
  })

  it('falls back to the DB when the site cannot be reached', async () => {
    scrapeVehicleFitment.mockResolvedValueOnce(null)
    const result = await verifyVehicleModel({ ...baseRow, scrape_checked_at: null })
    expect(result).toEqual({ dataSource: 'db', scrapeMismatch: false })
    expect(vehicleModelsEq).not.toHaveBeenCalled() // cache left untouched, retried next time
  })

  it('live-verifies a stale row and confirms a match', async () => {
    scrapeVehicleFitment.mockResolvedValueOnce(matchingScrape)
    const result = await verifyVehicleModel({ ...baseRow, scrape_checked_at: null })
    expect(result).toEqual({ dataSource: 'db', scrapeMismatch: false })
    expect(vehicleModelsEq).toHaveBeenCalledWith('id', 'row-1')
    expect(errorReportsInsert).not.toHaveBeenCalled()
  })

  it('live-verifies a stale row, surfaces the site data on mismatch, and files a report', async () => {
    scrapeVehicleFitment.mockResolvedValueOnce(mismatchedScrape)
    const result = await verifyVehicleModel({ ...baseRow, scrape_checked_at: null })
    expect(result.dataSource).toBe('site')
    expect(result.scrapeMismatch).toBe(true)
    expect(result.siteData).toEqual(mismatchedScrape)
    await vi.waitFor(() => expect(errorReportsInsert).toHaveBeenCalledTimes(1))
  })

  it('does not file a duplicate report when one is already pending', async () => {
    errorReportsLimit.mockResolvedValueOnce({ data: [{ id: 'existing' }], error: null })
    scrapeVehicleFitment.mockResolvedValueOnce(mismatchedScrape)
    await verifyVehicleModel({ ...baseRow, scrape_checked_at: null })
    await vi.waitFor(() => expect(errorReportsLimit).toHaveBeenCalled())
    expect(errorReportsInsert).not.toHaveBeenCalled()
  })
})
