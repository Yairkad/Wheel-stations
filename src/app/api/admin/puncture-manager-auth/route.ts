import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { phone, password } = await request.json()
  if (!phone || !password) {
    return NextResponse.json({ error: 'נדרש טלפון וסיסמה' }, { status: 400 })
  }

  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, password, is_active')
    .eq('phone', cleanPhone)
    .single()

  if (!user || !user.is_active || user.password !== password) {
    return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'puncture_manager')
    .eq('is_active', true)
    .single()

  if (!roleRow) {
    return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    manager: { id: user.id, full_name: user.full_name, phone: user.phone, is_active: user.is_active }
  })
}
