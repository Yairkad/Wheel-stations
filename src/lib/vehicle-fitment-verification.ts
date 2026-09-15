/**
 * Live-verifies a vehicle_models row's fitment fields against an external
 * site during search, with a cache so most searches skip the live scrape.
 * On a confirmed mismatch, the site's data is treated as authoritative for
 * display and an error_reports row is filed automatically for an admin to
 * fix the DB (the DB itself is never auto-corrected).
 */

import { createClient } from '@supabase/supabase-js'
import { scrapeVehicleFitment, ScrapeResult } from '@/lib/vehicle-scrape'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// How long a verified/mismatched verdict stays cached before we re-check live.
export const SCRAPE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface VehicleModelFitmentRow {
  id: string
  make: string
  make_he?: string | null
  model: string
  year_from?: number | null
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
  rim_sizes_allowed?: number[] | null
  tire_size_front?: string | null
  scrape_checked_at?: string | null
  scrape_matched?: boolean | null
  scrape_snapshot?: ScrapeResult | null
}

export interface VerificationResult {
  dataSource: 'db' | 'site'
  scrapeMismatch: boolean
  scrapeSourceUrl?: string | null
  siteData?: ScrapeResult | null
}

const DB_ONLY_RESULT: VerificationResult = { dataSource: 'db', scrapeMismatch: false }

function isCacheFresh(checkedAt?: string | null): boolean {
  if (!checkedAt) return false
  return Date.now() - new Date(checkedAt).getTime() < SCRAPE_CACHE_TTL_MS
}

export function compareFitment(row: VehicleModelFitmentRow, scraped: ScrapeResult): { matched: boolean; diffs: string[] } {
  const diffs: string[] = []

  if (row.bolt_count !== scraped.bolt_count) {
    diffs.push(`bolt_count: DB=${row.bolt_count} site=${scraped.bolt_count}`)
  }
  if (Math.abs(row.bolt_spacing - scraped.bolt_spacing) > 0.05) {
    diffs.push(`bolt_spacing: DB=${row.bolt_spacing} site=${scraped.bolt_spacing}`)
  }
  if (row.center_bore != null && scraped.center_bore != null && Math.abs(row.center_bore - scraped.center_bore) > 0.5) {
    diffs.push(`center_bore: DB=${row.center_bore} site=${scraped.center_bore}`)
  }

  return { matched: diffs.length === 0, diffs }
}

// Files an admin error report for a confirmed DB/site mismatch, reusing the
// same shape as the manual "report a mistake" flow (src/app/api/error-reports/route.ts).
// Skips if an auto-filed report for this vehicle is already pending, so a
// row that keeps failing verification doesn't spam duplicate reports.
async function reportScrapeMismatch(row: VehicleModelFitmentRow, scraped: ScrapeResult): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: existing } = await supabase
    .from('error_reports')
    .select('id')
    .eq('vehicle_model_id', row.id)
    .eq('status', 'pending')
    .ilike('notes', '%[auto-scrape]%')
    .limit(1)

  if (existing && existing.length > 0) return

  const today = new Date().toISOString().slice(0, 10)

  await supabase.from('error_reports').insert([{
    vehicle_model_id: row.id,
    make: row.make,
    model: row.model,
    year_from: row.year_from ?? null,
    correct_bolt_count: scraped.bolt_count,
    correct_bolt_spacing: scraped.bolt_spacing,
    correct_center_bore: scraped.center_bore,
    correct_rim_size: scraped.rim_sizes_allowed?.[0]?.toString() ?? null,
    correct_tire_size: scraped.tire_sizes?.[0] ?? null,
    notes: `[auto-scrape] אי-התאמה אוטומטית מול ${scraped.source} (${scraped.source_url}) בתאריך ${today}`,
    status: 'pending'
  }])
}

// Verifies one vehicle_models row against the external site, using the
// cached verdict when fresh. Never throws — any failure (scrape timeout,
// network error, DB write error) falls back to trusting the DB as-is.
export async function verifyVehicleModel(row: VehicleModelFitmentRow): Promise<VerificationResult> {
  try {
    if (isCacheFresh(row.scrape_checked_at)) {
      if (row.scrape_matched) return DB_ONLY_RESULT
      const snapshot = row.scrape_snapshot ?? null
      return {
        dataSource: 'site',
        scrapeMismatch: true,
        scrapeSourceUrl: snapshot?.source_url ?? null,
        siteData: snapshot
      }
    }

    const scraped = await scrapeVehicleFitment(row.make_he || row.make, row.model, row.year_from || new Date().getFullYear())

    // Couldn't reach/parse the site this time — leave the cache untouched so
    // the next search retries, and just trust the DB for now.
    if (!scraped) return DB_ONLY_RESULT

    const { matched } = compareFitment(row, scraped)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: updateError } = await supabase
      .from('vehicle_models')
      .update({
        scrape_checked_at: new Date().toISOString(),
        scrape_matched: matched,
        scrape_snapshot: matched ? null : scraped
      })
      .eq('id', row.id)

    if (updateError) console.error('Failed to update scrape cache:', updateError)

    if (matched) return DB_ONLY_RESULT

    reportScrapeMismatch(row, scraped).catch(err => console.error('Failed to file auto-scrape mismatch report:', err))

    return {
      dataSource: 'site',
      scrapeMismatch: true,
      scrapeSourceUrl: scraped.source_url,
      siteData: scraped
    }
  } catch (error) {
    console.error('verifyVehicleModel error:', error)
    return DB_ONLY_RESULT
  }
}
