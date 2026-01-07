/**
 * Scrape vehicle PCD data from wheelfitment.eu (primary) and wheel-size.com (fallback)
 * POST /api/vehicle-models/scrape
 *
 * Body: { make, model, year, source?: 'wheelfitment' | 'wheelsize' | 'auto' }
 */

import { NextRequest, NextResponse } from 'next/server'

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
  'מרצדס בנץ': 'mercedes-benz',
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
  'ג\'נסיס': 'genesis',
  'דאצ\'יה': 'dacia',
  'אלפא רומיאו': 'alfaromeo',
  'פורשה': 'porsche',
  'ג\'גואר': 'jaguar',
  'לנד רובר': 'landrover',
  'סאאב': 'saab',
}

function normalizeMake(make: string): string {
  const makeLower = make.toLowerCase().trim()

  // Check Hebrew translations
  for (const [heb, eng] of Object.entries(MAKE_TRANSLATIONS)) {
    if (makeLower.includes(heb.toLowerCase())) {
      return eng
    }
  }

  // Already English - clean it up
  return makeLower
    .replace(/\s+/g, '')
    .replace(/[\-\.]/g, '')
}

interface ScrapeResult {
  make: string
  model: string
  year: number
  bolt_count: number
  bolt_spacing: number
  center_bore: number | null
  rim_sizes: string[]
  rim_sizes_allowed: number[]
  tire_sizes: string[]
  source_url: string
  source: string
}

// Scrape from wheelfitment.eu
async function scrapeWheelfitment(make: string, model: string, year: number): Promise<ScrapeResult | null> {
  const makeNormalized = normalizeMake(make)

  try {
    // Step 1: Get list of models for this make
    const makeUrl = `https://www.wheelfitment.eu/car/${makeNormalized}.html`
    console.log('Fetching wheelfitment make page:', makeUrl)

    const makeResponse = await fetch(makeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!makeResponse.ok) {
      console.log('Make page not found:', makeResponse.status)
      return null
    }

    const makeHtml = await makeResponse.text()

    // Find matching model in the list
    // Pattern: <a href="URL">Model Name</a></td><td>(2020 - )</td>
    const modelLower = model.toLowerCase().replace(/[\s\-]/g, '')
    const rowRegex = /<tr[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>\(([^)]*)\)<\/td>[\s\S]*?<\/tr>/gi

    let bestMatch: { url: string; modelName: string; yearFrom: number; yearTo: number | null } | null = null
    let match

    while ((match = rowRegex.exec(makeHtml)) !== null) {
      const modelUrl = match[1]
      const modelName = match[2].trim()
      const yearRange = match[3].trim()

      // Parse year range: "2020 - " or "2015 - 2020"
      const yearMatch = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/)
      const yearFrom = yearMatch ? parseInt(yearMatch[1]) : 0
      const yearTo = yearMatch && yearMatch[2] ? parseInt(yearMatch[2]) : null

      const modelNameClean = modelName.toLowerCase().replace(/[\s\-]/g, '')

      // Check if model matches and year is in range
      if (modelNameClean.includes(modelLower) || modelLower.includes(modelNameClean)) {
        if (yearFrom <= year && (yearTo === null || yearTo >= year)) {
          bestMatch = { url: modelUrl, modelName, yearFrom, yearTo }
          break // Found exact match
        }
        // Keep as fallback if no year match yet
        if (!bestMatch) {
          bestMatch = { url: modelUrl, modelName, yearFrom, yearTo }
        }
      }
    }

    if (!bestMatch) {
      console.log('No matching model found for:', model)
      return null
    }

    // Step 2: Fetch model page for wheel data
    const modelPageUrl = bestMatch.url.startsWith('http') ? bestMatch.url : `https://www.wheelfitment.eu${bestMatch.url}`
    console.log('Fetching model page:', modelPageUrl)

    const modelResponse = await fetch(modelPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!modelResponse.ok) {
      console.log('Model page not found:', modelResponse.status)
      return null
    }

    const modelHtml = await modelResponse.text()

    // Extract PCD
    const pcdMatch = modelHtml.match(/PCD[^<]*<\/td>\s*<td[^>]*>([^<]+)/i)
    const pcdStr = pcdMatch ? pcdMatch[1].trim() : null

    let boltCount = 0
    let boltSpacing = 0

    if (pcdStr) {
      const pcdParts = pcdStr.match(/(\d+)x([\d.]+)/)
      if (pcdParts) {
        boltCount = parseInt(pcdParts[1])
        boltSpacing = parseFloat(pcdParts[2])
      }
    }

    if (!boltCount || !boltSpacing) {
      console.log('Could not extract PCD from page')
      return null
    }

    // Extract Center bore
    const cbMatch = modelHtml.match(/Center\s*bore[^<]*<\/td>\s*<td[^>]*>([\d.]+)/i)
    const centerBore = cbMatch ? parseFloat(cbMatch[1]) : null

    // Extract tire sizes and rim sizes
    const tireSizesMatch = modelHtml.match(/Possible\s*tire\s*sizes[^<]*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i)
    const rimSizesAllowed: number[] = []
    const tireSizes: string[] = []

    if (tireSizesMatch) {
      const sizesStr = tireSizesMatch[1]

      // Extract rim sizes (R14, R15, etc.)
      const rimMatches = sizesStr.matchAll(/R(\d{2})/g)
      for (const m of rimMatches) {
        const size = parseInt(m[1])
        if (size >= 12 && size <= 24 && !rimSizesAllowed.includes(size)) {
          rimSizesAllowed.push(size)
        }
      }
      rimSizesAllowed.sort((a, b) => a - b)

      // Extract full tire sizes (195/65R15, etc.)
      const tireMatches = sizesStr.matchAll(/(\d{3}\/\d{2}R\d{2})/g)
      for (const m of tireMatches) {
        if (!tireSizes.includes(m[1])) {
          tireSizes.push(m[1])
        }
      }
    }

    return {
      make: make.trim(),
      model: bestMatch.modelName,
      year,
      bolt_count: boltCount,
      bolt_spacing: boltSpacing,
      center_bore: centerBore,
      rim_sizes: rimSizesAllowed.map(s => s.toString()),
      rim_sizes_allowed: rimSizesAllowed,
      tire_sizes: tireSizes,
      source_url: modelPageUrl,
      source: 'wheelfitment.eu'
    }

  } catch (error) {
    console.error('Wheelfitment scrape error:', error)
    return null
  }
}

