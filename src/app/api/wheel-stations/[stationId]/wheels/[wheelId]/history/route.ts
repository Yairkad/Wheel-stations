/**
 * Wheel Request History API
 * GET /api/wheel-stations/[stationId]/wheels/[wheelId]/history - Past borrow requests for one wheel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string; wheelId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params

    const { data, error } = await supabase
      .from('wheel_borrows')
      .select('id, vehicle_model, license_plate, status, borrow_date, actual_return_date, mount_result, mount_feedback_note, created_at')
      .eq('wheel_id', wheelId)
      .eq('station_id', stationId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching wheel history:', error)
      return NextResponse.json({ error: 'Failed to fetch wheel history' }, { status: 500 })
    }

    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error('Error in GET wheel history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
