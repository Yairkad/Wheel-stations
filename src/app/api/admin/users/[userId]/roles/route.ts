import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/users/[userId]/roles — add a new role to existing user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { role, station_id, call_center_id, operator_code, title, allowed_districts } = body

    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }
    if (!role) return NextResponse.json({ error: 'תפקיד חובה' }, { status: 400 })

    const roleRow: Record<string, unknown> = { user_id: userId, role, is_active: true, is_primary: false }
    if (station_id)        roleRow.station_id        = station_id
    if (call_center_id)    roleRow.call_center_id    = call_center_id
    if (operator_code)     roleRow.operator_code     = operator_code
    if (title)             roleRow.title             = title
    if (allowed_districts) roleRow.allowed_districts = allowed_districts

    const { error } = await supabase.from('user_roles').insert(roleRow)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('POST /api/admin/users/[userId]/roles error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
