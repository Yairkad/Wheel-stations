import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST - Authenticate call center manager
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json({
        error: 'יש להזין טלפון וסיסמה'
      }, { status: 400 })
    }

    // Find manager by phone
    const { data: manager, error } = await supabase
      .from('call_center_managers')
      .select(`
        id,
        full_name,
        title,
        phone,
        password,
        is_primary,
        is_active,
        call_center_id,
        call_centers (
          id,
          name,
          is_active
        )
      `)
      .eq('phone', phone)
      .single()

    if (error || !manager) {
      return NextResponse.json({
        error: 'מספר טלפון לא נמצא'
      }, { status: 401 })
    }

    if (!manager.is_active) {
      return NextResponse.json({
        error: 'החשבון אינו פעיל'
      }, { status: 401 })
    }

    // Check password
    if (manager.password !== password) {
      return NextResponse.json({
        error: 'סיסמה שגויה'
      }, { status: 401 })
    }

    // Check if call center is active
    const callCenter = manager.call_centers as { id: string; name: string; is_active: boolean }
    if (!callCenter?.is_active) {
      return NextResponse.json({
        error: 'המוקד אינו פעיל'
      }, { status: 401 })
    }

    // Return manager info (without password)
    return NextResponse.json({
      success: true,
      manager: {
        id: manager.id,
        full_name: manager.full_name,
        title: manager.title,
        phone: manager.phone,
        is_primary: manager.is_primary,
        call_center_id: manager.call_center_id,
        call_center_name: callCenter.name
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
