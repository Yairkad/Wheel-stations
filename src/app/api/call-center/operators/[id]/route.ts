import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// DELETE - Remove an operator's role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // id is user id — deactivate their operator role
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', id)
      .eq('role', 'operator')

    if (error) {
      console.error('Error deleting operator:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'המוקדן נמחק בהצלחה' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// PUT - Update an operator
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { is_active, regenerate_code, full_name, custom_code } = body
    const phone = body.phone?.trim()

    if (custom_code !== undefined && custom_code !== '' && custom_code.trim().length < 4) {
      return NextResponse.json({ error: 'קוד מוקדן חייב להכיל לפחות 4 תווים' }, { status: 400 })
    }

    // Update user fields
    const userUpdate: Record<string, unknown> = {}
    if (is_active !== undefined) userUpdate.is_active = is_active
    if (full_name !== undefined) userUpdate.full_name = full_name
    if (phone !== undefined) userUpdate.phone = phone.replace(/\D/g, '')

    if (Object.keys(userUpdate).length > 0) {
      const { error: uErr } = await supabase.from('users').update(userUpdate).eq('id', id)
      if (uErr) throw uErr
    }

    // Update operator code: custom code takes priority, otherwise regenerate if requested
    let newCode: string | undefined
    if (custom_code !== undefined && custom_code.trim() !== '') {
      newCode = custom_code.trim()
    } else if (regenerate_code) {
      newCode = generateCode()
    }

    if (newCode) {
      const { error: cErr } = await supabase
        .from('user_roles')
        .update({ operator_code: newCode })
        .eq('user_id', id)
        .eq('role', 'operator')
      if (cErr) throw cErr
      const { error: pErr } = await supabase.from('users').update({ password: newCode }).eq('id', id)
      if (pErr) throw pErr
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, is_active')
      .eq('id', id)
      .single()

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('operator_code')
      .eq('user_id', id)
      .eq('role', 'operator')
      .single()

    return NextResponse.json({
      success: true,
      operator: {
        id: user?.id,
        full_name: user?.full_name,
        phone: user?.phone,
        code: roleRow?.operator_code,
        is_active: user?.is_active,
      },
      message: regenerate_code ? 'קוד חדש נוצר' : 'המוקדן עודכן'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
