import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/auth/webauthn/credentials
// Body: { phone, password? }
// Password optional — passkey-authenticated users have no stored password in localStorage
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'יש להזין מספר טלפון' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const cleanPhone = (phone as string).replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, password, is_active')
      .eq('phone', cleanPhone)
      .single() as { data: { id: string; password: string | null; is_active: boolean } | null }

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 401 })
    }

    // Verify password only when provided (passkey-authenticated users skip this)
    if (password && user.password) {
      const pwCheck = await verifyPassword(password, user.password)
      if (!pwCheck.valid) {
        return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 })
      }
    }

    const { data: credentials } = await supabase
      .from('webauthn_credentials')
      .select('id, credential_id, friendly_name, device_type, backed_up, created_at, last_used_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ credentials: credentials ?? [] })
  } catch (error) {
    console.error('WebAuthn credentials list error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
