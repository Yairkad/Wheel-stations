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
    // First get active station IDs
    const { data: activeStations, error: stationsError } = await supabase
      .from('wheel_stations')
      .select('id')
      .eq('is_active', true)

    if (stationsError) {
      console.error('Error fetching active stations:', stationsError)
      return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
    }

    const activeStationIds = activeStations?.map(s => s.id) || []

    if (activeStationIds.length === 0) {
      return NextResponse.json({
        filterOptions: {
          rim_sizes: [],
          bolt_counts: [],
          bolt_spacings: [],
          center_bores: [],
          offsets: []
        }
      })
    }

    // Get unique filter options from wheels in active stations
    const { data: allWheels, error } = await supabase
      .from('wheels')
      .select('rim_size, bolt_count, bolt_spacing, center_bore, offset')
      .in('station_id', activeStationIds)

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
