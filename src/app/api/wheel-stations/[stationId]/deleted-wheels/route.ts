/**
 * Deleted Wheels API
 * GET /api/wheel-stations/[stationId]/deleted-wheels - List recently deleted wheels
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTORE_WINDOW_DAYS = 14

interface RouteParams {
  params: Promise<{ stationId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    // Calculate the cutoff date (14 days ago)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - RESTORE_WINDOW_DAYS)

    const { data: deletedWheels, error } = await supabase
      .from('wheels')
      .select('id, wheel_number, rim_size, bolt_count, bolt_spacing, center_bore, is_donut, deleted_at, deleted_by_name, deleted_by_type')
      .eq('station_id', stationId)
      .not('deleted_at', 'is', null)
      .gte('deleted_at', cutoff.toISOString())
      .order('deleted_at', { ascending: false })

    if (error) {
      console.error('Error fetching deleted wheels:', error)
      return NextResponse.json({ error: 'Failed to fetch deleted wheels' }, { status: 500 })
    }

    return NextResponse.json({ deletedWheels: deletedWheels || [] })
  } catch (error) {
    console.error('Error in GET /api/.../deleted-wheels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