// Scrape from wheel-size.com (fallback)
async function scrapeWheelSize(make: string, model: string, year: number): Promise<ScrapeResult | null> {
  try {
    const makeSlug = make.toLowerCase().replace(/\s+/g, '-')
    const modelSlug = model.toLowerCase().replace(/\s+/g, '-')
    const url = `https://www.wheel-size.com/size/${makeSlug}/${modelSlug}/${year}/`

    console.log('Fetching from wheel-size.com:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.log('wheel-size.com page not found:', response.status)
      return null
    }

    const html = await response.text()

    // Parse PCD data - looking for patterns like "5x114.3"
    const pcdRegex = /\b([3-6])x(1[0-9]{2}(?:\.[0-9]+)?)\b/g
    const pcdMatches = [...html.matchAll(pcdRegex)]

    if (pcdMatches.length === 0) {
      return null
    }

    const [, boltCount, boltSpacing] = pcdMatches[0]

    // Extract center bore
    const centerBoreRegex = /(?:CB|Center\s*Bore|hub\s*bore)[:\s]+?([\d.]+)/i
    const centerBoreMatch = html.match(centerBoreRegex)
    const centerBore = centerBoreMatch ? parseFloat(centerBoreMatch[1]) : null

    // Extract tire/rim sizes
    const tireSizeRegex = /(\d{3}\/\d{2}R(\d{2}))/g
    const tireSizeMatches = [...html.matchAll(tireSizeRegex)]
    const rimSizes = [...new Set(tireSizeMatches.map(m => m[2]))].sort((a, b) => parseInt(a) - parseInt(b))
    const tireSizes = [...new Set(tireSizeMatches.map(m => m[1]))]

    return {
      make: make.trim(),
      model: model.trim(),
      year,
      bolt_count: parseInt(boltCount),
      bolt_spacing: parseFloat(boltSpacing),
      center_bore: centerBore,
      rim_sizes: rimSizes,
      rim_sizes_allowed: rimSizes.map(s => parseInt(s)),
      tire_sizes: tireSizes,
      source_url: url,
      source: 'wheel-size.com'
    }

  } catch (error) {
    console.error('wheel-size.com scrape error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { make, model, year, source = 'auto' } = body

    if (!make || !model || !year) {
      return NextResponse.json({
        error: 'Missing required fields: make, model, year'
      }, { status: 400 })
    }

    const yearNum = parseInt(year)
    let result: ScrapeResult | null = null

    if (source === 'wheelfitment' || source === 'auto') {
      // Try wheelfitment.eu first
      result = await scrapeWheelfitment(make, model, yearNum)
    }

    if (!result && (source === 'wheelsize' || source === 'auto')) {
      // Try wheel-size.com as fallback
      result = await scrapeWheelSize(make, model, yearNum)
    }

    if (!result) {
      return NextResponse.json({
        error: 'לא נמצא מידע באף אחד מהאתרים',
        tried: source === 'auto' ? ['wheelfitment.eu', 'wheel-size.com'] : [source]
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: unknown) {
    console.error('Scrape error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to scrape vehicle data'
    }, { status: 500 })
  }
}
