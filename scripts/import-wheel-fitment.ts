/**
 * Import wheel fitment data from CSV to Supabase
 *
 * Usage:
 * 1. First run the SQL to add new columns (see comments below)
 * 2. Run: npx ts-node scripts/import-wheel-fitment.ts
 *
 * SQL to run first in Supabase:
 * ---------------------------------
 * ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS rim_sizes_allowed integer[] DEFAULT NULL;
 * ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;
 * CREATE INDEX IF NOT EXISTS idx_vehicle_models_make_model ON vehicle_models (make, model);
 * ---------------------------------
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CsvRow {
  make: string
  model: string
  yearRange: string
  pcd: string
  centerBore: string
  rimSizes: number[]
  url: string
}

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
  // Handle CSV with potential commas in quoted fields
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

async function importData() {
  console.log('Starting import...')

  // Read CSV file
  const csvPath = path.join(__dirname, 'wheel_fitment_data.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())

  // Skip header
  const dataLines = lines.slice(1)
  console.log(`Found ${dataLines.length} records to process`)

  let inserted = 0
  let updated = 0
  let errors = 0

  for (let i = 0; i < dataLines.length; i++) {
    const row = parseCsvLine(dataLines[i])

    if (row.length < 15) {
      console.warn(`Skipping line ${i + 2}: not enough columns`)
      continue
    }

    const make = row[0]?.toLowerCase().trim()
    const model = row[1]?.toLowerCase().trim()
    const yearRange = row[2]?.trim()
    const pcd = row[3]?.trim()
    const centerBore = row[4]?.trim()
    const url = row[14]?.trim()

    if (!make || !model) {
      console.warn(`Skipping line ${i + 2}: missing make or model`)
      continue
    }

    const { yearFrom, yearTo } = parseYearRange(yearRange)
    const pcdParsed = parsePcd(pcd)
    const rimSizes = parseRimSizes(row)

    if (!pcdParsed) {
      console.warn(`Skipping line ${i + 2}: invalid PCD "${pcd}"`)
      continue
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('vehicle_models')
      .select('id, rim_sizes_allowed, source_url, center_bore')
      .eq('make', make)
      .ilike('model', `%${model}%`)
      .eq('year_from', yearFrom)
      .maybeSingle()

    const centerBoreNum = centerBore ? parseFloat(centerBore) : null

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
          console.error(`Error updating ${make} ${model}: ${error.message}`)
          errors++
        } else {
          updated++
        }
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
        // Might be duplicate, try to find and update
        if (error.code === '23505') {
          console.log(`Duplicate: ${make} ${model} ${yearFrom}-${yearTo}`)
        } else {
          console.error(`Error inserting ${make} ${model}: ${error.message}`)
          errors++
        }
      } else {
        inserted++
      }
    }

    // Progress log every 100 records
    if ((i + 1) % 100 === 0) {
      console.log(`Processed ${i + 1}/${dataLines.length}...`)
    }
  }

  console.log('\n=== Import Complete ===')
  console.log(`Inserted: ${inserted}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  console.log(`Total processed: ${dataLines.length}`)
}

// Run import
importData().catch(console.error)
