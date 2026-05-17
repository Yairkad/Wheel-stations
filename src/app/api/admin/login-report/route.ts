import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ROLE_LABELS: Record<string, string> = {
  admin: 'ניהול מערכת',
  station_manager: 'מנהל תחנה',
  district_manager: 'מנהל מחוז',
  super_manager: 'מנהל מחוז',
  operator: 'מוקדן',
  call_center_manager: 'מנהל מוקד',
  puncture_manager: 'עורך פנצ׳ריות',
  editor: 'עורך',
}

export async function GET(request: NextRequest) {
  if (!(await validateAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get('days') || '90'), 365)

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: logs, error } = await supabase
    .from('login_log')
    .select('id, user_id, full_name, phone, role, ip, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate by user
  const byUser: Record<string, {
    user_id: string | null
    full_name: string
    phone: string | null
    roles: Set<string>
    count: number
    last_login: string
  }> = {}

  for (const log of logs ?? []) {
    const key = log.user_id || log.full_name
    if (!byUser[key]) {
      byUser[key] = {
        user_id: log.user_id,
        full_name: log.full_name,
        phone: log.phone,
        roles: new Set(),
        count: 0,
        last_login: log.created_at,
      }
    }
    byUser[key].roles.add(ROLE_LABELS[log.role] || log.role)
    byUser[key].count++
    if (log.created_at > byUser[key].last_login) {
      byUser[key].last_login = log.created_at
    }
  }

  const summary = Object.values(byUser)
    .map(u => ({ ...u, roles: Array.from(u.roles) }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    logs: logs ?? [],
    summary,
    total: logs?.length ?? 0,
    days,
  })
}
