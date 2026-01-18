/**
 * Vehicle Lookup API
 * GET /api/vehicle/lookup?plate=1234567 - Get vehicle details by license plate from data.gov.il
 * GET /api/vehicle/lookup?plate=1234567&admin=true&admin_password=xxx - Include find-car.co.il fallback
 * Returns vehicle info + PCD (bolt pattern) for wheel matching
 *
 * Searches in multiple databases:
 * 1. Regular vehicles database (053cea08-09bc-40ec-8f7a-156f0677aff3)
 * 2. Personal import vehicles database (03adc637-b6fe-402b-9937-7c3d3afc9140) - fallback
 * 3. find-car.co.il (admin only) - scrapes when gov databases don't have the vehicle
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractMakeFromHebrew } from '@/lib/pcd-database'
import { createClient } from '@supabase/supabase-js'
import { WHEELS_ADMIN_PASSWORD_CLIENT } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// data.gov.il resource IDs for vehicle databases
const RESOURCE_ID_REGULAR = '053cea08-09bc-40ec-8f7a-156f0677aff3'
const RESOURCE_ID_PERSONAL_IMPORT = '03adc637-b6fe-402b-9937-7c3d3afc9140'

// Regular vehicle record (has tire info)
interface VehicleRecord {
  mispar_rechev: number
  tozeret_nm: string        // Manufacturer (Hebrew) - e.g. "פיאט תורכיה"
  tozeret_cd: number        // Manufacturer code
  kinuy_mishari: string     // Commercial name (Hebrew) - e.g. "QUBO"
  degem_nm: string          // Model name - e.g. "225AXF1A-07B"
  degem_cd: number          // Model code
  ramat_gimur: string       // Trim level - e.g. "ACTIVE"
  shnat_yitzur: number      // Year of manufacture
  sug_degem: string         // Model type
  baalut: string            // Ownership type
  misgeret: string          // Chassis number
  tzeva_cd: number          // Color code
  tzeva_rechev: string      // Vehicle color
  zmig_kidmi: string        // Front tire - e.g. "185/65R15"
  zmig_ahori: string        // Rear tire
  sug_delek_nm: string      // Fuel type
  horaat_rishum: number     // Registration instruction
  moed_aliya_lakvish: string // Road entry date
  tokef_dt: string          // License expiry date
  mivchan_acharon_dt: string // Last test date
}

// Personal import vehicle record (no tire info)
interface PersonalImportRecord {
  mispar_rechev: number
  shilda: string            // VIN/chassis number
  tozeret_cd: number        // Manufacturer code
  tozeret_nm: string        // Manufacturer name - e.g. "TOYOTA USA"
  sug_rechev_cd: number     // Vehicle type code
  sug_rechev_nm: string     // Vehicle type
  degem_nm: string          // Model name - e.g. "HYBRID AHV40L-CEXGBA"
  mishkal_kolel: number     // Total weight
  shnat_yitzur: number      // Year of manufacture
  nefach_manoa: number      // Engine displacement
  tozeret_eretz_nm: string  // Country of origin
  degem_manoa: string       // Engine model
  mivchan_acharon_dt: string // Last inspection date
  tokef_dt: string          // License expiry date
  sug_yevu: string          // Import type - e.g. "יבוא אישי-משומש"
  moed_aliya_lakvish: string // Road entry date
  sug_delek_nm: string      // Fuel type
}

interface DataGovResponse<T> {
  success: boolean
  result: {
    records: T[]
    total: number
  }
}

// Scraped vehicle data from find-car.co.il
interface FindCarScrapedData {
  manufacturer: string
  model: string
  year: number
  tire_size: string | null
}

/**
 * Scrape vehicle data from find-car.co.il (admin only fallback)
 * Returns only: manufacturer, model, year, tire size
 */
