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

    // Verify manager credentials
    const cleanPhone = phone.replace(/\D/g, '')
    const { data: managers } = await supabase
      .from('wheel_station_managers')
      .select('id, phone, password, recovery_key, full_name, role, is_primary')
      .eq('station_id', stationId)

    const manager = managers?.find(m => m.phone.replace(/\D/g, '') === cleanPhone)
    if (!manager || manager.password !== password) {
      return NextResponse.json({ error: 'פרטי התחברות שגויים' }, { status: 403 })
    }

    // Get station name for the certificate
    const { data: station } = await supabase
      .from('wheel_stations')
      .select('name')
      .eq('id', stationId)
      .single()

    // Generate recovery key if doesn't exist
    let recoveryKey = manager.recovery_key
    if (!recoveryKey) {
      recoveryKey = generateRecoveryKey()
      await supabase
        .from('wheel_station_managers')
        .update({ recovery_key: recoveryKey })
        .eq('id', manager.id)
    }

    return NextResponse.json({
      recovery_key: recoveryKey,
      manager_name: manager.full_name,
      station_name: station?.name || '',
      role: manager.role,
      is_primary: manager.is_primary
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
    const { data: managers } = await supabase
      .from('wheel_station_managers')
      .select('id, phone, recovery_key')
      .eq('station_id', stationId)

    const manager = managers?.find(m => m.phone.replace(/\D/g, '') === cleanPhone)
    if (!manager) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא' }, { status: 404 })
    }

    if (!manager.recovery_key || manager.recovery_key !== recovery_key) {
      return NextResponse.json({ error: 'מפתח שחזור שגוי' }, { status: 403 })
    }

    // Reset password and generate new recovery key
    const newRecoveryKey = generateRecoveryKey()
    const { error } = await supabase
      .from('wheel_station_managers')
      .update({ password: new_password, recovery_key: newRecoveryKey })
      .eq('id', manager.id)

    if (error) {
      return NextResponse.json({ error: 'שגיאה באיפוס הסיסמא' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'הסיסמא אופסה בהצלחה! יש להוריד תעודת שחזור חדשה.'
    })
  } catch (error) {
    console.error('Error in POST recovery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
