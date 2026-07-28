/**
 * Single Wheel Station API
 * GET /api/wheel-stations/[stationId] - Get station details with all wheels
 * PUT /api/wheel-stations/[stationId] - Update station (super admin or station manager for address only)
 * DELETE /api/wheel-stations/[stationId] - Delete station (super admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyStationManager } from '@/lib/station-auth'
import { computeWheelStats } from '@/lib/wheel-stats'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// GET - Get station details with all wheels (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    const { data: station, error } = await supabase
      .from('wheel_stations')
      .select(`
        id,
        name,
        address,
        city_id,
        district,
        is_active,
        deposit_amount,
        payment_methods,
        notification_emails,
        max_managers,
        cities (name)
      `)
      .eq('id', stationId)
      .single()

    if (error || !station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    // Fetch managers from unified tables
    const { data: managerRoles } = await supabase
      .from('user_roles')
      .select('is_primary, title, users(id, full_name, phone)')
      .eq('station_id', stationId)
      .eq('role', 'station_manager')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    const stationManagers = (managerRoles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string } | null
      return { id: u?.id, full_name: u?.full_name, phone: u?.phone, role: r.title || 'מנהל תחנה', is_primary: r.is_primary || false }
    })
    ;(station as Record<string, unknown>).wheel_station_managers = stationManagers

    // Get wheels separately with availability status (exclude soft-deleted)
    const { data: wheels } = await supabase
      .from('wheels')
      .select('*')
      .eq('station_id', stationId)
      .is('deleted_at', null)
      .order('wheel_number')

    // Get every borrow (any status) to show current borrower info and the most recent
    // signed form per wheel — the form must stay reachable even after the wheel is returned
    const { data: allBorrows } = await supabase
      .from('wheel_borrows')
      .select('id, wheel_id, borrower_name, borrower_phone, borrower_id_number, borrower_address, vehicle_model, borrow_date, expected_return_date, deposit_type, deposit_details, signature_data, signed_at, status, created_at, signed_forms(id)')
      .eq('station_id', stationId)
      .order('created_at', { ascending: false })

    // Map currently-active borrows to their wheels (unchanged: only status='borrowed')
    const borrowMap = new Map(
      allBorrows?.filter(b => b.status === 'borrowed').map(b => [b.wheel_id, {
        id: b.id,
        borrower_name: b.borrower_name,
        borrower_phone: b.borrower_phone,
        borrower_id_number: b.borrower_id_number,
        borrower_address: b.borrower_address,
        vehicle_model: b.vehicle_model,
        borrow_date: b.borrow_date,
        expected_return_date: b.expected_return_date,
        deposit_type: b.deposit_type,
        deposit_details: b.deposit_details,
        is_signed: !!b.signature_data,
        signed_at: b.signed_at,
        form_id: (b as unknown as { signed_forms?: Array<{ id: string }> }).signed_forms?.[0]?.id ?? null
      }]) || []
    )

    // Map each wheel to its most recent signed form regardless of borrow status, so the
    // form stays reachable even after the wheel has been returned (allBorrows is already
    // sorted newest-first, so the first form_id seen per wheel is the most recent one)
    const lastFormMap = new Map<string, string>()
    for (const b of allBorrows || []) {
      const formId = (b as unknown as { signed_forms?: Array<{ id: string }> }).signed_forms?.[0]?.id
      if (formId && !lastFormMap.has(b.wheel_id)) {
        lastFormMap.set(b.wheel_id, formId)
      }
    }

    const wheelsWithBorrowInfo = wheels?.map(w => ({
      ...w,
      current_borrow: w.is_available ? undefined : borrowMap.get(w.id),
      last_form_id: lastFormMap.get(w.id) ?? null
    })) || []

    return NextResponse.json({
      station: {
        ...station,
        wheels: wheelsWithBorrowInfo,
        ...computeWheelStats(wheels || [])
      }
    })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/[stationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to verify super admin
async function verifySuperAdmin(): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'super_admin') {
    return { success: false, error: 'Forbidden - Super admin only' }
  }

  return { success: true }
}

// PUT - Update station (super admin for all fields, station manager for address only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { name, address, city_id, district, is_active, managers, manager_phone, current_password, deposit_amount, payment_methods, notification_emails } = body

    // Check if this is a station manager update (has manager_phone and current_password)
    if (manager_phone && current_password) {
      const managerAuth = await verifyStationManager(stationId, manager_phone, current_password)
      if (!managerAuth.success) {
        return NextResponse.json({ error: managerAuth.error }, { status: 401 })
      }

      // Station managers can update address, deposit_amount, payment_methods, and notification_emails
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const managerUpdate: { address?: string; deposit_amount?: number; payment_methods?: any; notification_emails?: string[] } = {}
      if (address !== undefined) managerUpdate.address = address
      if (deposit_amount !== undefined) managerUpdate.deposit_amount = deposit_amount
      if (payment_methods !== undefined) managerUpdate.payment_methods = payment_methods
      if (notification_emails !== undefined) managerUpdate.notification_emails = notification_emails

      if (Object.keys(managerUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('wheel_stations')
          .update(managerUpdate)
          .eq('id', stationId)

        if (updateError) {
          console.error('Error updating station:', updateError)
          return NextResponse.json({ error: 'Failed to update station' }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: 'הפרטים עודכנו בהצלחה' })
    }

    // Super admin authentication
    const auth = await verifySuperAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 })
    }

    // Build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: { name?: string; address?: string; city_id?: string; district?: string; is_active?: boolean; deposit_amount?: number; payment_methods?: any } = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (city_id !== undefined) updateData.city_id = city_id
    if (district !== undefined) updateData.district = district
    if (is_active !== undefined) updateData.is_active = is_active
    if (deposit_amount !== undefined) updateData.deposit_amount = deposit_amount
    if (payment_methods !== undefined) updateData.payment_methods = payment_methods

    // Update station
    const { error: updateError } = await supabase
      .from('wheel_stations')
      .update(updateData)
      .eq('id', stationId)

    if (updateError) {
      console.error('Error updating station:', updateError)
      return NextResponse.json({ error: 'Failed to update station' }, { status: 500 })
    }

    // Update managers if provided — deactivate old roles and re-add
    if (managers !== undefined) {
      const { error: deactivateErr } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('station_id', stationId)
        .eq('role', 'station_manager')
      if (deactivateErr) throw deactivateErr

      if (managers.length > 0) {
        for (const m of managers as { full_name: string; phone: string; role?: string; is_primary?: boolean; password?: string }[]) {
          const cleanPhone = m.phone.replace(/\D/g, '')
          const { data: existingUser } = await supabase.from('users').select('id').eq('phone', cleanPhone).single()
          let userId: string
          if (existingUser) {
            userId = existingUser.id
          } else {
            const { data: newUser, error: uErr } = await supabase.from('users').insert({ full_name: m.full_name, phone: cleanPhone, password: m.password || null, is_active: true }).select('id').single()
            if (uErr || !newUser) throw uErr || new Error('Failed to create user')
            userId = newUser.id
          }
          const { data: existingRole } = await supabase.from('user_roles').select('id').eq('user_id', userId).eq('role', 'station_manager').eq('station_id', stationId).single()
          if (existingRole) {
            const { error: rErr } = await supabase.from('user_roles').update({ is_active: true, is_primary: m.is_primary || false, title: m.role || 'מנהל תחנה' }).eq('id', existingRole.id)
            if (rErr) throw rErr
          } else {
            const { error: rErr } = await supabase.from('user_roles').insert({ user_id: userId, role: 'station_manager', station_id: stationId, title: m.role || 'מנהל תחנה', is_primary: m.is_primary || false, is_active: true })
            if (rErr) throw rErr
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/wheel-stations/[stationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete station
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifySuperAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 })
    }

    const { stationId } = await params

    const { error } = await supabase
      .from('wheel_stations')
      .delete()
      .eq('id', stationId)

    if (error) {
      console.error('Error deleting station:', error)
      return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/wheel-stations/[stationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
