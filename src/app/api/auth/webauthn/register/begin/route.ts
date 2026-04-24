import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { getRpConfig, storeChallenge, getUserCredentials } from '@/lib/webauthn'
import { verifyPassword } from '@/lib/password'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/auth/webauthn/register/begin
// Requires phone + password (user must authenticate before registering a passkey)
// Returns: PublicKeyCredentialCreationOptionsJSON to pass to browser startRegistration()
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rl = checkRateLimit(`webauthn-reg-begin:${clientIp}`, { maxRequests: 5, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' }, { status: 429 })
    }

    const { phone, password } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'יש להזין טלפון' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const cleanPhone = (phone as string).replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, phone, password, is_active')
      .eq('phone', cleanPhone)
      .single() as { data: { id: string; phone: string; password: string | null; is_active: boolean } | null }

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 401 })
    }

    if (password && user.password) {
      const pwCheck = await verifyPassword(password, user.password)
      if (!pwCheck.valid) {
        return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
      }
    }

    const existingCredentials = await getUserCredentials(user.id)
    const { rpName, rpID } = getRpConfig()

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.phone,
      userID: new Uint8Array(Buffer.from(user.id)),
      excludeCredentials: existingCredentials.map(c => ({
        id: c.credential_id,
        transports: c.transports ?? undefined,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    })

    await storeChallenge({ challenge: options.challenge, type: 'registration', userId: user.id })

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn register begin error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
