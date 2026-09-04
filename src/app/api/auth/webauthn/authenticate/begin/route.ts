import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAuthenticationOptions, type AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { getRpConfig, storeChallenge } from '@/lib/webauthn'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/auth/webauthn/authenticate/begin
// Body: { phone? } — phone is optional
// Without phone: browser shows all passkeys for this site (discoverable credentials)
// With phone:    browser shows only passkeys for that specific account
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rl = checkRateLimit(`webauthn-auth-begin:${clientIp}`, { maxRequests: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' }, { status: 429 })
    }

    const { phone } = await request.json()
    const { rpID } = getRpConfig()

    if (phone) {
      // Phone provided → restrict to that account's credentials
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const cleanPhone = (phone as string).replace(/\D/g, '')

      const { data: user } = await supabase
        .from('users')
        .select('id, is_active, webauthn_credentials(credential_id, transports)')
        .eq('phone', cleanPhone)
        .single() as {
          data: {
            id: string
            is_active: boolean
            webauthn_credentials: { credential_id: string; transports: AuthenticatorTransportFuture[] | null }[]
          } | null
        }

      const credentials = user?.is_active ? user.webauthn_credentials : []

      if (credentials.length === 0) {
        return NextResponse.json(
          { error: 'לא נמצאו מפתחות passkey עבור מספר זה' },
          { status: 404 }
        )
      }

      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'required',
        allowCredentials: credentials.map(c => ({
          id: c.credential_id,
          transports: c.transports ?? undefined,
        })),
      })

      await storeChallenge({
        challenge: options.challenge,
        type: 'authentication',
        userId: user!.id,
        phone: cleanPhone,
      })

      return NextResponse.json(options)
    }

    // No phone → discoverable: browser shows all passkeys for this site
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      // No allowCredentials — device picks from its own passkey store
    })

    await storeChallenge({ challenge: options.challenge, type: 'authentication' })

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn auth begin error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
