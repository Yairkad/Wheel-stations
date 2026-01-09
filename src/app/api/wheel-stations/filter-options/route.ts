/**
 * Filter Options API
 * GET /api/wheel-stations/filter-options - Get unique filter values for wheel search
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get unique filter options from all wheels in active stations
    const { data: allWheels, error } = await supabase
      .from('wheels')
      .select(`
        rim_size,
        bolt_count,
        bolt_spacing,
        center_bore,
        offset,
        wheel_stations!inner (is_active)
      `)
      .filter('wheel_stations.is_active', 'eq', true)

    if (error) {
      console.error('Error fetching filter options:', error)
      return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
    }

    const filterOptions = {
      rim_sizes: [...new Set(allWheels?.map(w => w.rim_size).filter(Boolean))].sort(),
      bolt_counts: [...new Set(allWheels?.map(w => w.bolt_count).filter(Boolean))].sort((a, b) => a - b),
      bolt_spacings: [...new Set(allWheels?.map(w => w.bolt_spacing).filter(Boolean))].sort((a, b) => a - b),
      center_bores: [...new Set(allWheels?.map(w => w.center_bore).filter(Boolean))].sort((a, b) => a - b),
      offsets: [...new Set(allWheels?.map(w => w.offset).filter(Boolean))].sort((a, b) => a - b)
    }

    return NextResponse.json({ filterOptions })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/filter-options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
