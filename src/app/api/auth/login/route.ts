import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface RoleResult {
  role: 'station_manager' | 'operator' | 'district_manager' | 'editor'
  label: 'מנהל תחנה' | 'מוקדן' | 'מנהל מחוז' | 'עורך'
  data: Record<string, unknown>
}

async function checkStationManager(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  password: string
): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data: managers } = await supabase
    .from('wheel_station_managers')
    .select('id, full_name, phone, password, role, is_primary, is_active, station_id, wheel_stations(id, name)')

  if (!managers) return null

  const manager = managers.find(
    (m: { phone: string }) => m.phone.replace(/\D/g, '') === cleanPhone
  )
  if (!manager) return null
  if (!manager.is_active) return null
  if (manager.password !== password) return null

  const station = manager.wheel_stations as { id: string; name: string } | null

  return {
    role: 'station_manager',
    label: 'מנהל תחנה',
    data: {
      id: manager.id,
      full_name: manager.full_name,
      phone: manager.phone,
      station_id: station?.id,
      station_name: station?.name,
      role: manager.role || 'מנהל תחנה',
      is_primary: manager.is_primary || false,
    }
  }
}

async function checkOperator(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  password: string
): Promise<RoleResult | null> {
  // Try call_center_managers first, then operators
  const { data: manager } = await supabase
    .from('call_center_managers')
    .select('id, full_name, title, phone, password, is_primary, is_active, call_center_id, call_centers(id, name, is_active)')
    .eq('phone', phone)
    .single()

  if (manager && manager.is_active && manager.password === password) {
    const callCenter = manager.call_centers as { id: string; name: string; is_active: boolean } | null
    if (callCenter?.is_active) {
      return {
        role: 'operator',
        label: 'מוקדן',
        data: {
          id: manager.id,
          full_name: manager.full_name,
          title: manager.title,
          phone: manager.phone,
          is_primary: manager.is_primary,
          sub_role: 'manager',
          call_center_id: manager.call_center_id,
          call_center_name: callCenter.name,
        }
      }
    }
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, full_name, phone, code, is_active, call_center_id, call_centers(id, name, is_active)')
    .eq('phone', phone)
    .single()

  if (operator && operator.is_active && operator.code === password) {
    const callCenter = operator.call_centers as { id: string; name: string; is_active: boolean } | null
    if (callCenter?.is_active) {
      return {
        role: 'operator',
        label: 'מוקדן',
        data: {
          id: operator.id,
          full_name: operator.full_name,
          phone: operator.phone,
          sub_role: 'operator',
          call_center_id: operator.call_center_id,
          call_center_name: callCenter.name,
        }
      }
    }
  }

  return null
}

async function checkDistrictManager(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  password: string
): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data: managers } = await supabase
    .from('super_managers')
    .select('id, full_name, phone, password, is_active, allowed_districts')
    .limit(50)

  if (!managers) return null

  const manager = managers.find(
    (m: { phone: string }) => m.phone.replace(/\D/g, '') === cleanPhone
  )
  if (!manager) return null
  if (!manager.is_active) return null
  if (manager.password !== password) return null

  return {
    role: 'district_manager',
    label: 'מנהל מחוז',
    data: {
      id: manager.id,
      full_name: manager.full_name,
      phone: manager.phone,
      allowed_districts: manager.allowed_districts || null,
    }
  }
}

async function checkEditor(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  password: string
): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data: manager } = await supabase
    .from('puncture_managers')
    .select('id, full_name, phone, is_active')
    .eq('phone', cleanPhone)
    .eq('password', password)
    .eq('is_active', true)
    .single()

  if (!manager) return null

  return {
    role: 'editor',
    label: 'עורך',
    data: {
      id: manager.id,
      full_name: manager.full_name,
      phone: manager.phone,
    }
  }
}

// POST /api/auth/login
// Unified login: checks all 4 role tables in parallel
// Returns array of matched roles (user may have multiple)
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check all 4 role tables in parallel
    const [stationManager, operator, districtManager, editor] = await Promise.all([
      checkStationManager(supabase, phone, password),
      checkOperator(supabase, phone, password),
      checkDistrictManager(supabase, phone, password),
      checkEditor(supabase, phone, password),
    ])

    const roles: RoleResult[] = [stationManager, operator, districtManager, editor].filter(
      (r): r is RoleResult => r !== null
    )

    if (roles.length === 0) {
      return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })
    }

    return NextResponse.json({ success: true, roles })
  } catch (error) {
    console.error('Unified auth error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
