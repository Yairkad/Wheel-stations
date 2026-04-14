import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '@/lib/password'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// DELETE - Remove a manager's call_center_manager role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json().catch(() => ({}))
    const { call_center_id } = body

    let query = supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', id)
      .eq('role', 'call_center_manager')

    if (call_center_id) {
      query = query.eq('call_center_id', call_center_id)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting manager:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'המנהל נמחק בהצלחה' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// PUT - Update a manager
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { is_active, full_name, title, password, phone } = body

    // Update user fields
    const userUpdate: Record<string, unknown> = {}
    if (full_name !== undefined) userUpdate.full_name = full_name
    if (password !== undefined) userUpdate.password = await hashPassword(password)
    if (phone !== undefined) userUpdate.phone = phone.replace(/\D/g, '')
    if (is_active !== undefined) userUpdate.is_active = is_active

    if (Object.keys(userUpdate).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', id)

      if (userError) {
        console.error('Error updating user:', userError)
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }
    }

    // Update role fields
    if (title !== undefined) {
      await supabase
        .from('user_roles')
        .update({ title })
        .eq('user_id', id)
        .eq('role', 'call_center_manager')
    }

    // Fetch updated data
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, is_active')
      .eq('id', id)
      .single()

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('is_primary, title')
      .eq('user_id', id)
      .eq('role', 'call_center_manager')
      .single()

    return NextResponse.json({
      success: true,
      manager: {
        id: user?.id,
        full_name: user?.full_name,
        title: roleRow?.title,
        phone: user?.phone,
        is_primary: roleRow?.is_primary || false,
        is_active: user?.is_active ?? true,
      },
      message: 'המנהל עודכן בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
