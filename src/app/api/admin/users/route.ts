import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [usersResult, rolesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, full_name, phone, is_active, created_at')
        .order('full_name'),
      supabase
        .from('user_roles')
        .select(`
          id, user_id, role, is_primary, title, operator_code,
          allowed_districts, is_active, station_id, call_center_id,
          wheel_stations ( name ),
          call_centers   ( name )
        `),
    ])

    if (usersResult.error) throw usersResult.error
    if (rolesResult.error) throw rolesResult.error

    const users = usersResult.data
    const roles = rolesResult.data

    const rolesMap: Record<string, object[]> = {}
    for (const r of roles || []) {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = []
      rolesMap[r.user_id].push({
        id:               r.id,
        role:             r.role,
        station_id:       r.station_id,
        call_center_id:   r.call_center_id,
        is_primary:       r.is_primary,
        title:            r.title,
        operator_code:    r.operator_code,
        allowed_districts: r.allowed_districts,
        is_active:        r.is_active,
        station_name:     (r.wheel_stations as { name?: string } | null)?.name ?? null,
        call_center_name: (r.call_centers   as { name?: string } | null)?.name ?? null,
      })
    }

    const result = (users || []).map(u => ({
      ...u,
      roles: rolesMap[u.id] || [],
    }))

    return NextResponse.json({ users: result })
  } catch (err: unknown) {
    console.error('GET /api/admin/users error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
