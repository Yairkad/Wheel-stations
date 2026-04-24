import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import {
  getRpConfig,
  consumeChallenge,
  getCredentialById,
  decodePublicKey,
  updateCredentialCounter,
} from '@/lib/webauthn'
import { createSessionToken, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/admin-session'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface RoleResult {
  role: 'station_manager' | 'operator' | 'district_manager' | 'editor' | 'admin'
  label: string
  data: Record<string, unknown>
}

type UnifiedRole = 'super_manager' | 'station_manager' | 'call_center_manager' | 'operator' | 'puncture_manager' | 'admin'
interface UnifiedRoleRow {
  role: UnifiedRole
  station_id: string | null
  call_center_id: string | null
  is_primary: boolean | null
  title: string | null
  allowed_districts: string[] | null
  wheel_stations: { id: string; name: string } | { id: string; name: string }[] | null
  call_centers: { id: string; name: string; is_active: boolean } | { id: string; name: string; is_active: boolean }[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildRoleResults(supabase: ReturnType<typeof createClient<any>>, userId: string, full_name: string, phone: string): Promise<RoleResult[]> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, station_id, call_center_id, is_primary, title, allowed_districts, wheel_stations(id, name), call_centers(id, name, is_active)')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!roles || roles.length === 0) return []

  const results: RoleResult[] = []
  for (const r of roles as UnifiedRoleRow[]) {
    const ws = Array.isArray(r.wheel_stations) ? r.wheel_stations[0] : r.wheel_stations
    const cc = Array.isArray(r.call_centers)   ? r.call_centers[0]   : r.call_centers
    switch (r.role) {
      case 'super_manager':
        results.push({ role: 'district_manager', label: 'מנהל מחוז', data: { id: userId, full_name, phone, allowed_districts: r.allowed_districts ?? null } })
        break
      case 'station_manager':
        results.push({ role: 'station_manager', label: 'מנהל תחנה', data: { id: userId, full_name, phone, station_id: r.station_id, station_name: ws?.name, role: r.title ?? 'מנהל תחנה', is_primary: r.is_primary ?? false } })
        break
      case 'call_center_manager':
        if (cc?.is_active === false) break
        results.push({ role: 'operator', label: 'מנהל מוקד', data: { id: userId, full_name, title: r.title, phone, is_primary: r.is_primary, sub_role: 'manager', call_center_id: r.call_center_id, call_center_name: cc?.name } })
        break
      case 'operator':
        if (cc?.is_active === false) break
        results.push({ role: 'operator', label: 'מוקדן', data: { id: userId, full_name, phone, sub_role: 'operator', call_center_id: r.call_center_id, call_center_name: cc?.name } })
        break
      case 'puncture_manager':
        results.push({ role: 'editor', label: 'עורך', data: { id: userId, full_name, phone } })
        break
      case 'admin':
        results.push({ role: 'admin', label: 'ניהול מערכת', data: { full_name } })
        break
    }
  }
  return results
}

// POST /api/auth/webauthn/authenticate/complete
// Body: AuthenticationResponseJSON (from browser startAuthentication())
// Returns: { success: true, roles: RoleResult[] } — identical shape to /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rl = checkRateLimit(`webauthn-auth-complete:${clientIp}`, { maxRequests: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' }, { status: 429 })
    }

    const body: AuthenticationResponseJSON = await request.json()

    // Extract challenge from clientDataJSON to find the stored challenge row
    const clientData = JSON.parse(
      Buffer.from(body.response.clientDataJSON, 'base64url').toString('utf-8')
    ) as { challenge: string }

    const stored = await consumeChallenge(clientData.challenge, 'authentication')
    if (!stored?.user_id) {
      return NextResponse.json({ error: 'challenge לא תקין או שפג תוקפו' }, { status: 400 })
    }

    // Look up the specific credential being used (body.id is the credentialId)
    const storedCredential = await getCredentialById(body.id)
    if (!storedCredential || storedCredential.user_id !== stored.user_id) {
      return NextResponse.json({ error: 'פרטי אימות לא תקינים' }, { status: 401 })
    }

    const { origin, rpID } = getRpConfig()

    const { verified, authenticationInfo } = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: storedCredential.credential_id,
        publicKey: decodePublicKey(storedCredential.public_key),
        counter: storedCredential.counter,
        transports: storedCredential.transports ?? undefined,
      },
      requireUserVerification: false,
    })

    if (!verified) {
      return NextResponse.json({ error: 'אימות הpasskey נכשל' }, { status: 401 })
    }

    // Update counter to prevent replay attacks
    await updateCredentialCounter(storedCredential.credential_id, authenticationInfo.newCounter)

    // Resolve user info and roles — identical output to /api/auth/login
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, is_active')
      .eq('id', stored.user_id)
      .single() as { data: { id: string; full_name: string; phone: string; is_active: boolean } | null }

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'המשתמש אינו פעיל' }, { status: 401 })
    }

    const roles = await buildRoleResults(supabase, user.id, user.full_name, user.phone)
    if (roles.length === 0) {
      return NextResponse.json({ error: 'אין הרשאות פעילות למשתמש זה' }, { status: 403 })
    }

    const response = NextResponse.json({ success: true, roles })

    if (roles.some(r => r.role === 'admin')) {
      const token = await createSessionToken()
      response.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ADMIN_SESSION_MAX_AGE,
      })
    }

    return response
  } catch (error) {
    console.error('WebAuthn auth complete error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
