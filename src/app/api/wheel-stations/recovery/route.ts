/**
 * Global Recovery API - finds manager by phone (no stationId needed)
 * POST - Reset password using recovery key + phone
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone, recovery_key, new_password } = await request.json()

    if (!phone || !recovery_key || !new_password) {
      return NextResponse.json({ error: 'נדרש טלפון, מפתח שחזור וסיסמא חדשה' }, { status: 400 })
    }

    if (new_password.length < 4) {
      return NextResponse.json({ error: 'הסיסמא חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    // Find manager by phone across all stations
    const cleanPhone = phone.replace(/\D/g, '')
    const { data: managers } = await supabase
      .from('wheel_station_managers')
      .select('id, phone, recovery_key, station_id')

    const manager = managers?.find(m => m.phone.replace(/\D/g, '') === cleanPhone)
    if (!manager) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא במערכת' }, { status: 404 })
    }

    if (!manager.recovery_key || manager.recovery_key !== recovery_key) {
      return NextResponse.json({ error: 'מפתח שחזור שגוי' }, { status: 403 })
    }

    // Reset password and generate new recovery key
    const newRecoveryKey = crypto.randomBytes(32).toString('hex')
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
    console.error('Error in POST global recovery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
