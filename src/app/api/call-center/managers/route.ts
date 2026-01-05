import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List managers for a call center
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const callCenterId = searchParams.get('call_center_id')

    if (!callCenterId) {
      return NextResponse.json({ error: 'חסר מזהה מוקד' }, { status: 400 })
    }

    const { data: managers, error } = await supabase
      .from('call_center_managers')
      .select('id, full_name, title, phone, is_primary, is_active, created_at')
      .eq('call_center_id', callCenterId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching managers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ managers: managers || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// POST - Create a new manager (only primary manager can do this)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { call_center_id, full_name, phone, password, title } = body

    if (!call_center_id || !full_name || !phone || !password) {
      return NextResponse.json({
        error: 'יש למלא את כל השדות: שם, טלפון וסיסמה'
      }, { status: 400 })
    }

    // Check if phone already exists
    const { data: existingManager } = await supabase
      .from('call_center_managers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingManager) {
      return NextResponse.json({
        error: 'מספר הטלפון כבר קיים במערכת'
      }, { status: 400 })
    }

    const { data: manager, error } = await supabase
      .from('call_center_managers')
      .insert({
        call_center_id,
        full_name,
        phone,
        password,
        title: title || 'מנהל מוקד',
        is_primary: false, // Only admin can create primary manager
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating manager:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      manager: {
        id: manager.id,
        full_name: manager.full_name,
        title: manager.title,
        phone: manager.phone,
        is_primary: manager.is_primary,
        is_active: manager.is_active
      },
      message: 'המנהל נוסף בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
