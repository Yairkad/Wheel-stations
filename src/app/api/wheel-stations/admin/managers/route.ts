/**
 * Station Managers Admin API (password protected)
 * POST /api/wheel-stations/admin/managers - Add a new manager to a station
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Add a new manager to a station
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, station_id, full_name, phone, password, is_primary } = body

    if (!(await verifyAdminAuth(admin_password))) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    if (!station_id) {
      return NextResponse.json({ error: 'יש לבחור תחנה' }, { status: 400 })
    }

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'שם וטלפון הם שדות חובה' }, { status: 400 })
    }

    const { data: station } = await supabase
      .from('wheel_stations')
      .select('id, name, max_managers')
      .eq('id', station_id)
      .single()

    if (!station) {
      return NextResponse.json({ error: 'תחנה לא נמצאה' }, { status: 404 })
    }

    // Check current manager count for this station
    const { count } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .eq('station_id', station_id)
      .eq('role', 'station_manager')
      .eq('is_active', true)

    const maxManagers = station.max_managers ?? 4
    if ((count || 0) >= maxManagers) {
      return NextResponse.json({ error: `ניתן להוסיף עד ${maxManagers} מנהלים לתחנה` }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    // Check if this phone already has a station_manager role for this station
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id, user_id')
      .eq('role', 'station_manager')
      .eq('station_id', station_id)
      .eq('is_active', true)
      .limit(1)

    // Find user by phone
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    // Check if this specific user already has the role
    if (existingUser && existingRole && existingRole.some((r: { user_id: string }) => r.user_id === existingUser.id)) {
      return NextResponse.json({ error: 'מספר טלפון זה כבר קיים בתחנה' }, { status: 400 })
    }

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      if (full_name) {
        const { error: uErr } = await supabase.from('users').update({ full_name }).eq('id', userId)
        if (uErr) throw uErr
      }
      if (password) {
        const { error: pErr } = await supabase.from('users').update({ password }).eq('id', userId)
        if (pErr) throw pErr
      }
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ full_name, phone: cleanPhone, password: password || null, is_active: true })
        .select('id')
        .single()

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ error: 'שגיאה בהוספת מנהל' }, { status: 500 })
      }
      userId = newUser.id
    }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'station_manager',
      station_id,
      title: 'מנהל תחנה',
      is_primary: is_primary || false,
      is_active: true,
    })

    if (roleError) {
      console.error('Error adding role:', roleError)
      return NextResponse.json({ error: 'שגיאה בהוספת מנהל' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      manager: { id: userId, full_name, phone: cleanPhone, is_primary: is_primary || false },
      message: `${full_name} נוסף כמנהל ב${station.name}`
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations/admin/managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
