/**
 * Import wheel fitment data from CSV to Supabase (Safe Upsert)
 * =============================================================
 *
 * Reads the CSV output from car_make2csv.py and safely updates Supabase:
 * - Existing records: only fills in NULL fields (never overwrites data)
 * - New records: inserts them with Hebrew make name
 * - No duplicates: matches on make + model + year_from (exact match)
 *
 * CSV format expected:
 *   Make,Model,Year Range,PCD,Center Bore,R12,R13,R14,R15,R16,R17,R18,R19,R20,URL
 *
 * Usage:
 *   npx ts-node scripts/import-wheel-fitment.ts                    # dry-run by default
 *   npx ts-node scripts/import-wheel-fitment.ts --apply            # actually write to DB
 *   npx ts-node scripts/import-wheel-fitment.ts --apply --make byd # filter by make
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local
function loadEnvFile() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '..', '.env.local'),
  ]
  for (const envPath of possiblePaths) {
    try {
      if (!fs.existsSync(envPath)) continue
      const envContent = fs.readFileSync(envPath, 'utf-8')
      for (const line of envContent.split(/\r?\n/)) {
        const idx = line.indexOf('=')
        if (idx === -1 || line.startsWith('#') || !line.trim()) continue
        const key = line.substring(0, idx).trim()
        const value = line.substring(idx + 1).trim()
        if (key) process.env[key] = value
      }
      console.log(`Loaded env from: ${envPath}`)
      return
    } catch (e) {
      console.error(`Failed to load ${envPath}:`, e)
    }
  }
  console.warn('No .env.local found')
}
loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Set them in .env.local or as environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ── Hebrew translations for makes ───────────────────────────

const MAKE_HEBREW: Record<string, string> = {
  'abarth': 'אבארת',
  'acura': 'אקורה',
  'aiways': 'איווייס',
  'aixam': 'איקסאם',
  'alfa romeo': 'אלפא רומיאו',
  'alpina': 'אלפינא',
  'alpine': 'אלפין',
  'aston martin': 'אסטון מרטין',
  'audi': 'אאודי',
  'bentley': 'בנטלי',
  'bmw': 'ב.מ.וו',
  'bugatti': 'בוגאטי',
  'buick': 'ביואיק',
  'byd': 'בי.ווי.די',
  'cadillac': 'קדילאק',
  'caterham': 'קטרהאם',
  'chery': 'צ\'רי',
  'chevrolet': 'שברולט',
  'chrysler': 'קרייזלר',
  'citroen': 'סיטרואן',
  'cupra': 'קופרה',
  'dacia': 'דאצ\'יה',
  'daihatsu': 'דייהטסו',
  'datsun': 'דאטסון',
  'dodge': 'דודג\'',
  'ds': 'די.אס',
  'faw - hongqi': 'הונגצ\'י',
  'ferrari': 'פרארי',
  'fiat': 'פיאט',
  'fisker': 'פיסקר',
  'ford': 'פורד',
  'genesis': 'ג\'נסיס',
  'gmc': 'ג\'י.אם.סי',
  'holden': 'הולדן',
  'honda': 'הונדה',
  'hummer': 'האמר',
  'hyundai': 'יונדאי',
  'infiniti': 'אינפיניטי',
  'isuzu': 'איסוזו',
  'iveco': 'איווקו',
  'jaguar': 'ג\'גואר',
  'jeep': 'ג\'יפ',
  'kawasaki atv': 'קוואסאקי',
  'kia': 'קיה',
  'lada': 'לאדה',
  'laika': 'לייקה',
  'lamborghini': 'למבורגיני',
  'lancia': 'לנצ\'יה',
  'land rover': 'לנד רובר',
  'leapmotor': 'ליפמוטור',
  'lexus': 'לקסוס',
  'lincoln': 'לינקולן',
  'lotus': 'לוטוס',
  'man': 'מאן',
  'maserati': 'מזראטי',
  'maxus': 'מקסוס',
  'maybach': 'מייבאך',
  'mazda': 'מאזדה',
  'mclaren': 'מקלארן',
  'mercedes': 'מרצדס',
  'mercury': 'מרקורי',
  'mg': 'אם.ג\'י',
  'mini': 'מיני',
  'mitsubishi': 'מיצובישי',
  'nio': 'ניו',
  'nissan': 'ניסאן',
  'oldsmobile': 'אולדסמוביל',
  'opel': 'אופל',
  'peugeot': 'פיג\'ו',
  'polestar': 'פולסטאר',
  'pontiac': 'פונטיאק',
  'porsche': 'פורשה',
  'proton': 'פרוטון',
  'ram': 'ראם',
  'renault': 'רנו',
  'roller team': 'רולר טים',
  'rolls-royce': 'רולס רויס',
  'rover': 'רובר',
  'saab': 'סאאב',
  'saturn': 'סטורן',
  'seat': 'סיאט',
  'skoda': 'סקודה',
  'smart': 'סמארט',
  'ssang yong': 'סאנגיונג',
  'subaru': 'סובארו',
  'suzuki': 'סוזוקי',
  'tesla': 'טסלה',
  'toyota': 'טויוטה',
  'tvr': 'טי.וי.אר',
  'vinfast': 'וינפאסט',
  'volkswagen': 'פולקסווגן',
  'volvo': 'וולוו',
  'xpeng': 'אקספנג',
  'yamaha atv': 'ימאהה',
  'zeekr': 'זיקר',
}

function getMakeHebrew(make: string): string {
  return MAKE_HEBREW[make] || make
}

// ── CSV Parsing ──────────────────────────────────────────────

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

function parseYearRange(yearRange: string): { yearFrom: number | null; yearTo: number | null } {
  const match = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/)
  if (!match) return { yearFrom: null, yearTo: null }
  return {
    yearFrom: parseInt(match[1]),
    yearTo: match[2] ? parseInt(match[2]) : null,
  }
}

function parsePcd(pcd: string): { boltCount: number; boltSpacing: number } | null {
  const match = pcd.match(/(\d+)x([\d.]+)/)
  if (!match) return null
  return {
    boltCount: parseInt(match[1]),
    boltSpacing: parseFloat(match[2]),
  }
}

function parseRimSizesFromColumns(row: string[]): number[] {
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

interface CsvRecord {
  make: string
  make_he: string
  model: string
  year_from: number | null
  year_to: number | null
  bolt_count: number | null
  bolt_spacing: number | null
  center_bore: number | null
  rim_sizes_allowed: number[] | null
  source_url: string | null
}

function readCsv(csvPath: string): CsvRecord[] {
  const content = fs.readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  const records: CsvRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i])
    if (row.length < 15) continue

    // Decode %20 in make and model names
    const make = decodeURIComponent(row[0] || '').toLowerCase().trim()
    const model = decodeURIComponent(row[1] || '').toLowerCase().trim()
    if (!make || !model) continue

    const { yearFrom, yearTo } = parseYearRange(row[2] || '')
    const pcd = parsePcd(row[3] || '')
    const centerBore = row[4] ? parseFloat(row[4]) : null
    const rimSizes = parseRimSizesFromColumns(row)
    const url = row[14]?.trim() || null

    records.push({
      make,
      make_he: getMakeHebrew(make),
      model,
      year_from: yearFrom,
      year_to: yearTo,
      bolt_count: pcd?.boltCount || null,
      bolt_spacing: pcd?.boltSpacing || null,
      center_bore: isNaN(centerBore!) ? null : centerBore,
      rim_sizes_allowed: rimSizes.length > 0 ? rimSizes : null,
      source_url: url,
    })
  }

  return records
}

// ── Main Import Logic ────────────────────────────────────────

async function importData() {
  const args = process.argv.slice(2)
  const applyMode = args.includes('--apply')
  const makeFilter = args.find((_, i, a) => a[i - 1] === '--make')

  console.log('='.repeat(60))
  console.log('Wheel Fitment Import - Safe Upsert')
  console.log('='.repeat(60))
  console.log(`Mode: ${applyMode ? 'APPLY (writing to DB)' : 'DRY RUN (preview only)'}`)
  if (makeFilter) console.log(`Filter: make = ${makeFilter}`)
  console.log()

  // Read CSV
  const csvPath = path.join(__dirname, '..', 'wheel_fitment_data (1).csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`)
    process.exit(1)
  }

  let records = readCsv(csvPath)
  console.log(`CSV: ${records.length} records loaded`)

  if (makeFilter) {
    records = records.filter(r => r.make === makeFilter.toLowerCase())
    console.log(`After filter: ${records.length} records`)
  }

  // Fetch all existing records from Supabase
  console.log('Fetching existing records from Supabase...')
  const { data: existing, error: fetchError } = await supabase
    .from('vehicle_models')
    .select('id, make, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, make_he, rim_sizes_allowed, source_url')

  if (fetchError) {
    console.error('Failed to fetch existing records:', fetchError.message)
    process.exit(1)
  }

  console.log(`Supabase: ${existing?.length || 0} existing records\n`)

  // Build lookup map: "make|model|year_from" -> record
  const existingMap = new Map<string, typeof existing[0]>()
  for (const row of existing || []) {
    const key = `${row.make?.toLowerCase()}|${row.model?.toLowerCase()}|${row.year_from || ''}`
    existingMap.set(key, row)
  }

  const stats = { updated: 0, inserted: 0, skipped: 0, errors: 0 }

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    const key = `${rec.make}|${rec.model}|${rec.year_from || ''}`
    const match = existingMap.get(key)

    if (match) {
      // Record exists - only update NULL fields
      const updates: Record<string, unknown> = {}

      if (!match.center_bore && rec.center_bore) updates.center_bore = rec.center_bore
      if (!match.bolt_count && rec.bolt_count) updates.bolt_count = rec.bolt_count
      if (!match.bolt_spacing && rec.bolt_spacing) updates.bolt_spacing = rec.bolt_spacing
      if (!match.rim_sizes_allowed && rec.rim_sizes_allowed) updates.rim_sizes_allowed = rec.rim_sizes_allowed
      if (!match.source_url && rec.source_url) updates.source_url = rec.source_url
      if (!match.make_he && rec.make_he) updates.make_he = rec.make_he

      if (Object.keys(updates).length === 0) {
        stats.skipped++
        continue
      }

      const fields = Object.keys(updates).join(', ')
      console.log(`  UPDATE ${rec.make} ${rec.model} (${rec.year_from || '?'}) -> ${fields}`)

      if (applyMode) {
        const { error } = await supabase
          .from('vehicle_models')
          .update(updates)
          .eq('id', match.id)

        if (error) {
          console.error(`    Error: ${error.message}`)
          stats.errors++
          continue
        }
      }
      stats.updated++
    } else {
      // New record - insert
      console.log(`  INSERT ${rec.make} ${rec.model} (${rec.year_from || '?'}) [${rec.make_he}]`)

      if (applyMode) {
        const { error } = await supabase
          .from('vehicle_models')
          .insert({
            make: rec.make,
            make_he: rec.make_he,
            model: rec.model,
            year_from: rec.year_from,
            year_to: rec.year_to,
            bolt_count: rec.bolt_count,
            bolt_spacing: rec.bolt_spacing,
            center_bore: rec.center_bore,
            rim_sizes_allowed: rec.rim_sizes_allowed,
            source_url: rec.source_url,
            source: 'wheelfitment.eu',
          })

        if (error) {
          if (error.code === '23505') {
            console.log(`    Duplicate, skipping`)
            stats.skipped++
          } else {
            console.error(`    Error: ${error.message}`)
            stats.errors++
          }
          continue
        }
      }
      stats.inserted++
    }

    // Progress
    if ((i + 1) % 200 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${records.length} ---\n`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`  Updated:  ${stats.updated} (filled NULL fields on existing records)`)
  console.log(`  Inserted: ${stats.inserted} (new records)`)
  console.log(`  Skipped:  ${stats.skipped} (already complete or duplicate)`)
  console.log(`  Errors:   ${stats.errors}`)
  console.log(`  Total:    ${records.length}`)

  if (!applyMode) {
    console.log('\nThis was a DRY RUN. No changes were made.')
    console.log('Run with --apply to write to Supabase.')
  }

  console.log()
}

importData().catch(console.error)
