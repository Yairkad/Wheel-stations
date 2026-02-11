/**
 * Single Wheel API
 * GET /api/wheel-stations/[stationId]/wheels/[wheelId] - Get wheel details
 * PUT /api/wheel-stations/[stationId]/wheels/[wheelId] - Update wheel
 * DELETE /api/wheel-stations/[stationId]/wheels/[wheelId] - Delete wheel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySuperManager } from '@/lib/super-manager-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string; wheelId: string }>
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

// GET - Get wheel details with borrow info (public for borrowed wheel info shown on cards)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params

    const { data: wheel, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('id', wheelId)
      .eq('station_id', stationId)
      .single()

    if (error || !wheel) {
      return NextResponse.json({ error: 'Wheel not found' }, { status: 404 })
    }

    // If wheel is borrowed, get borrow details
    let borrowInfo = null
    if (!wheel.is_available) {
      const { data: borrow } = await supabase
        .from('wheel_borrows')
        .select('*')
        .eq('wheel_id', wheelId)
        .eq('status', 'borrowed')
        .single()

      borrowInfo = borrow
    }

    return NextResponse.json({ wheel, borrowInfo })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/[stationId]/wheels/[wheelId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update wheel
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params
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

    const { error } = await supabase
      .from('wheels')
      .update({
        wheel_number,
        rim_size,
        bolt_count,
        bolt_spacing,
        center_bore: center_bore || null,
        category,
        is_donut,
        notes,
        custom_deposit: custom_deposit || null
      })
      .eq('id', wheelId)
      .eq('station_id', stationId)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Wheel number already exists in this station' }, { status: 400 })
      }
      console.error('Error updating wheel:', error)
      return NextResponse.json({ error: 'Failed to update wheel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/wheel-stations/[stationId]/wheels/[wheelId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete wheel
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params
    const body = await request.json()
    const { manager_phone, manager_password, sm_phone, sm_password } = body

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

    // Check if wheel has active borrows
    const { data: wheel } = await supabase
      .from('wheels')
      .select('is_available')
      .eq('id', wheelId)
      .single()

    if (wheel && !wheel.is_available) {
      return NextResponse.json({ error: 'לא ניתן למחוק גלגל שמושאל כרגע' }, { status: 400 })
    }

    const { error } = await supabase
      .from('wheels')
      .delete()
      .eq('id', wheelId)
      .eq('station_id', stationId)

    if (error) {
      console.error('Error deleting wheel:', error)
      return NextResponse.json({ error: 'Failed to delete wheel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/wheel-stations/[stationId]/wheels/[wheelId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