async function scrapeFromFindCar(plate: string): Promise<FindCarScrapedData | null> {
  try {
    const url = `https://www.find-car.co.il/car/private/${plate}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.find-car.co.il/',
        'Origin': 'https://www.find-car.co.il',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      next: { revalidate: 0 } // Don't cache requests
    })

    if (!response.ok) {
      console.error('find-car.co.il fetch failed:', response.status)
      return null
    }

    const html = await response.text()

    // Check if it's a 404 page (vehicle not found)
    if (html.includes('אופס') && html.includes('404') || html.includes('לא מצאנו את הרכב')) {
      console.log('find-car.co.il: Vehicle not found (404 page)')
      return null
    }

    // find-car.co.il HTML structure:
    // <span>שם תוצר</span>
    // <strong>סובארו</strong>

    // Extract manufacturer (שם תוצר)
    const makeMatch = html.match(/שם תוצר<\/span>\s*<strong>([^<]+)<\/strong>/i) ||
                      html.match(/יצרן<\/span>\s*<strong>([^<]+)<\/strong>/i) ||
                      html.match(/מותג<\/span>\s*<strong>([^<]+)<\/strong>/i)

    // Extract model (כינוי מסחרי)
    const modelMatch = html.match(/כינוי מסחרי<\/span>\s*<strong>([^<]+)<\/strong>/i) ||
                       html.match(/דגם<\/span>\s*<strong>([^<]+)<\/strong>/i)

    // Extract year (שנת יצור)
    const yearMatch = html.match(/שנת יצור<\/span>\s*<strong>(\d{4})<\/strong>/i) ||
                      html.match(/שנת ייצור<\/span>\s*<strong>(\d{4})<\/strong>/i)

    // Extract tire size (צמיג קדמי)
    const tireMatch = html.match(/צמיג קדמי<\/span>\s*<strong>([^<]+)<\/strong>/i) ||
                      html.match(/צמיג<\/span>\s*<strong>([^<]*\d+\/\d+[^<]*)<\/strong>/i)

    if (!makeMatch || !modelMatch || !yearMatch) {
      console.log('find-car.co.il: Could not extract required fields. Make:', !!makeMatch, 'Model:', !!modelMatch, 'Year:', !!yearMatch)
      return null
    }

    return {
      manufacturer: makeMatch[1].trim(),
      model: modelMatch[1].trim(),
      year: parseInt(yearMatch[1]),
      tire_size: tireMatch ? tireMatch[1].trim() : null
    }
  } catch (error) {
    console.error('Error scraping find-car.co.il:', error)
    return null
  }
}

// Hebrew to English make translations for wheelfitment.eu
const MAKE_TRANSLATIONS: Record<string, string> = {
  'טויוטה': 'toyota',
  'יונדאי': 'hyundai',
  'קיה': 'kia',
  'מאזדה': 'mazda',
  'הונדה': 'honda',
  'ניסאן': 'nissan',
  'מיצובישי': 'mitsubishi',
  'סוזוקי': 'suzuki',
  'סובארו': 'subaru',
  'פולקסווגן': 'volkswagen',
  'אאודי': 'audi',
  'ב.מ.וו': 'bmw',
  'מרצדס': 'mercedes-benz',
  'פורד': 'ford',
  'שברולט': 'chevrolet',
  'פיאט': 'fiat',
  'פיג\'ו': 'peugeot',
  'סיטרואן': 'citroen',
  'רנו': 'renault',
  'וולוו': 'volvo',
  'ג\'יפ': 'jeep',
  'לקסוס': 'lexus',
  'סקודה': 'skoda',
  'אופל': 'opel',
  'סיאט': 'seat',
  'מיני': 'mini',
  'דאצ\'יה': 'dacia',
  'פורשה': 'porsche',
}

function normalizeMakeForWheelfitment(make: string): string {
  const makeLower = make.toLowerCase().trim()
  for (const [heb, eng] of Object.entries(MAKE_TRANSLATIONS)) {
    if (makeLower.includes(heb.toLowerCase())) {
      return eng
    }
  }
  return makeLower.replace(/\s+/g, '').replace(/[\-\.]/g, '')
}

// Scrape PCD data from wheelfitment.eu
async function scrapeWheelfitmentForLookup(make: string, model: string, year: number): Promise<{
  bolt_count: number
  bolt_spacing: number
  center_bore: number | null
  rim_sizes_allowed: number[]
  source_url: string
} | null> {
  const makeNormalized = normalizeMakeForWheelfitment(make)

  try {
    // Step 1: Get list of models for this make
    const makeUrl = `https://www.wheelfitment.eu/car/${makeNormalized}.html`
    const makeResponse = await fetch(makeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })

    if (!makeResponse.ok) return null

    const makeHtml = await makeResponse.text()
    const modelLower = model.toLowerCase().replace(/[\s\-]/g, '')
    const rowRegex = /<tr[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>\(([^)]*)\)<\/td>[\s\S]*?<\/tr>/gi

    let bestMatch: { url: string; yearFrom: number; yearTo: number | null } | null = null
    let fallbackMatch: { url: string; yearFrom: number; yearTo: number | null } | null = null
    let match

    while ((match = rowRegex.exec(makeHtml)) !== null) {
      const modelUrl = match[1]
      const modelName = match[2].trim()
      const yearRange = match[3].trim()
      const yearMatch = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/)
      const yearFrom = yearMatch ? parseInt(yearMatch[1]) : 0
      const yearTo = yearMatch && yearMatch[2] ? parseInt(yearMatch[2]) : null
      const modelNameClean = modelName.toLowerCase().replace(/[\s\-]/g, '')

      if (modelNameClean.includes(modelLower) || modelLower.includes(modelNameClean)) {
        // Check if year is within range
        if (yearFrom <= year && (yearTo === null || yearTo >= year)) {
          bestMatch = { url: modelUrl, yearFrom, yearTo }
          break // Found exact match with correct year range - stop searching
        }
        // Save as fallback only if we don't have one yet, preferring newer models
        if (!fallbackMatch || yearFrom > fallbackMatch.yearFrom) {
          fallbackMatch = { url: modelUrl, yearFrom, yearTo }
        }
      }
    }

    // Use exact match if found, otherwise use fallback (but log warning)
    if (!bestMatch && fallbackMatch) {
      console.warn(`Wheelfitment: No exact year match for ${model} ${year}, using fallback from ${fallbackMatch.yearFrom}-${fallbackMatch.yearTo || 'present'}`)
      bestMatch = fallbackMatch
    }

    if (!bestMatch) return null

    // Step 2: Fetch model page for wheel data
    const modelPageUrl = bestMatch.url.startsWith('http') ? bestMatch.url : `https://www.wheelfitment.eu${bestMatch.url}`
    const modelResponse = await fetch(modelPageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })

    if (!modelResponse.ok) return null

    const modelHtml = await modelResponse.text()

    // Extract PCD
    const pcdMatch = modelHtml.match(/PCD[^<]*<\/td>\s*<td[^>]*>([^<]+)/i)
    const pcdStr = pcdMatch ? pcdMatch[1].trim() : null
    let boltCount = 0, boltSpacing = 0

    if (pcdStr) {
      const pcdParts = pcdStr.match(/(\d+)x([\d.]+)/)
      if (pcdParts) {
        boltCount = parseInt(pcdParts[1])
        boltSpacing = parseFloat(pcdParts[2])
      }
    }

    if (!boltCount || !boltSpacing) return null

    // Extract Center bore
    const cbMatch = modelHtml.match(/Center\s*bore[^<]*<\/td>\s*<td[^>]*>([\d.]+)/i)
    const centerBore = cbMatch ? parseFloat(cbMatch[1]) : null

    // Extract rim sizes
    const tireSizesMatch = modelHtml.match(/Possible\s*tire\s*sizes[^<]*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i)
    const rimSizesAllowed: number[] = []

    if (tireSizesMatch) {
      const rimMatches = tireSizesMatch[1].matchAll(/R(\d{2})/g)
      for (const m of rimMatches) {
        const size = parseInt(m[1])
        if (size >= 12 && size <= 24 && !rimSizesAllowed.includes(size)) {
          rimSizesAllowed.push(size)
        }
      }
      rimSizesAllowed.sort((a, b) => a - b)
    }

    return {
      bolt_count: boltCount,
      bolt_spacing: boltSpacing,
      center_bore: centerBore,
      rim_sizes_allowed: rimSizesAllowed,
      source_url: modelPageUrl
    }
  } catch (error) {
    console.error('Wheelfitment scrape error:', error)
    return null
  }
}

