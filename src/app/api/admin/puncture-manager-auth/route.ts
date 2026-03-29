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
  const { data: manager, error } = await supabase
    .from('puncture_managers')
    .select('id, full_name, phone, is_active')
    .eq('phone', cleanPhone)
    .eq('password', password)
    .eq('is_active', true)
    .single()

  if (error || !manager) {
    return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
  }

  return NextResponse.json({ success: true, manager })
}
