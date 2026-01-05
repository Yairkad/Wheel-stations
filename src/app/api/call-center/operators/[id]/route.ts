import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Generate a random 4-digit code
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// DELETE - Delete an operator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('operators')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting operator:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'המוקדן נמחק בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// PUT - Update an operator (change code, toggle active)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { is_active, regenerate_code, full_name, phone } = body

    const updateData: Record<string, unknown> = {}
    if (is_active !== undefined) updateData.is_active = is_active
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone
    if (regenerate_code) updateData.code = generateCode()

    const { data, error } = await supabase
      .from('operators')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating operator:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      operator: data,
      message: regenerate_code ? 'קוד חדש נוצר' : 'המוקדן עודכן'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
