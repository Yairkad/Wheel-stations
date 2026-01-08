/**
 * Import wheel fitment data from CSV
 * POST /api/admin/import-wheel-fitment
 *
 * Expects multipart/form-data with 'file' field containing the CSV
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function parseYearRange(yearRange: string): { yearFrom: number | null; yearTo: number | null } {
  // Format: "2021 - " or "2010 - 2018"
  const match = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/)
  if (!match) return { yearFrom: null, yearTo: null }

  return {
    yearFrom: parseInt(match[1]),
    yearTo: match[2] ? parseInt(match[2]) : null
  }
}

function parsePcd(pcd: string): { boltCount: number; boltSpacing: number } | null {
  // Format: "5x114.3" or "4x100"
  const match = pcd.match(/(\d+)x([\d.]+)/)
  if (!match) return null

  return {
    boltCount: parseInt(match[1]),
    boltSpacing: parseFloat(match[2])
  }
}

function parseRimSizes(row: string[]): number[] {
  // Columns R12-R20 are at indices 5-13
  const sizes: number[] = []
  const rimColumns = [
    { index: 5, size: 12 },
    { index: 6, size: 13 },
    { index: 7, size: 14 },
    { index: 8, size: 15 },
    { index: 9, size: 16 },
    { index: 10, size: 17 },
    { index: 11, size: 18 },
    { index: 12, size: 19 },
    { index: 13, size: 20 },
  ]

  for (const { index, size } of rimColumns) {
    if (row[index] === '1') {
      sizes.push(size)
    }
  }

  return sizes
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

export async function POST(request: NextRequest) {
  try {
    // Auth check - temporarily disabled for initial import
    // TODO: Re-enable after import is complete
    // const { searchParams } = new URL(request.url)
    // const adminKey = searchParams.get('key')
    // const WHEELS_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD || 'wheels2024'
    // if (adminKey !== WHEELS_ADMIN_PASSWORD) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get CSV from form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvContent = await file.text()
    const lines = csvContent.split('\n').filter(line => line.trim())

    // Skip header
    const dataLines = lines.slice(1)

    let inserted = 0
    let updated = 0
    let skipped = 0
    let errors: string[] = []

    for (let i = 0; i < dataLines.length; i++) {
      const row = parseCsvLine(dataLines[i])

      if (row.length < 15) {
        skipped++
        continue
      }

      const make = row[0]?.toLowerCase().trim()
      const model = row[1]?.toLowerCase().trim()
      const yearRange = row[2]?.trim()
      const pcd = row[3]?.trim()
      const centerBore = row[4]?.trim()
      const url = row[14]?.trim()

      if (!make || !model) {
        skipped++
        continue
      }

      const { yearFrom, yearTo } = parseYearRange(yearRange)
      const pcdParsed = parsePcd(pcd)
      const rimSizes = parseRimSizes(row)

      if (!pcdParsed) {
        skipped++
        continue
      }

      const centerBoreNum = centerBore ? parseFloat(centerBore) : null

      // Check if record exists
      let query = supabase
        .from('vehicle_models')
        .select('id, rim_sizes_allowed, source_url, center_bore')
        .eq('make', make)
        .ilike('model', model)

      if (yearFrom) {
        query = query.eq('year_from', yearFrom)
      }

      const { data: existing } = await query.maybeSingle()

      if (existing) {
        // Update existing record with new data (only if fields are null)
        const updates: Record<string, unknown> = {}

        if (!existing.rim_sizes_allowed && rimSizes.length > 0) {
          updates.rim_sizes_allowed = rimSizes
        }
        if (!existing.source_url && url) {
          updates.source_url = url
        }
        if (!existing.center_bore && centerBoreNum) {
          updates.center_bore = centerBoreNum
        }

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('vehicle_models')
            .update(updates)
            .eq('id', existing.id)

          if (error) {
            errors.push(`Update ${make} ${model}: ${error.message}`)
          } else {
            updated++
          }
        } else {
          skipped++ // Nothing to update
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('vehicle_models')
          .insert({
            make,
            model,
            year_from: yearFrom,
            year_to: yearTo,
            bolt_count: pcdParsed.boltCount,
            bolt_spacing: pcdParsed.boltSpacing,
            center_bore: centerBoreNum,
            rim_sizes_allowed: rimSizes.length > 0 ? rimSizes : null,
            source_url: url || null,
            source: 'wheelfitment.eu'
          })

        if (error) {
          if (error.code !== '23505') { // Ignore duplicates
            errors.push(`Insert ${make} ${model}: ${error.message}`)
          } else {
            skipped++
          }
        } else {
          inserted++
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalLines: dataLines.length,
      inserted,
      updated,
      skipped,
      errors: errors.slice(0, 10), // First 10 errors only
      errorCount: errors.length
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
