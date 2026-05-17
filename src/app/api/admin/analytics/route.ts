import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  if (!(await validateAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get('days') || '90'), 365)
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const [
    kpiRes,
    borrowsByMonthRes,
    topStationsRes,
    wheelsByStationRes,
    auditBreakdownRes,
    avgDurationRes,
    topLoginUsersRes,
    loginsByDayRes,
    depositTypesRes,
    borrowStatusRes,
  ] = await Promise.all([
    // KPIs
    supabase.rpc('analytics_kpis').single().catch(() => ({ data: null })).then(() =>
      supabase.from('wheel_stations').select('id, is_active').then(async ({ data: stations }) => {
        const [borrows, wheels, users, logins] = await Promise.all([
          supabase.from('wheel_borrows').select('id, actual_return_date, created_at'),
          supabase.from('wheels').select('id, is_available, temporarily_unavailable, deleted_at'),
          supabase.from('users').select('id, is_active'),
          supabase.from('login_log').select('id').gte('created_at', sinceISO),
        ])
        const allBorrows = borrows.data || []
        const allWheels = wheels.data || []
        const allUsers = users.data || []
        return {
          stations_active: stations?.filter(s => s.is_active).length ?? 0,
          borrows_total: allBorrows.filter(b => new Date(b.created_at) >= since).length,
          borrows_active: allBorrows.filter(b => !b.actual_return_date).length,
          wheels_total: allWheels.filter(w => !w.deleted_at).length,
          wheels_available: allWheels.filter(w => !w.deleted_at && w.is_available && !w.temporarily_unavailable).length,
          wheels_unavailable: allWheels.filter(w => !w.deleted_at && w.temporarily_unavailable).length,
          wheels_borrowed: allWheels.filter(w => !w.deleted_at && !w.is_available).length,
          users_active: allUsers.filter(u => u.is_active).length,
          logins_period: logins.data?.length ?? 0,
        }
      })
    ),

    // Borrows by month (last 12 months)
    supabase
      .from('wheel_borrows')
      .select('created_at, actual_return_date')
      .gte('created_at', (() => { const d = new Date(); d.setMonth(d.getMonth() - 11); d.setDate(1); return d.toISOString() })()),

    // Top stations by borrows
    supabase
      .from('wheel_borrows')
      .select('station_id, wheel_stations(name)')
      .gte('created_at', sinceISO),

    // Wheels by station
    supabase
      .from('wheel_stations')
      .select('id, name, is_active, wheels(id, is_available, temporarily_unavailable, deleted_at)')
      .eq('is_active', true),

    // Audit log breakdown
    supabase
      .from('audit_log')
      .select('action, actor_type, station_name, created_at')
      .gte('created_at', sinceISO),

    // Average borrow duration (days)
    supabase
      .from('wheel_borrows')
      .select('borrow_date, actual_return_date')
      .not('actual_return_date', 'is', null)
      .gte('created_at', sinceISO),

    // Full login log (for summary table + detail view)
    supabase
      .from('login_log')
      .select('id, user_id, full_name, phone, role, ip, created_at')
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),

    // Logins by day (last 30 days)
    supabase
      .from('login_log')
      .select('created_at')
      .gte('created_at', (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString() })()),

    // Deposit types
    supabase
      .from('wheel_borrows')
      .select('deposit_type')
      .gte('created_at', sinceISO),

    // Borrow status breakdown
    supabase
      .from('wheel_borrows')
      .select('status, actual_return_date')
      .gte('created_at', sinceISO),
  ])

  // --- Process borrows by month ---
  const monthMap: Record<string, { month: string; borrows: number; returned: number }> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })
    monthMap[key] = { month: label, borrows: 0, returned: 0 }
  }
  for (const b of borrowsByMonthRes.data || []) {
    const key = b.created_at.slice(0, 7)
    if (monthMap[key]) {
      monthMap[key].borrows++
      if (b.actual_return_date) monthMap[key].returned++
    }
  }
  const borrowsByMonth = Object.values(monthMap)

  // --- Top stations ---
  const stationCount: Record<string, { name: string; count: number }> = {}
  for (const b of topStationsRes.data || []) {
    const ws = Array.isArray(b.wheel_stations) ? b.wheel_stations[0] : b.wheel_stations as { name: string } | null
    const name = ws?.name || 'לא ידוע'
    if (!stationCount[b.station_id]) stationCount[b.station_id] = { name, count: 0 }
    stationCount[b.station_id].count++
  }
  const topStations = Object.values(stationCount).sort((a, b) => b.count - a.count).slice(0, 8)

  // --- Wheels by station ---
  const wheelsByStation = (wheelsByStationRes.data || []).map(s => {
    const ws = s.wheels as { id: string; is_available: boolean; temporarily_unavailable: boolean; deleted_at: string | null }[]
    const active = ws.filter(w => !w.deleted_at)
    return {
      name: s.name,
      total: active.length,
      available: active.filter(w => w.is_available && !w.temporarily_unavailable).length,
      borrowed: active.filter(w => !w.is_available).length,
      unavailable: active.filter(w => w.temporarily_unavailable).length,
      deleted: ws.filter(w => w.deleted_at).length,
    }
  }).filter(s => s.total > 0).sort((a, b) => b.total - a.total)

  // --- Audit breakdown ---
  const actionLabels: Record<string, string> = {
    wheel_created: 'גלגל נוצר',
    wheel_updated: 'גלגל עודכן',
    wheel_deleted: 'גלגל נמחק',
    wheel_restored: 'גלגל שוחזר',
    borrow_created: 'השאלה נפתחה',
    borrow_returned: 'גלגל הוחזר',
  }
  const auditMap: Record<string, number> = {}
  for (const a of auditBreakdownRes.data || []) {
    const label = actionLabels[a.action] || a.action
    auditMap[label] = (auditMap[label] || 0) + 1
  }
  const auditBreakdown = Object.entries(auditMap)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)

  // --- Avg borrow duration ---
  const durations = (avgDurationRes.data || []).map(b => {
    const start = new Date(b.borrow_date).getTime()
    const end = new Date(b.actual_return_date).getTime()
    return (end - start) / (1000 * 60 * 60 * 24)
  }).filter(d => d >= 0)
  const avgDuration = durations.length
    ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
    : 0

  // --- Login log processing ---
  const roleLabels: Record<string, string> = {
    admin: 'אדמין', station_manager: 'מנהל תחנה', super_manager: 'מנהל מחוז',
    district_manager: 'מנהל מחוז', operator: 'מוקדן', call_center_manager: 'מנהל מוקד',
    puncture_manager: 'עורך פנצ׳ריות',
  }
  const allLoginLogs = topLoginUsersRes.data || []
  const userLoginMap: Record<string, { full_name: string; phone: string | null; roles: Set<string>; count: number; last_login: string }> = {}
  for (const l of allLoginLogs) {
    const key = l.user_id || l.phone || l.full_name
    if (!userLoginMap[key]) userLoginMap[key] = { full_name: l.full_name, phone: l.phone, roles: new Set(), count: 0, last_login: l.created_at }
    userLoginMap[key].roles.add(roleLabels[l.role] || l.role)
    userLoginMap[key].count++
    if (l.created_at > userLoginMap[key].last_login) userLoginMap[key].last_login = l.created_at
  }
  const topLoginUsers = Object.values(userLoginMap)
    .map(u => ({ ...u, roles: Array.from(u.roles) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  const loginSummary = Object.values(userLoginMap)
    .map(u => ({ ...u, roles: Array.from(u.roles) }))
    .sort((a, b) => b.count - a.count)
  const loginLog = allLoginLogs.map(l => ({ ...l, roleLabel: roleLabels[l.role] || l.role }))

  // --- Logins by day ---
  const dayMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const l of loginsByDayRes.data || []) {
    const key = l.created_at.slice(0, 10)
    if (key in dayMap) dayMap[key]++
  }
  const loginsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  // --- Deposit types ---
  const depositMap: Record<string, number> = {}
  for (const b of depositTypesRes.data || []) {
    const t = b.deposit_type || 'לא צוין'
    depositMap[t] = (depositMap[t] || 0) + 1
  }
  const depositTypes = Object.entries(depositMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    kpis: kpiRes,
    borrowsByMonth,
    topStations,
    wheelsByStation,
    auditBreakdown,
    avgDuration,
    topLoginUsers,
    loginsByDay,
    depositTypes,
    loginSummary,
    loginLog,
  })
}
