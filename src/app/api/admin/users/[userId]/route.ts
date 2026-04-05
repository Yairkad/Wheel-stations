import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { admin_password, is_active, password, full_name, phone } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (is_active  !== undefined) updates.is_active  = is_active
    if (password   !== undefined) updates.password   = password
    if (full_name  !== undefined) updates.full_name  = full_name
    if (phone      !== undefined) updates.phone      = phone

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'אין שדות לעדכון' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('PATCH /api/admin/users/[userId] error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
