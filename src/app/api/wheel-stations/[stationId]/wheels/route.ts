/**
 * Wheels API for a specific station
 * GET /api/wheel-stations/[stationId]/wheels - Get all wheels
 * POST /api/wheel-stations/[stationId]/wheels - Add a new wheel (manager only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySuperManager } from '@/lib/super-manager-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// Helper to verify station manager (by phone and personal password)
async function verifyStationManager(stationId: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Get station with managers including their personal passwords
  const { data: station, error } = await supabase
    .from('wheel_stations')
    .select(`
      id,
      wheel_station_managers (id, phone, password)
    `)
    .eq('id', stationId)
    .single()

  if (error || !station) {
    return { success: false, error: 'Station not found' }
  }

  // Find manager by phone
  const cleanPhone = phone.replace(/\D/g, '')
  const manager = station.wheel_station_managers.find((m: { id: string; phone: string; password: string }) =>
    m.phone.replace(/\D/g, '') === cleanPhone
  )

  if (!manager) {
    return { success: false, error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }
  }

  // Verify personal password
  if (manager.password !== password) {
    return { success: false, error: 'סיסמא שגויה' }
  }

  return { success: true }
}

// GET - Get all wheels for a station (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    const { data: wheels, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('station_id', stationId)
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
    const { wheel_number, rim_size, bolt_count, bolt_spacing, center_bore, category, is_donut, notes, custom_deposit, manager_phone, manager_password, sm_phone, sm_password } = body

    // Verify credentials - super manager or station manager
    if (sm_phone && sm_password) {
      const smAuth = await verifySuperManager(sm_phone, sm_password)
      if (!smAuth.success) {
        return NextResponse.json({ error: smAuth.error }, { status: 401 })
      }
    } else if (manager_phone && manager_password) {
      const auth = await verifyStationManager(stationId, manager_phone, manager_password)
      if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: 'נדרש טלפון וסיסמא לביצוע פעולה זו' }, { status: 401 })
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
        center_bore: center_bore || null,
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
