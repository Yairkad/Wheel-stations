import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp, checkAccountLockout, recordFailedAttempt, clearFailedAttempts } from '@/lib/rate-limit'
import { verifyPassword } from '@/lib/password'
import { createSessionToken, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/admin-session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface RoleResult {
  role: 'station_manager' | 'operator' | 'district_manager' | 'editor' | 'admin'
  label: 'מנהל תחנה' | 'מוקדן' | 'מנהל מוקד' | 'מנהל מחוז' | 'עורך' | 'ניהול מערכת'
  data: Record<string, unknown>
}

type UnifiedRole = 'super_manager' | 'station_manager' | 'call_center_manager' | 'operator' | 'puncture_manager' | 'admin'
interface UnifiedRoleRow {
  id: string
  role: UnifiedRole
  is_active: boolean
  station_id: string | null
  call_center_id: string | null
  is_primary: boolean | null
  title: string | null
  operator_code: string | null
  allowed_districts: string[] | null
  can_edit: boolean | null
  wheel_stations: { id: string; name: string } | { id: string; name: string }[] | null
  call_centers:   { id: string; name: string; is_active: boolean } | { id: string; name: string; is_active: boolean }[] | null
}

// Queries the unified users + user_roles tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkUnifiedUser(supabase: ReturnType<typeof createClient<any>>, phone: string, password: string): Promise<RoleResult[]> {
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, password, is_active')
    .eq('phone', cleanPhone)
    .single() as { data: { id: string; full_name: string; phone: string; password: string | null; is_active: boolean } | null }

  if (!user || user.is_active === false) return []
  if (!user.password) return []
  const pwCheck = await verifyPassword(password, user.password)
  if (!pwCheck.valid) return []
  if (pwCheck.newHash) {
    await supabase.from('users').update({ password: pwCheck.newHash }).eq('id', user.id)
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('id, role, is_active, station_id, call_center_id, is_primary, title, operator_code, allowed_districts, can_edit, wheel_stations(id, name), call_centers(id, name, is_active)')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!roles || roles.length === 0) return []

  const results: RoleResult[] = []
  for (const r of roles as UnifiedRoleRow[]) {
    const ws = Array.isArray(r.wheel_stations) ? r.wheel_stations[0] : r.wheel_stations
    const cc = Array.isArray(r.call_centers)   ? r.call_centers[0]   : r.call_centers
    switch (r.role) {
      case 'super_manager':
        results.push({ role: 'district_manager', label: 'מנהל מחוז', data: { id: user.id, full_name: user.full_name, phone: user.phone, allowed_districts: r.allowed_districts || null, can_edit: r.can_edit ?? false } })
        break
      case 'station_manager':
        results.push({ role: 'station_manager', label: 'מנהל תחנה', data: { id: user.id, full_name: user.full_name, phone: user.phone, station_id: r.station_id, station_name: ws?.name, role: r.title || 'מנהל תחנה', is_primary: r.is_primary || false } })
        break
      case 'call_center_manager':
        if (cc?.is_active === false) break
        results.push({ role: 'operator', label: 'מנהל מוקד', data: { id: user.id, full_name: user.full_name, title: r.title, phone: user.phone, is_primary: r.is_primary, sub_role: 'manager', call_center_id: r.call_center_id, call_center_name: cc?.name } })
        break
      case 'operator':
        if (cc?.is_active === false) break
        results.push({ role: 'operator', label: 'מוקדן', data: { id: user.id, full_name: user.full_name, phone: user.phone, sub_role: 'operator', call_center_id: r.call_center_id, call_center_name: cc?.name } })
        break
      case 'puncture_manager':
        results.push({ role: 'editor', label: 'עורך', data: { id: user.id, full_name: user.full_name, phone: user.phone } })
        break
      case 'admin':
        results.push({ role: 'admin', label: 'ניהול מערכת', data: { full_name: user.full_name } })
        break
    }
  }
  return results
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`unified-auth:${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const phone = body.phone?.trim()
    const password = body.password?.trim()

    if (!phone || !password) {
      return NextResponse.json({ error: 'יש להזין טלפון וסיסמה' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      return NextResponse.json({ error: 'מספר טלפון לא תקין' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'הסיסמה חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const lockout = checkAccountLockout(cleanPhone)
    if (lockout.locked) {
      return NextResponse.json(
        { error: `החשבון נעול זמנית עקב ניסיונות כושלים. נסה שוב בעוד ${lockout.minutesLeft} דקות.` },
        { status: 429 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const roles = await checkUnifiedUser(supabase, phone, password)

    if (roles.length === 0) {
      recordFailedAttempt(cleanPhone)
      return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
    }

    clearFailedAttempts(cleanPhone)

    const response = NextResponse.json({ success: true, roles })

    // Set HttpOnly session cookie when user has admin role
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
    console.error('Unified auth error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
