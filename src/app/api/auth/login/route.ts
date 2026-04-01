import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Supa = SupabaseClient<any, any, any>

export interface RoleResult {
  role: 'station_manager' | 'operator' | 'district_manager' | 'editor'
  label: 'מנהל תחנה' | 'מוקדן' | 'מנהל מחוז' | 'עורך'
  data: Record<string, unknown>
}

interface StationManagerRow {
  id: string
  full_name: string
  phone: string
  password: string
  role: string | null
  is_primary: boolean | null
  is_active: boolean | null
  station_id: string
  wheel_stations: { id: string; name: string }[] | { id: string; name: string } | null
}

interface CallCenterManagerRow {
  id: string
  full_name: string
  title: string | null
  phone: string
  password: string
  is_primary: boolean | null
  is_active: boolean | null
  call_center_id: string
  call_centers: { id: string; name: string; is_active: boolean } | null
}

interface OperatorRow {
  id: string
  full_name: string
  phone: string
  code: string
  is_active: boolean | null
  call_center_id: string
  call_centers: { id: string; name: string; is_active: boolean } | null
}

interface SuperManagerRow {
  id: string
  full_name: string
  phone: string
  password: string
  is_active: boolean | null
  allowed_districts: string[] | null
}

interface PunctureManagerRow {
  id: string
  full_name: string
  phone: string
}

async function checkStationManager(supabase: Supa, phone: string, password: string): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data, error } = await supabase
    .from('wheel_station_managers')
    .select('*, wheel_stations(id, name)')

  if (!data) { console.log('[checkStationManager] no data, error:', JSON.stringify(error)); return null }

  const manager = (data as StationManagerRow[]).find(
    (m) => m.phone.replace(/\D/g, '') === cleanPhone
  )
  if (!manager) { console.log('[checkStationManager] phone not found, cleanPhone:', cleanPhone, 'available:', (data as StationManagerRow[]).map(m => m.phone.replace(/\D/g, ''))); return null }
  if (manager.is_active === false) { console.log('[checkStationManager] is_active=false'); return null }
  if (manager.password !== password) { console.log('[checkStationManager] wrong password'); return null }

  const stationRaw = manager.wheel_stations
  const station = Array.isArray(stationRaw) ? stationRaw[0] : stationRaw
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

async function checkOperator(supabase: Supa, phone: string, password: string): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data: managersRaw } = await supabase
    .from('call_center_managers')
    .select('id, full_name, title, phone, password, is_primary, is_active, call_center_id, call_centers(id, name, is_active)')

  const manager = (managersRaw as CallCenterManagerRow[] | null)?.find(
    m => m.phone?.replace(/\D/g, '') === cleanPhone
  ) ?? null
  if (manager && manager.is_active !== false && manager.password === password && manager.call_centers?.is_active !== false) {
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
        call_center_name: manager.call_centers?.name,
      }
    }
  }

  const { data: operatorsRaw } = await supabase
    .from('operators')
    .select('id, full_name, phone, code, is_active, call_center_id, call_centers(id, name, is_active)')

  const operator = (operatorsRaw as OperatorRow[] | null)?.find(
    o => o.phone?.replace(/\D/g, '') === cleanPhone
  ) ?? null
  if (operator && operator.is_active !== false && operator.code === password && operator.call_centers?.is_active !== false) {
    return {
      role: 'operator',
      label: 'מוקדן',
      data: {
        id: operator.id,
        full_name: operator.full_name,
        phone: operator.phone,
        sub_role: 'operator',
        call_center_id: operator.call_center_id,
        call_center_name: operator.call_centers?.name,
      }
    }
  }

  return null
}

async function checkDistrictManager(supabase: Supa, phone: string, password: string): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data } = await supabase
    .from('super_managers')
    .select('id, full_name, phone, password, is_active, allowed_districts')
    .limit(50)

  if (!data) return null

  const manager = (data as SuperManagerRow[]).find(
    (m) => m.phone.replace(/\D/g, '') === cleanPhone
  )
  if (!manager || manager.is_active === false || manager.password !== password) return null

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

async function checkEditor(supabase: Supa, phone: string, password: string): Promise<RoleResult | null> {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data } = await supabase
    .from('puncture_managers')
    .select('id, full_name, phone, is_active')
    .eq('phone', cleanPhone)
    .eq('password', password)
    .eq('is_active', true)
    .single()

  if (!data) return null

  const manager = data as PunctureManagerRow
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

    const [stationManager, operator, districtManager, editor] = await Promise.all([
      checkStationManager(supabase, phone, password),
      checkOperator(supabase, phone, password),
      checkDistrictManager(supabase, phone, password),
      checkEditor(supabase, phone, password),
    ])

    console.log('[auth/login] results:', {
      stationManager: !!stationManager,
      operator: !!operator,
      districtManager: !!districtManager,
      editor: !!editor,
    })

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
