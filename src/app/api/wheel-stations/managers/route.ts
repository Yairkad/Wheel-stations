/**
 * Station Managers API
 * GET /api/wheel-stations/managers - Get managers for specific stations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationIdsParam = searchParams.get('station_ids')

    if (!stationIdsParam) {
      return NextResponse.json({ error: 'station_ids is required' }, { status: 400 })
    }

    const stationIds = stationIdsParam.split(',').filter(Boolean)

    if (stationIds.length === 0) {
      return NextResponse.json({ managers: {} })
    }

    const { data: managers, error } = await supabase
      .from('wheel_station_managers')
      .select('id, full_name, phone, station_id')
      .in('station_id', stationIds)

    if (error) {
      console.error('Error fetching managers:', error)
      return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 })
    }

    // Group by station_id
    const managersMap: Record<string, { id: string; full_name: string; phone: string }[]> = {}

    managers?.forEach(manager => {
      if (!managersMap[manager.station_id]) {
        managersMap[manager.station_id] = []
      }
      managersMap[manager.station_id].push({
        id: manager.id,
        full_name: manager.full_name,
        phone: manager.phone
      })
    })

    return NextResponse.json({ managers: managersMap })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
