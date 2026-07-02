import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

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
    const { is_active, password, full_name, phone } = body

    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    // The live DB's FK constraints don't actually match the CASCADE defined
    // in the migration files (confirmed via Postgres error on user_roles_user_id_fkey),
    // so clean up dependent rows explicitly instead of trusting ON DELETE CASCADE.
    await supabase.from('login_log').update({ user_id: null }).eq('user_id', userId)
    await supabase.from('user_roles').delete().eq('user_id', userId)
    await supabase.from('webauthn_credentials').delete().eq('user_id', userId)
    await supabase.from('webauthn_challenges').delete().eq('user_id', userId)

    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) {
      if (error.code === '23503') {
        console.error('DELETE /api/admin/users/[userId] FK violation:', error.message, error.details)
        return NextResponse.json(
          { error: 'לא ניתן למחוק משתמש עם רשומות מקושרות במערכת', detail: error.details || error.message },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('DELETE /api/admin/users/[userId] error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
