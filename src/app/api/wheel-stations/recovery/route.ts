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

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא במערכת' }, { status: 404 })
    }

    // Find any active station_manager role with matching recovery_key
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id, recovery_key')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('is_active', true)
      .single()

    if (!roleRow) {
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא במערכת' }, { status: 404 })
    }

    if (!roleRow.recovery_key || roleRow.recovery_key !== recovery_key) {
      return NextResponse.json({ error: 'מפתח שחזור שגוי' }, { status: 403 })
    }

    const newRecoveryKey = crypto.randomBytes(32).toString('hex')

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: new_password })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'שגיאה באיפוס הסיסמא' }, { status: 500 })
    }

    await supabase
      .from('user_roles')
      .update({ recovery_key: newRecoveryKey })
      .eq('id', roleRow.id)

    return NextResponse.json({ success: true, message: 'הסיסמא אופסה בהצלחה! יש להוריד תעודת שחזור חדשה.' })
  } catch (error) {
    console.error('Error in POST global recovery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
