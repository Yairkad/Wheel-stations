/**
 * Wheels API for a specific station
 * GET /api/wheel-stations/[stationId]/wheels - Get all wheels
 * POST /api/wheel-stations/[stationId]/wheels - Add a new wheel (manager only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySuperManagerSession } from '@/lib/super-manager-auth'
import { verifyStationManagerSession } from '@/lib/station-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// GET - Get all wheels for a station (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    const { data: wheels, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('station_id', stationId)
      .is('deleted_at', null)
      .order('wheel_number')

    if (error) {
      console.error('Error fetching wheels:', error)
      return NextResponse.json({ error: 'Failed to fetch wheels' }, { status: 500 })
    }

    return NextResponse.json({ wheels: wheels || [] })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/[stationId]/wheels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add a new wheel (manager only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { wheel_number, rim_size, bolt_count, bolt_spacing, extra_bolt_spacings, center_bore, tire_size, offset, category, is_donut, notes, custom_deposit } = body

    // Verify credentials - super manager or station manager, from whichever
    // role the caller's manager_session cookie was issued for
    const smAuth = await verifySuperManagerSession(request)
    if (smAuth.success) {
      if (!smAuth.superManager?.can_edit) {
        return NextResponse.json({ error: 'אין הרשאת עריכה למנהל מחוז זה' }, { status: 403 })
      }
    } else {
      const auth = await verifyStationManagerSession(request, stationId)
      if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
      }
    }

    if (!wheel_number || !rim_size || !bolt_count || !bolt_spacing) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: wheel, error } = await supabase
      .from('wheels')
      .insert({
        station_id: stationId,
        wheel_number,
        rim_size,
        bolt_count,
        bolt_spacing,
        extra_bolt_spacings: extra_bolt_spacings?.length ? extra_bolt_spacings : null,
        center_bore: center_bore || null,
        tire_size: tire_size || null,
        offset: offset ?? null,
        category,
        is_donut: is_donut || false,
        notes,
        custom_deposit: custom_deposit || null,
        is_available: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating wheel:', error)

      let errorMessage = 'שגיאה ביצירת גלגל'

      if (error.code === '23505') {
        errorMessage = 'מספר הגלגל כבר קיים בתחנה זו'
      } else if (error.code === '23502') {
        errorMessage = 'חסרים שדות חובה'
      } else if (error.code === '42703') {
        // Column does not exist
        errorMessage = `עמודה חסרה בטבלה: ${error.message}`
      } else if (error.message) {
        errorMessage = `שגיאה ביצירת גלגל: ${error.message}`
      }

      return NextResponse.json({ error: errorMessage }, { status: error.code === '23505' ? 400 : 500 })
    }

    return NextResponse.json({ wheel }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations/[stationId]/wheels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
