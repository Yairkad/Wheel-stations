/**
 * Single Wheel API
 * GET /api/wheel-stations/[stationId]/wheels/[wheelId] - Get wheel details
 * PUT /api/wheel-stations/[stationId]/wheels/[wheelId] - Update wheel
 * DELETE /api/wheel-stations/[stationId]/wheels/[wheelId] - Delete wheel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySuperManager } from '@/lib/super-manager-auth'
import { logAction } from '@/lib/audit-log'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string; wheelId: string }>
}

// Helper to verify station manager (by phone and personal password)
async function verifyStationManager(stationId: string, phone: string, password: string): Promise<{ success: boolean; managerName?: string; error?: string }> {
  // Get station with managers including their personal passwords
  const { data: station, error } = await supabase
    .from('wheel_stations')
    .select(`
      id,
      wheel_station_managers (id, phone, password, full_name)
    `)
    .eq('id', stationId)
    .single()

  if (error || !station) {
    return { success: false, error: 'Station not found' }
  }

  // Find manager by phone
  const cleanPhone = phone.replace(/\D/g, '')
  const manager = station.wheel_station_managers.find((m: { id: string; phone: string; password: string; full_name: string }) =>
    m.phone.replace(/\D/g, '') === cleanPhone
  )

  if (!manager) {
    return { success: false, error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }
  }

  // Verify personal password
  if (manager.password !== password) {
    return { success: false, error: 'סיסמא שגויה' }
  }

  return { success: true, managerName: manager.full_name }
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

// DELETE - Soft delete wheel
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params
    const body = await request.json()
    const { manager_phone, manager_password, sm_phone, sm_password } = body

    // Verify credentials - super manager or station manager
    let deletedByName = ''
    let deletedByType = ''

    if (sm_phone && sm_password) {
      const smAuth = await verifySuperManager(sm_phone, sm_password)
      if (!smAuth.success) {
        return NextResponse.json({ error: smAuth.error }, { status: 401 })
      }
      deletedByName = smAuth.superManager?.full_name || 'מנהל עליון'
      deletedByType = 'super_manager'
    } else if (manager_phone && manager_password) {
      const auth = await verifyStationManager(stationId, manager_phone, manager_password)
      if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
      }
      deletedByName = auth.managerName || 'מנהל תחנה'
      deletedByType = 'station_manager'
    } else {
      return NextResponse.json({ error: 'נדרש טלפון וסיסמא לביצוע פעולה זו' }, { status: 401 })
    }

    // Check if wheel has active borrows
    const { data: wheel } = await supabase
      .from('wheels')
      .select('is_available, wheel_number, rim_size, bolt_count, bolt_spacing')
      .eq('id', wheelId)
      .single()

    if (wheel && !wheel.is_available) {
      return NextResponse.json({ error: 'לא ניתן למחוק גלגל שמושאל כרגע' }, { status: 400 })
    }

    // Soft delete - mark as deleted instead of removing
    const { error } = await supabase
      .from('wheels')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by_name: deletedByName,
        deleted_by_type: deletedByType
      })
      .eq('id', wheelId)
      .eq('station_id', stationId)

    if (error) {
      console.error('Error soft-deleting wheel:', error)
      return NextResponse.json({ error: 'Failed to delete wheel' }, { status: 500 })
    }

    // Audit log
    logAction({
      action: 'wheel_deleted',
      actorName: deletedByName,
      actorType: deletedByType as 'super_manager' | 'station_manager',
      stationId,
      details: { wheelId, wheelNumber: wheel?.wheel_number, wheelDetails: wheel ? `${wheel.bolt_count}x${wheel.bolt_spacing} R${wheel.rim_size}` : undefined }
    })

    // Send email notification if deleted by super manager
    if (deletedByType === 'super_manager') {
      // Fire-and-forget email notification
      sendDeletionEmail(stationId, wheelId, deletedByName).catch(err =>
        console.error('Failed to send deletion email:', err)
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/wheel-stations/[stationId]/wheels/[wheelId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Send email notification about wheel deletion
async function sendDeletionEmail(stationId: string, wheelId: string, deletedByName: string) {
  try {
    const { data: wheel } = await supabase
      .from('wheels')
      .select('wheel_number, rim_size, bolt_count, bolt_spacing')
      .eq('id', wheelId)
      .single()

    const { data: station } = await supabase
      .from('wheel_stations')
      .select('name, notification_emails')
      .eq('id', stationId)
      .single()

    if (!station?.notification_emails?.length || !wheel) return

    const { sendWheelDeletedEmail } = await import('@/lib/email')
    const restoreDeadline = new Date()
    restoreDeadline.setDate(restoreDeadline.getDate() + 14)

    for (const email of station.notification_emails) {
      if (email) {
        await sendWheelDeletedEmail({
          to: email,
          stationName: station.name,
          wheelNumber: wheel.wheel_number,
          wheelDetails: `${wheel.bolt_count}x${wheel.bolt_spacing} R${wheel.rim_size}`,
          deletedBy: deletedByName,
          restoreDeadline: restoreDeadline.toLocaleDateString('he-IL')
        })
      }
    }
  } catch (err) {
    console.error('Error sending deletion email:', err)
  }
}
