import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { getRpConfig, consumeChallenge, saveCredential, encodePublicKey } from '@/lib/webauthn'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// POST /api/auth/webauthn/register/complete
// Body: RegistrationResponseJSON (from browser startRegistration()) + optional friendlyName
// Returns: { success: true, credentialId }
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rl = checkRateLimit(`webauthn-reg-complete:${clientIp}`, { maxRequests: 5, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' }, { status: 429 })
    }

    const body: RegistrationResponseJSON & { friendlyName?: string } = await request.json()

    // The challenge inside clientDataJSON is the base64url value we originally stored
    const clientData = JSON.parse(
      Buffer.from(body.response.clientDataJSON, 'base64url').toString('utf-8')
    ) as { challenge: string }

    const stored = await consumeChallenge(clientData.challenge, 'registration')
    if (!stored?.user_id) {
      return NextResponse.json({ error: 'challenge לא תקין או שפג תוקפו' }, { status: 400 })
    }

    const { origin, rpID } = getRpConfig()

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    })

    if (!verified || !registrationInfo) {
      return NextResponse.json({ error: 'אימות הרישום נכשל' }, { status: 400 })
    }

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo

    await saveCredential({
      userId: stored.user_id,
      credentialId: credential.id,
      publicKey: encodePublicKey(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.transports,
      friendlyName: body.friendlyName,
    })

    return NextResponse.json({ success: true, credentialId: credential.id })
  } catch (error) {
    console.error('WebAuthn register complete error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
