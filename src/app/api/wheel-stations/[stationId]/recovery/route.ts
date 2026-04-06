/**
 * Recovery Key API
 * GET  - Get or generate recovery key for authenticated manager
 * POST - Reset password using recovery key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

function generateRecoveryKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET - Get recovery key for authenticated manager
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const phone = request.nextUrl.searchParams.get('phone')
    const password = request.nextUrl.searchParams.get('password')

    if (!phone || !password) {
      return NextResponse.json({ error: 'נדרש טלפון וסיסמא' }, { status: 401 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, password, is_active')
      .eq('phone', cleanPhone)
      .single()

    if (!user || !user.is_active || user.password !== password) {
      return NextResponse.json({ error: 'פרטי התחברות שגויים' }, { status: 403 })
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id, is_primary, title, recovery_key')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('station_id', stationId)
      .eq('is_active', true)
      .single()

    if (!roleRow) {
      return NextResponse.json({ error: 'פרטי התחברות שגויים' }, { status: 403 })
    }

    const { data: station } = await supabase
      .from('wheel_stations')
      .select('name')
      .eq('id', stationId)
      .single()

    // Generate recovery key if doesn't exist
    let recoveryKey = roleRow.recovery_key
    if (!recoveryKey) {
      recoveryKey = generateRecoveryKey()
      const { error: keyErr } = await supabase
        .from('user_roles')
        .update({ recovery_key: recoveryKey })
        .eq('id', roleRow.id)
      if (keyErr) throw keyErr
    }

    return NextResponse.json({
      recovery_key: recoveryKey,
      manager_name: user.full_name,
      station_name: station?.name || '',
      role: roleRow.title || 'מנהל תחנה',
      is_primary: roleRow.is_primary || false,
    })
  } catch (error) {
    console.error('Error in GET recovery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Reset password using recovery key
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const { phone, recovery_key, new_password } = await request.json()

    if (!phone || !recovery_key || !new_password) {
      return NextResponse.json({ error: 'נדרש טלפון, מפתח שחזור וסיסמא חדשה' }, { status: 400 })
    }

    if (new_password.length < 4) {
      return NextResponse.json({ error: 'הסיסמא חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא' }, { status: 404 })
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id, recovery_key')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('station_id', stationId)
      .eq('is_active', true)
      .single()

    if (!roleRow) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא' }, { status: 404 })
    }

    if (!roleRow.recovery_key || roleRow.recovery_key !== recovery_key) {
      return NextResponse.json({ error: 'מפתח שחזור שגוי' }, { status: 403 })
    }

    // Reset password and generate new recovery key
    const newRecoveryKey = generateRecoveryKey()

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: new_password })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'שגיאה באיפוס הסיסמא' }, { status: 500 })
    }

    const { error: keyErr } = await supabase
      .from('user_roles')
      .update({ recovery_key: newRecoveryKey })
      .eq('id', roleRow.id)
    if (keyErr) throw keyErr

    return NextResponse.json({ success: true, message: 'הסיסמא אופסה בהצלחה! יש להוריד תעודת שחזור חדשה.' })
  } catch (error) {
    console.error('Error in POST recovery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
