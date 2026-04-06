import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [usersResult, rolesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, full_name, phone, password, is_active, created_at')
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

// POST /api/admin/users — create user + initial role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, full_name, phone, password, role, station_id, call_center_id, operator_code, allowed_districts, title } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    if (!full_name?.trim() || !phone?.trim() || !role) {
      return NextResponse.json({ error: 'שם, טלפון ותפקיד הם שדות חובה' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    // Upsert user — if phone exists, update name/password only if provided
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    let userId: string
    if (existing) {
      userId = existing.id
      const updates: Record<string, unknown> = { full_name: full_name.trim() }
      if (password) updates.password = password
      await supabase.from('users').update(updates).eq('id', userId)
    } else {
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert({ full_name: full_name.trim(), phone: cleanPhone, password: password || null })
        .select('id')
        .single()
      if (insertErr) throw insertErr
      userId = newUser.id
    }

    // Add role
    const roleRow: Record<string, unknown> = {
      user_id:    userId,
      role,
      is_active:  true,
      is_primary: true,
    }
    if (station_id)       roleRow.station_id       = station_id
    if (call_center_id)   roleRow.call_center_id   = call_center_id
    if (operator_code)    roleRow.operator_code    = operator_code
    if (title)            roleRow.title            = title
    if (allowed_districts) roleRow.allowed_districts = allowed_districts

    const { error: roleErr } = await supabase.from('user_roles').insert(roleRow)
    if (roleErr) throw roleErr

    return NextResponse.json({ success: true, user_id: userId })
  } catch (err: unknown) {
    console.error('POST /api/admin/users error:', err)
    const msg = err instanceof Error ? err.message : 'שגיאה פנימית'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
