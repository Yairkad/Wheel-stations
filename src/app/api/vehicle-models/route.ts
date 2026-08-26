import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hebrewToEnglishMakes } from '@/lib/vehicle-mappings'
import { validateAdminSession } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Inverted map: English make name → Hebrew
const englishToHebrewMakes: Record<string, string> = Object.fromEntries(
  Object.entries(hebrewToEnglishMakes).map(([he, en]) => [en.toLowerCase(), he])
)

async function translateMakeToHebrew(make: string): Promise<string> {
  const makeLower = make.toLowerCase().trim()

  // 1. Local lookup (instant, no API cost)
  if (englishToHebrewMakes[makeLower]) {
    return englishToHebrewMakes[makeLower]
  }

  // 2. Google Translate API (uses the same Cloud API key as Vision)
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (apiKey) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: make, target: 'he', format: 'text' })
        }
      )
      if (response.ok) {
        const data = await response.json()
        const translated: string | undefined = data.data?.translations?.[0]?.translatedText
        if (translated && translated !== make) {
          return translated
        }
      }
    } catch {
      // fall through
    }
  }

  // 3. Fallback: use the English name rather than null
  return make
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)

    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const search = searchParams.get('search') // General search term
    const limit = searchParams.get('limit')
    const page = searchParams.get('page') // presence activates paginated admin-list mode
    const fields = searchParams.get('fields') // 'facets' = narrow-column mode for filter dropdowns

    // Helper function to build query with filters shared by every mode
    const buildQuery = () => {
      let q = supabase.from('vehicle_models').select(fields === 'facets' ? 'make, make_he, model, variants, bolt_count, bolt_spacing, center_bore, rim_size, year_from' : '*', page ? { count: 'exact' } : undefined)

      // General search - split into words and search each word across all text fields
      // This allows "מזדה 6" to find cars where make_he contains "מזדה" AND model contains "6"
      if (search) {
        const searchWords = search.trim().split(/\s+/).filter(w => w.length > 0)

        // For each word, it must match at least one of the text fields
        searchWords.forEach(word => {
          q = q.or(`make.ilike.%${word}%,make_he.ilike.%${word}%,model.ilike.%${word}%,variants.ilike.%${word}%`)
        })
      }

      if (make) {
        q = q.or(`make.ilike.%${make}%,make_he.ilike.%${make}%`)
      }
      if (model) {
        q = q.or(`model.ilike.%${model}%,variants.ilike.%${model}%`)
      }
      if (year) {
        const yearNum = parseInt(year)
        q = q.lte('year_from', yearNum).or(`year_to.gte.${yearNum},year_to.is.null`)
      }

      // Admin-list column filters (only meaningful in paginated mode, but harmless otherwise)
      const fMake = searchParams.get('fMake')
      if (fMake) {
        q = q.or(`make.ilike.${fMake}%,make_he.ilike.%${fMake}%`)
      }
      const fModel = searchParams.get('fModel')
      if (fModel) {
        q = q.or(`model.ilike.%${fModel}%,variants.ilike.%${fModel}%`)
      }
      const yearFromMin = searchParams.get('yearFromMin')
      if (yearFromMin) q = q.gte('year_from', parseInt(yearFromMin))
      const yearFromMax = searchParams.get('yearFromMax')
      if (yearFromMax) q = q.lte('year_from', parseInt(yearFromMax))
      const fBoltCount = searchParams.get('fBoltCount')
      if (fBoltCount) q = q.eq('bolt_count', parseInt(fBoltCount))
      const fBoltSpacing = searchParams.get('fBoltSpacing')
      if (fBoltSpacing) q = q.eq('bolt_spacing', parseFloat(fBoltSpacing))
      const fCenterBoreMode = searchParams.get('fCenterBoreMode')
      if (fCenterBoreMode === 'empty') {
        q = q.is('center_bore', null)
      } else if (fCenterBoreMode === 'equals') {
        const v = searchParams.get('fCenterBore')
        if (v) q = q.eq('center_bore', parseFloat(v))
      } else if (fCenterBoreMode === 'greater') {
        const v = searchParams.get('fCenterBore')
        if (v) q = q.gte('center_bore', parseFloat(v))
      }
      const fRimSizeMode = searchParams.get('fRimSizeMode')
      if (fRimSizeMode === 'empty') {
        q = q.or('rim_size.is.null,rim_size.eq.')
      } else if (fRimSizeMode === 'equals') {
        const v = searchParams.get('fRimSize')
        if (v) q = q.eq('rim_size', v)
      }
      const fSourceUrlMode = searchParams.get('fSourceUrlMode')
      if (fSourceUrlMode === 'has_value') {
        q = q.not('source_url', 'is', null).neq('source_url', '')
      } else if (fSourceUrlMode === 'empty') {
        q = q.or('source_url.is.null,source_url.eq.')
      }

      return q
    }

    // If limit is specified, return limited results (for merge search)
    if (limit) {
      const { data, error } = await buildQuery()
        .order('make', { ascending: true })
        .limit(parseInt(limit))

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ vehicles: data, models: data })
    }

    // Paginated admin-list mode: one page + total count, no unbounded fetch
    if (page) {
      const pageNum = Math.max(1, parseInt(page) || 1)
      const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
      const from = (pageNum - 1) * pageSize

      const { data, error, count } = await buildQuery()
        .order('make', { ascending: true })
        .range(from, from + pageSize - 1)

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ vehicles: data, models: data, total: count ?? 0, page: pageNum, pageSize })
    }

    // Legacy unbounded mode (also used for the 'facets' narrow-column fetch) — Supabase caps
    // a single request at 1000 rows, so page through it internally to return everything.
    let allData: any[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data: pageData, error: pageError } = await buildQuery()
        .order('make', { ascending: true })
        .range(from, from + pageSize - 1)

      if (pageError) {
        console.error('Supabase error:', pageError)
        return NextResponse.json({ error: pageError.message }, { status: 500 })
      }

      if (!pageData || pageData.length === 0) break

      allData = [...allData, ...pageData]

      if (pageData.length < pageSize) break // Last page
      from += pageSize
    }

    return NextResponse.json({ vehicles: allData, models: allData })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add new vehicle model