// Helper function to search for PCD data in our database
// If found without source_url (not verified), also checks wheelfitment and updates DB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findPcdData(
  supabase: any,
  makeHebrew: string,
  modelName: string,
  year: number,
  technicalModelName?: string // degem_nm from gov API (e.g., "S31/SM-00")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const makeEnglish = extractMakeFromHebrew(makeHebrew)
  const modelLower = modelName?.toLowerCase() || ''
  const technicalModelLower = technicalModelName?.toLowerCase() || ''

  // Extract first word from Hebrew make (e.g., "דונגפנג" from "דונגפנג סין")
  const makeHebrewFirstWord = makeHebrew.split(' ')[0]

  // Build make search condition - search by English (if available) or Hebrew
  const makeCondition = makeEnglish
    ? `make.ilike.%${makeEnglish}%,make_he.ilike.%${makeHebrewFirstWord}%`
    : `make_he.ilike.%${makeHebrewFirstWord}%`

  // Helper to find in DB
  async function searchDb(): Promise<any> {
    // First try: search by technical model name (degem_nm) in variants
    if (technicalModelLower) {
      const result1 = await supabase
        .from('vehicle_models')
        .select('*')
        .or(makeCondition)
        .ilike('variants', `%${technicalModelLower}%`)
        .lte('year_from', year)
        .or(`year_to.gte.${year},year_to.is.null`)
        .limit(1)

      if (!result1.error && result1.data && result1.data.length > 0) {
        return result1.data[0]
      }
    }

    // Second try: exact model match by commercial name
    const { data: vehicleModels, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .or(makeCondition)
      .ilike('model', `%${modelLower}%`)
      .lte('year_from', year)
      .or(`year_to.gte.${year},year_to.is.null`)
      .limit(1)

    if (!error && vehicleModels && vehicleModels.length > 0) {
      return vehicleModels[0]
    }

    // Third try: search in variants column
    const result2 = await supabase
      .from('vehicle_models')
      .select('*')
      .or(makeCondition)
      .ilike('variants', `%${modelLower}%`)
      .lte('year_from', year)
      .or(`year_to.gte.${year},year_to.is.null`)
      .limit(1)

    if (!result2.error && result2.data && result2.data.length > 0) {
      return result2.data[0]
    }

    // Fourth try: search for first word only
    if (modelLower.includes(' ')) {
      const firstWord = modelLower.split(' ')[0]
      const result3 = await supabase
        .from('vehicle_models')
        .select('*')
        .or(makeCondition)
        .ilike('model', `%${firstWord}%`)
        .lte('year_from', year)
        .or(`year_to.gte.${year},year_to.is.null`)
        .limit(1)

      if (!result3.error && result3.data && result3.data.length > 0) {
        return result3.data[0]
      }
    }

    return null
  }

  // Step 1: Search in DB
  const dbResult = await searchDb()

  // Step 2: If found with source_url - already verified, return it
  if (dbResult && dbResult.source_url) {
    return dbResult
  }

  // Step 3: Not verified or not found - try wheelfitment
  const wheelfitmentData = await scrapeWheelfitmentForLookup(makeHebrew, modelName, year)

  if (wheelfitmentData) {
    if (dbResult) {
      // Update existing record with verified data
      await supabase
        .from('vehicle_models')
        .update({
          bolt_count: wheelfitmentData.bolt_count,
          bolt_spacing: wheelfitmentData.bolt_spacing,
          center_bore: wheelfitmentData.center_bore,
          rim_sizes_allowed: wheelfitmentData.rim_sizes_allowed,
          source_url: wheelfitmentData.source_url,
          source: 'wheelfitment.eu'
        })
        .eq('id', dbResult.id)

      return { ...dbResult, ...wheelfitmentData }
    } else {
      // Create new record
      const { data: newRecord } = await supabase
        .from('vehicle_models')
        .insert([{
          make: makeEnglish || makeHebrewFirstWord.toLowerCase(),
          make_he: makeHebrewFirstWord,
          model: modelName.toLowerCase(),
          year_from: year,
          year_to: null,
          bolt_count: wheelfitmentData.bolt_count,
          bolt_spacing: wheelfitmentData.bolt_spacing,
          center_bore: wheelfitmentData.center_bore,
          rim_sizes_allowed: wheelfitmentData.rim_sizes_allowed,
          source_url: wheelfitmentData.source_url,
          source: 'wheelfitment.eu',
          added_by: 'auto-lookup'
        }])
        .select()

      return newRecord?.[0] || wheelfitmentData
    }
  }

  // Step 4: Wheelfitment failed - return DB result if exists (even unverified)
  return dbResult
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plate = searchParams.get('plate')
    const isAdmin = searchParams.get('admin') === 'true'
    // Get admin password from header (more secure) or URL (backwards compatibility)
    const adminPassword = request.headers.get('x-admin-password') || searchParams.get('admin_password')

    // Validate admin access for extended lookup
    const hasAdminAccess = isAdmin && WHEELS_ADMIN_PASSWORD_CLIENT && adminPassword === WHEELS_ADMIN_PASSWORD_CLIENT

    if (!plate) {
      return NextResponse.json(
        { error: 'חסר מספר רכב' },
        { status: 400 }
      )
    }

    // Clean the plate number - remove dashes and spaces
    const cleanPlate = plate.replace(/[-\s]/g, '')

    // Validate plate format (7-8 digits)
    if (!/^\d{7,8}$/.test(cleanPlate)) {
      return NextResponse.json(
        { error: 'פורמט לא תקין. נדרשים 7-8 ספרות.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Step 1: Try regular vehicles database first
    const regularApiUrl = new URL('https://data.gov.il/api/3/action/datastore_search')
    regularApiUrl.searchParams.set('resource_id', RESOURCE_ID_REGULAR)
    regularApiUrl.searchParams.set('q', cleanPlate)
    regularApiUrl.searchParams.set('limit', '1')

    const regularResponse = await fetch(regularApiUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (regularResponse.ok) {
      const regularData: DataGovResponse<VehicleRecord> = await regularResponse.json()

      if (regularData.success && regularData.result.records.length > 0) {
        const vehicle = regularData.result.records[0]
        const pcdData = await findPcdData(
          supabase,
          vehicle.tozeret_nm,
          vehicle.kinuy_mishari,
          vehicle.shnat_yitzur,
          vehicle.degem_nm // Technical model name for better matching
        )

        return NextResponse.json({
          success: true,
          source: 'regular',
          vehicle: {
            plate: vehicle.mispar_rechev,
            manufacturer: vehicle.tozeret_nm,
            manufacturer_code: vehicle.tozeret_cd,
            model: vehicle.kinuy_mishari,
            model_name: vehicle.degem_nm,
            model_code: vehicle.degem_cd,
            trim: vehicle.ramat_gimur,
            year: vehicle.shnat_yitzur,
            color: vehicle.tzeva_rechev,
            fuel_type: vehicle.sug_delek_nm,
            front_tire: vehicle.zmig_kidmi,
            rear_tire: vehicle.zmig_ahori,
            license_expiry: vehicle.tokef_dt,
            last_test: vehicle.mivchan_acharon_dt,
            road_entry_date: vehicle.moed_aliya_lakvish,
            ownership: vehicle.baalut,
            chassis: vehicle.misgeret,
          },
          wheel_fitment: pcdData ? {
            bolt_count: pcdData.bolt_count,
            bolt_spacing: pcdData.bolt_spacing,
            pcd: `${pcdData.bolt_count}x${pcdData.bolt_spacing}`,
            center_bore: pcdData.center_bore,
            rim_sizes_allowed: pcdData.rim_sizes_allowed,
            source_url: pcdData.source_url,
          } : null,
          pcd_found: !!pcdData
        })
      }
    }

    // Step 2: Vehicle not found in regular database, try personal import database
    const importApiUrl = new URL('https://data.gov.il/api/3/action/datastore_search')
    importApiUrl.searchParams.set('resource_id', RESOURCE_ID_PERSONAL_IMPORT)
    importApiUrl.searchParams.set('q', cleanPlate)
    importApiUrl.searchParams.set('limit', '1')

    const importResponse = await fetch(importApiUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (!importResponse.ok) {
      console.error('data.gov.il API error:', importResponse.status, importResponse.statusText)
      return NextResponse.json(
        { error: 'שגיאה בחיבור למאגר הממשלתי' },
        { status: 502 }
      )
    }

    const importData: DataGovResponse<PersonalImportRecord> = await importResponse.json()

    if (!importData.success || !importData.result.records.length) {
      // Step 3: If admin, try find-car.co.il as last resort
      if (hasAdminAccess) {
        console.log('Admin lookup: Trying find-car.co.il for plate:', cleanPlate)
        const scrapedData = await scrapeFromFindCar(cleanPlate)

        if (scrapedData) {
          return NextResponse.json({
            success: true,
            source: 'find_car_scrape',
            scrape_warning: 'מידע זה נשלף מ-find-car.co.il ולא ממאגרי משרד התחבורה. יש לאמת את המידע.',
            vehicle: {
              plate: cleanPlate,
              manufacturer: scrapedData.manufacturer,
              model: scrapedData.model,
              year: scrapedData.year,
              front_tire: scrapedData.tire_size,
              rear_tire: scrapedData.tire_size,
            },
            wheel_fitment: null,
            pcd_found: false
          })
        }
      }

      return NextResponse.json(
        { error: 'הרכב לא נמצא במאגרים', plate: cleanPlate },
        { status: 404 }
      )
    }

    // Found in personal import database
    const vehicle = importData.result.records[0]

    // Extract model name from degem_nm (e.g., "HYBRID AHV40L-CEXGBA" -> try to find "CAMRY" or similar)
    // For personal imports, we search by make and try to find matching PCD
    const pcdData = await findPcdData(
      supabase,
      vehicle.tozeret_nm,
      vehicle.degem_nm,
      vehicle.shnat_yitzur
    )

    return NextResponse.json({
      success: true,
      source: 'personal_import', // Indicate this is from personal import database
      is_personal_import: true,
      personal_import_warning: 'רכב זה מיובא בייבוא אישי. מידות הגלגלים עשויות להיות שונות מהדגם המקומי.',
      vehicle: {
        plate: vehicle.mispar_rechev,
        manufacturer: vehicle.tozeret_nm,
        manufacturer_code: vehicle.tozeret_cd,
        model: vehicle.degem_nm,           // Use degem_nm as model for personal imports
        model_name: vehicle.degem_nm,
        year: vehicle.shnat_yitzur,
        fuel_type: vehicle.sug_delek_nm,
        license_expiry: vehicle.tokef_dt,
        last_test: vehicle.mivchan_acharon_dt,
        road_entry_date: vehicle.moed_aliya_lakvish,
        chassis: vehicle.shilda,
        import_type: vehicle.sug_yevu,      // e.g., "יבוא אישי-משומש"
        origin_country: vehicle.tozeret_eretz_nm, // e.g., "USA"
        engine_displacement: vehicle.nefach_manoa,
        // Note: Personal import database doesn't have tire info
        front_tire: null,
        rear_tire: null,
      },
      wheel_fitment: pcdData ? {
        bolt_count: pcdData.bolt_count,
        bolt_spacing: pcdData.bolt_spacing,
        pcd: `${pcdData.bolt_count}x${pcdData.bolt_spacing}`,
        center_bore: pcdData.center_bore,
        rim_sizes_allowed: pcdData.rim_sizes_allowed,
        source_url: pcdData.source_url,
      } : null,
      pcd_found: !!pcdData
    })

  } catch (error) {
    console.error('Error in vehicle lookup:', error)
    return NextResponse.json(
      { error: 'שגיאה פנימית בשרת' },
      { status: 500 }
    )
  }
}
