/**
 * Station Managers API
 * GET /api/wheel-stations/[stationId]/managers - Get managers list
 * PUT /api/wheel-stations/[stationId]/managers - Update managers (primary manager only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyStationManager } from '@/lib/station-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

interface Manager {
  id?: string
  full_name: string
  phone: string
  role?: string
  is_primary?: boolean
  password?: string
}

// GET - Get managers for station
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('id, is_primary, title, users(id, full_name, phone, password)')
      .eq('station_id', stationId)
      .eq('role', 'station_manager')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching managers:', error)
      return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 })
    }

    const managers = (roles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; password: string | null } | null
      return {
        id: u?.id,
        full_name: u?.full_name,
        phone: u?.phone,
        role: r.title || 'מנהל תחנה',
        is_primary: r.is_primary || false,
        password: u?.password || null,
      }
    })

    return NextResponse.json({ managers })
  } catch (error) {
    console.error('Error in GET managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update managers list (replace all)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { managers, manager_phone, manager_password } = body as {
      managers: Manager[]
      manager_phone?: string
      manager_password?: string
    }

    if (!manager_phone || !manager_password) {
      return NextResponse.json({ error: 'נדרש טלפון וסיסמא לעדכון' }, { status: 401 })
    }

    const auth = await verifyStationManager(stationId, manager_phone, manager_password)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    if (!auth.isPrimary) {
      return NextResponse.json({ error: 'רק מנהל ראשי יכול לעדכן אנשי קשר' }, { status: 403 })
    }

    if (!managers || !Array.isArray(managers)) {
      return NextResponse.json({ error: 'Managers array required' }, { status: 400 })
    }

    const { data: stationData } = await supabase
      .from('wheel_stations')
      .select('max_managers')
      .eq('id', stationId)
      .single()
    const maxManagers = stationData?.max_managers ?? 4

    if (managers.length > maxManagers) {
      return NextResponse.json({ error: `מקסימום ${maxManagers} מנהלים לתחנה זו` }, { status: 400 })
    }

    for (const manager of managers) {
      if (!manager.full_name || !manager.phone) {
        return NextResponse.json({ error: 'Each manager must have full_name and phone' }, { status: 400 })
      }
    }

    // Deactivate all current station_manager roles for this station
    const { error: deactivateErr } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('station_id', stationId)
      .eq('role', 'station_manager')
    if (deactivateErr) throw deactivateErr

    // Re-add managers
    for (const m of managers) {
      const cleanPhone = m.phone.replace(/\D/g, '')

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, password')
        .eq('phone', cleanPhone)
        .single()

      let userId: string

      if (existingUser) {
        const userUpdate: Record<string, unknown> = { full_name: m.full_name }
        if (m.password) userUpdate.password = m.password
        const { error: uErr } = await supabase.from('users').update(userUpdate).eq('id', existingUser.id)
        if (uErr) throw uErr
        userId = existingUser.id
      } else {
        const { data: newUser, error: insertErr } = await supabase
          .from('users')
          .insert({ full_name: m.full_name, phone: cleanPhone, password: m.password || cleanPhone.slice(-4), is_active: true })
          .select('id')
          .single()
        if (insertErr || !newUser) throw insertErr || new Error('Failed to create user')
        userId = newUser.id
      }

      // Upsert role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'station_manager')
        .eq('station_id', stationId)
        .single()

      if (existingRole) {
        const { error: rErr } = await supabase
          .from('user_roles')
          .update({ is_active: true, is_primary: m.is_primary || false, title: m.role || 'מנהל תחנה' })
          .eq('id', existingRole.id)
        if (rErr) throw rErr
      } else {
        const { error: rErr } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: 'station_manager',
          station_id: stationId,
          title: m.role || 'מנהל תחנה',
          is_primary: m.is_primary || false,
          is_active: true,
        })
        if (rErr) throw rErr
      }
    }

    // Fetch updated managers
    const { data: updatedRoles } = await supabase
      .from('user_roles')
      .select('id, is_primary, title, users(id, full_name, phone, password)')
      .eq('station_id', stationId)
      .eq('role', 'station_manager')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    const updatedManagers = (updatedRoles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; password: string | null } | null
      return {
        id: u?.id,
        full_name: u?.full_name,
        phone: u?.phone,
        role: r.title || 'מנהל תחנה',
        is_primary: r.is_primary || false,
        password: u?.password || null,
      }
    })

    return NextResponse.json({
      success: true,
      managers: updatedManagers,
      message: 'אנשי הקשר עודכנו בהצלחה'
    })
  } catch (error) {
    console.error('Error in PUT managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