export async function POST(request: NextRequest) {
  try {
    // Use service role key to bypass RLS for inserting vehicle models
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const {
      make,
      make_he,
      model,
      variants,
      year_from,
      year_to,
      bolt_count,
      bolt_spacing,
      center_bore,
      rim_size,
      rim_sizes_allowed,
      tire_size_front,
      source_url,
      source,
      added_by
    } = body

    // Validate required fields
    if (!make || !model || !bolt_count || !bolt_spacing) {
      return NextResponse.json({
        error: 'Missing required fields: make, model, bolt_count, bolt_spacing'
      }, { status: 400 })
    }

    // Auto-translate make to Hebrew if not provided (satisfies NOT NULL constraint)
    const resolvedMakeHe = make_he?.trim() || await translateMakeToHebrew(make.trim())

    // This endpoint also serves the station-manager "suggest a new model" flow (no admin session),
    // so we can't require admin auth here — only stamp verification when it's actually an admin submitting.
    const isAdmin = await validateAdminSession(request)

    const { data, error } = await supabase
      .from('vehicle_models')
      .insert([{
        make: make.trim().toLowerCase(),
        make_he: resolvedMakeHe,
        model: model.trim().toLowerCase(),
        variants: variants?.trim() || null,
        year_from: year_from ? parseInt(year_from) : null,
        year_to: year_to ? parseInt(year_to) : null,
        bolt_count: parseInt(bolt_count),
        bolt_spacing: parseFloat(bolt_spacing),
        center_bore: center_bore ? parseFloat(center_bore) : null,
        rim_size: rim_size?.trim() || null,
        rim_sizes_allowed: rim_sizes_allowed?.length > 0 ? rim_sizes_allowed : null,
        tire_size_front: tire_size_front?.trim() || null,
        source_url: source_url?.trim() || null,
        source: source || 'manual',
        added_by: added_by || null,
        verified_at: isAdmin ? new Date().toISOString() : null,
        verified_by: isAdmin ? 'admin' : null
      }])
      .select()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, vehicle: data?.[0] })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
