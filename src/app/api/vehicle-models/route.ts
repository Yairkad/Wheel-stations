import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)

    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const search = searchParams.get('search') // General search term
    const limit = searchParams.get('limit')

    // Helper function to build query with filters
    const buildQuery = () => {
      let q = supabase.from('vehicle_models').select('*')

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

    // Supabase has a default limit of 1000, use pagination to get all records
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

    const { data, error } = await supabase
      .from('vehicle_models')
      .insert([{
        make: make.trim().toLowerCase(),
        make_he: make_he?.trim() || null,
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
        added_by: added_by || null
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
