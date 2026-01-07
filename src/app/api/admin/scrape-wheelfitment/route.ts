/**
 * Scrape Wheel Fitment API
 * POST /api/admin/scrape-wheelfitment
 *
 * Scrapes wheelfitment.eu for vehicles missing data in our Supabase database
 * and updates them with center_bore, rim_sizes_allowed, and source_url
 *
 * Body parameters:
 *   - make?: string - Filter by make name
 *   - limit?: number - Max vehicles to process (default: 50)
 *   - dryRun?: boolean - Preview without updating
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BASE_URL = 'https://www.wheelfitment.eu'

// Hebrew to English make translations
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
  'קרייזלר': 'chrysler',
  'דודג\'': 'dodge',
  'לקסוס': 'lexus',
  'אינפיניטי': 'infiniti',
  'סקודה': 'skoda',
  'אופל': 'opel',
  'בי.ווי.די': 'byd',
  'סיאט': 'seat',
  'מיני': 'mini',
}

function normalizeMake(make: string): string {
  const makeLower = make.toLowerCase().trim()

  // Check Hebrew translations
  if (MAKE_TRANSLATIONS[makeLower]) {
    return MAKE_TRANSLATIONS[makeLower]
  }

  // Already English
  if (Object.values(MAKE_TRANSLATIONS).includes(makeLower)) {
    return makeLower
  }

  // Clean and return
  return makeLower.replace(/[\s\-.]/g, '')
}

interface WheelfitmentModel {
  model: string
  yearFrom: number | null
  yearTo: number | null
  url: string
}

async function getModelsForMake(make: string): Promise<WheelfitmentModel[]> {
  try {
    const url = `${BASE_URL}/car/${make}.html`
    const response = await fetch(url)

    if (!response.ok) {
      return []
    }

    const html = await response.text()
    const models: WheelfitmentModel[] = []

    // Parse HTML to find model links
    // Pattern: <tr><td><a href="...">Model Name</a></td><td>(2020 - )</td></tr>
    const rowRegex = /<tr[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>\(([^)]*)\)<\/td>[\s\S]*?<\/tr>/gi

    let match
    while ((match = rowRegex.exec(html)) !== null) {
      const modelUrl = match[1]
      const modelName = match[2].trim().toLowerCase()
      const yearRange = match[3].trim()

      // Parse year range: "2020 - " or "2015 - 2020"
      const yearMatch = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/)

      models.push({
        model: modelName,
        yearFrom: yearMatch ? parseInt(yearMatch[1]) : null,
        yearTo: yearMatch && yearMatch[2] ? parseInt(yearMatch[2]) : null,
        url: modelUrl.startsWith('http') ? modelUrl : `${BASE_URL}${modelUrl}`,
      })
    }

    return models
  } catch (error) {
    console.error(`Error fetching models for ${make}:`, error)
    return []
  }
}

interface WheelData {
  pcd: string | null
  centerBore: number | null
  rimSizes: number[]
  boltCount: number | null
  boltSpacing: number | null
}

async function getWheelData(url: string): Promise<WheelData | null> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const html = await response.text()

    // Extract PCD
    const pcdMatch = html.match(/PCD[^<]*<\/td>\s*<td[^>]*>([^<]+)/i)
    const pcd = pcdMatch ? pcdMatch[1].trim() : null

    // Parse PCD to bolt_count and bolt_spacing
    let boltCount: number | null = null
    let boltSpacing: number | null = null
    if (pcd) {
      const pcdParts = pcd.match(/(\d+)x([\d.]+)/)
      if (pcdParts) {
        boltCount = parseInt(pcdParts[1])
        boltSpacing = parseFloat(pcdParts[2])
      }
    }

    // Extract Center bore
    const cbMatch = html.match(/Center\s*bore[^<]*<\/td>\s*<td[^>]*>([\d.]+)/i)
    const centerBore = cbMatch ? parseFloat(cbMatch[1]) : null

    // Extract tire sizes
    const tireSizesMatch = html.match(/Possible\s*tire\s*sizes[^<]*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i)
    const rimSizes: number[] = []

    if (tireSizesMatch) {
      const sizesStr = tireSizesMatch[1]
      const rimMatches = sizesStr.matchAll(/R(\d{2})/g)
      for (const m of rimMatches) {
        const size = parseInt(m[1])
        if (size >= 12 && size <= 24 && !rimSizes.includes(size)) {
          rimSizes.push(size)
        }
      }
      rimSizes.sort((a, b) => a - b)
    }

    return { pcd, centerBore, rimSizes, boltCount, boltSpacing }
  } catch (error) {
    console.error(`Error fetching wheel data from ${url}:`, error)
    return null
  }
}

function findMatchingModel(
  models: WheelfitmentModel[],
  targetModel: string,
  targetYear: number | null
): WheelfitmentModel | null {
  const targetClean = targetModel.toLowerCase().replace(/[\s\-]/g, '')

  // Try exact match
  for (const m of models) {
    const modelClean = m.model.replace(/[\s\-]/g, '')
    if (modelClean === targetClean) {
      if (!targetYear || !m.yearFrom || (m.yearFrom <= targetYear && (m.yearTo || 2030) >= targetYear)) {
        return m
      }
    }
  }

  // Try partial match
  for (const m of models) {
    const modelClean = m.model.replace(/[\s\-]/g, '')
    if (targetClean.includes(modelClean) || modelClean.includes(targetClean)) {
      if (!targetYear || !m.yearFrom || (m.yearFrom <= targetYear && (m.yearTo || 2030) >= targetYear)) {
        return m
      }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    const WHEELS_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD || 'wheels2024'

    if (adminKey !== WHEELS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { make: makeFilter, limit = 50, dryRun = false } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch vehicles missing wheel fitment data
    let query = supabase
      .from('vehicle_models')
      .select('*')
      .or('center_bore.is.null,rim_sizes_allowed.is.null,source_url.is.null')
      .limit(limit)

    if (makeFilter) {
      query = query.ilike('make', `%${makeFilter}%`)
    }

    const { data: vehicles, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No vehicles found missing data',
        stats: { processed: 0, updated: 0, notFound: 0 }
      })
    }

    // Cache for make models
    const makeCache: Record<string, WheelfitmentModel[]> = {}

    const stats = {
      processed: 0,
      updated: 0,
      skipped: 0,
      notFound: 0,
      errors: 0,
    }

    const results: Array<{
      id: string
      make: string
      model: string
      status: string
      updates?: Record<string, unknown>
    }> = []

    for (const vehicle of vehicles) {
      const { id, make, model, year_from } = vehicle

      // Normalize make
      const makeNormalized = normalizeMake(make)

      // Get models for this make (cached)
      if (!makeCache[makeNormalized]) {
        makeCache[makeNormalized] = await getModelsForMake(makeNormalized)
        await new Promise(r => setTimeout(r, 300)) // Rate limiting
      }

      const makeModels = makeCache[makeNormalized]

      if (!makeModels.length) {
        stats.notFound++
        results.push({ id, make, model, status: 'make_not_found' })
        continue
      }

      // Find matching model
      const match = findMatchingModel(makeModels, model, year_from)

      if (!match) {
        stats.notFound++
        results.push({ id, make, model, status: 'model_not_found' })
        continue
      }

      // Get wheel data
      const wheelData = await getWheelData(match.url)
      await new Promise(r => setTimeout(r, 200)) // Rate limiting

      if (!wheelData) {
        stats.notFound++
        results.push({ id, make, model, status: 'wheel_data_not_found' })
        continue
      }

      // Prepare updates (only update null fields)
      const updates: Record<string, unknown> = {}

      if (wheelData.centerBore && !vehicle.center_bore) {
        updates.center_bore = wheelData.centerBore
      }
      if (wheelData.rimSizes.length > 0 && !vehicle.rim_sizes_allowed) {
        updates.rim_sizes_allowed = wheelData.rimSizes
      }
      if (match.url && !vehicle.source_url) {
        updates.source_url = match.url
      }
      if (wheelData.boltCount && !vehicle.bolt_count) {
        updates.bolt_count = wheelData.boltCount
      }
      if (wheelData.boltSpacing && !vehicle.bolt_spacing) {
        updates.bolt_spacing = wheelData.boltSpacing
      }

      if (Object.keys(updates).length === 0) {
        stats.skipped++
        results.push({ id, make, model, status: 'no_updates_needed' })
        continue
      }

      stats.processed++

      if (dryRun) {
        stats.updated++
        results.push({ id, make, model, status: 'would_update', updates })
      } else {
        // Update in Supabase
        const { error: updateError } = await supabase
          .from('vehicle_models')
          .update(updates)
          .eq('id', id)

        if (updateError) {
          stats.errors++
          results.push({ id, make, model, status: 'error', updates })
        } else {
          stats.updated++
          results.push({ id, make, model, status: 'updated', updates })
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      totalVehicles: vehicles.length,
      stats,
      results: results.slice(0, 20), // First 20 results
    })

  } catch (error: unknown) {
    console.error('Scrape error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Show status/help
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/scrape-wheelfitment',
    method: 'POST',
    auth: 'Add ?key=YOUR_ADMIN_PASSWORD to URL',
    body: {
      make: 'Optional - filter by make name',
      limit: 'Optional - max vehicles to process (default: 50)',
      dryRun: 'Optional - preview without updating (default: false)'
    },
    example: {
      make: 'toyota',
      limit: 20,
      dryRun: true
    }
  })
}
