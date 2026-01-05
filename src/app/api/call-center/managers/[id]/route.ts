import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// DELETE - Delete a manager (only primary can delete others)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a primary manager
    const { data: manager } = await supabase
      .from('call_center_managers')
      .select('is_primary')
      .eq('id', id)
      .single()

    if (manager?.is_primary) {
      return NextResponse.json({
        error: 'לא ניתן למחוק מנהל ראשי'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('call_center_managers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting manager:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'המנהל נמחק בהצלחה'
    })
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

    const { is_active, full_name, title, password } = body

    const updateData: Record<string, unknown> = {}
    if (is_active !== undefined) updateData.is_active = is_active
    if (full_name !== undefined) updateData.full_name = full_name
    if (title !== undefined) updateData.title = title
    if (password !== undefined) updateData.password = password

    const { data, error } = await supabase
      .from('call_center_managers')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, title, phone, is_primary, is_active')
      .single()

    if (error) {
      console.error('Error updating manager:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      manager: data,
      message: 'המנהל עודכן בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
