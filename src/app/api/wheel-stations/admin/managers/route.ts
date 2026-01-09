/**
 * Station Managers Admin API (password protected)
 * POST /api/wheel-stations/admin/managers - Add a new manager to a station
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Add a new manager to a station
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, station_id, full_name, phone, password, is_primary } = body

    // Verify admin password
    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    if (!station_id) {
      return NextResponse.json({ error: 'יש לבחור תחנה' }, { status: 400 })
    }

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'שם וטלפון הם שדות חובה' }, { status: 400 })
    }

    // Check station exists
    const { data: station, error: stationError } = await supabase
      .from('wheel_stations')
      .select('id, name')
      .eq('id', station_id)
      .single()

    if (stationError || !station) {
      return NextResponse.json({ error: 'תחנה לא נמצאה' }, { status: 404 })
    }

    // Check current manager count
    const { data: existingManagers, error: countError } = await supabase
      .from('wheel_station_managers')
      .select('id')
      .eq('station_id', station_id)

    if (countError) {
      console.error('Error counting managers:', countError)
      return NextResponse.json({ error: 'שגיאה בבדיקת מנהלים קיימים' }, { status: 500 })
    }

    if (existingManagers && existingManagers.length >= 4) {
      return NextResponse.json({ error: 'ניתן להוסיף עד 4 מנהלים לתחנה' }, { status: 400 })
    }

    // Check if phone already exists for this station
    const { data: existingPhone } = await supabase
      .from('wheel_station_managers')
      .select('id')
      .eq('station_id', station_id)
      .eq('phone', phone)
      .single()

    if (existingPhone) {
      return NextResponse.json({ error: 'מספר טלפון זה כבר קיים בתחנה' }, { status: 400 })
    }

    // Add manager
    const { data: manager, error: insertError } = await supabase
      .from('wheel_station_managers')
      .insert({
        station_id,
        full_name,
        phone,
        role: 'מנהל תחנה',
        is_primary: is_primary || false,
        password: password || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error adding manager:', insertError)
      return NextResponse.json({ error: 'שגיאה בהוספת מנהל' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      manager,
      message: `${full_name} נוסף כמנהל ב${station.name}`
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations/admin/managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
