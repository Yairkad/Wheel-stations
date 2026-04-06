import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; roleId: string }> }
) {
  try {
    const { roleId } = await params
    const body = await request.json()
    const { admin_password, is_active, is_primary } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (is_active  !== undefined) updates.is_active  = is_active
    if (is_primary !== undefined) updates.is_primary = is_primary

    const { error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', roleId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('PATCH /api/admin/users/[userId]/roles/[roleId] error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
