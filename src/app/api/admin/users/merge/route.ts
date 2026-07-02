import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/users/merge
// Body: { admin_password, keep_id, delete_id }
// Moves all roles from delete_id → keep_id, then deletes delete_id
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keep_id, delete_id } = body

    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    if (!keep_id || !delete_id || keep_id === delete_id) {
      return NextResponse.json({ error: 'נתונים שגויים' }, { status: 400 })
    }

    // Move all roles from delete_id to keep_id
    const { error: moveErr } = await supabase
      .from('user_roles')
      .update({ user_id: keep_id })
      .eq('user_id', delete_id)

    if (moveErr) throw moveErr

    // The live DB's FK constraints don't actually match the CASCADE defined
    // in the migration files (confirmed via Postgres error on user_roles_user_id_fkey),
    // so clean up dependent rows explicitly instead of trusting ON DELETE CASCADE.
    // Without this, the delete below fails after roles were already moved above,
    // leaving delete_id as a roleless ghost account.
    await supabase.from('login_log').update({ user_id: null }).eq('user_id', delete_id)
    await supabase.from('user_roles').delete().eq('user_id', delete_id)
    await supabase.from('webauthn_credentials').delete().eq('user_id', delete_id)
    await supabase.from('webauthn_challenges').delete().eq('user_id', delete_id)

    // Delete the duplicate user
    const { error: delErr } = await supabase
      .from('users')
      .delete()
      .eq('id', delete_id)

    if (delErr) {
      if (delErr.code === '23503') {
        console.error('POST /api/admin/users/merge FK violation:', delErr.message, delErr.details)
        return NextResponse.json(
          { error: 'התפקידים הועברו, אך לא ניתן היה למחוק את המשתמש המקורי (רשומות מקושרות)', detail: delErr.details || delErr.message },
          { status: 409 }
        )
      }
      throw delErr
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('POST /api/admin/users/merge error:', err)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
