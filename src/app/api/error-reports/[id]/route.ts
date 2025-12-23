import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PUT - Update error report status (for admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    const updateData: Record<string, any> = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes

    const { data, error } = await supabase
      .from('error_reports')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if update actually happened (RLS might block it silently)
    if (!data || data.length === 0) {
      console.error('Update returned no data - RLS might be blocking')
      return NextResponse.json({ error: 'עדכון נכשל - ייתכן שאין הרשאה לעדכן' }, { status: 403 })
    }

    return NextResponse.json({ success: true, report: data?.[0] })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete error report (for admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase
      .from('error_reports')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
