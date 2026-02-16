import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)

    const bolt_count = searchParams.get('bolt_count')
    const bolt_spacing = searchParams.get('bolt_spacing')
    const center_bore = searchParams.get('center_bore')
    const rim_size = searchParams.get('rim_size')

    if (!bolt_count || !bolt_spacing) {
      return NextResponse.json(
        { error: 'Missing required fields: bolt_count, bolt_spacing' },
        { status: 400 }
      )
    }

    const boltCount = parseInt(bolt_count)
    const boltSpacing = parseFloat(bolt_spacing)
    const targetCB = center_bore ? parseFloat(center_bore) : null

    let query = supabase
      .from('vehicle_models')
      .select('*')
      .eq('bolt_count', boltCount)
      .eq('bolt_spacing', boltSpacing)
      .order('make', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process results: calculate CB difference and match level
    // Donor CB must be >= target CB (wheel hole must be at least as big as the hub)
    const results = (data || []).map(vehicle => {
      const vehicleCB = vehicle.center_bore
      let cb_difference: number | null = null
      let match_level: 'exact' | 'with_ring' | 'technical' = 'exact'

      if (targetCB != null && vehicleCB != null) {
        cb_difference = Math.round((vehicleCB - targetCB) * 10) / 10

        // Donor CB smaller than target = won't physically fit, skip entirely
        if (cb_difference < -0.5) {
          return null
        } else {
          const absDiff = Math.abs(cb_difference)
          if (absDiff <= 0.5) {
            match_level = 'exact'
          } else if (absDiff <= 3) {
            match_level = 'with_ring'
          } else {
            match_level = 'technical'
          }
        }
      }
      // If either CB is null, treat as exact (unknown = compatible)

      return {
        ...vehicle,
        cb_difference,
        match_level
      }
    }).filter(v => v !== null)

    // Filter by rim size - donors must have a compatible rim size
    const targetRimSize = rim_size ? parseInt(rim_size) : null
    const filtered = results.filter(v => {
      // If no target rim size provided, skip rim filter
      if (!targetRimSize) return true
      // Check if donor's rim sizes include the target
      const donorRimSize = v.rim_size ? parseInt(v.rim_size) : null
      const donorRimSizes = v.rim_sizes_allowed || (donorRimSize ? [donorRimSize] : [])
      // Target vehicle needs a wheel of its rim size - donor must support it
      return donorRimSizes.includes(targetRimSize)
    })

    // Sort: exact first, then with_ring, then technical. Within each level, sort by CB difference
    const levelOrder: Record<string, number> = { exact: 0, with_ring: 1, technical: 2 }
    filtered.sort((a, b) => {
      const levelDiff = (levelOrder[a.match_level] ?? 3) - (levelOrder[b.match_level] ?? 3)
      if (levelDiff !== 0) return levelDiff
      return Math.abs(a.cb_difference ?? 0) - Math.abs(b.cb_difference ?? 0)
    })

    // Group by make
    const grouped: Record<string, typeof filtered> = {}
    for (const vehicle of filtered) {
      const make = vehicle.make_he || vehicle.make
      if (!grouped[make]) grouped[make] = []
      grouped[make].push(vehicle)
    }

    return NextResponse.json({
      results: filtered,
      grouped,
      total: filtered.length,
      counts: {
        exact: filtered.filter(v => v.match_level === 'exact').length,
        with_ring: filtered.filter(v => v.match_level === 'with_ring').length,
        technical: filtered.filter(v => v.match_level === 'technical').length,
      }
    })

  } catch (error: any) {
    console.error('Reverse search API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
