import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List all call centers with their managers
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: callCenters, error } = await supabase
      .from('call_centers')
      .select(`
        *,
        call_center_managers (
          id,
          full_name,
          title,
          phone,
          is_primary,
          is_active,
          created_at
        ),
        operators (
          id,
          full_name,
          phone,
          is_active,
          created_at
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching call centers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ callCenters: callCenters || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// POST - Create a new call center with primary manager
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { name, manager_name, manager_phone, manager_password } = body

    if (!name) {
      return NextResponse.json({ error: 'שם המוקד הוא שדה חובה' }, { status: 400 })
    }

    if (!manager_name || !manager_phone || !manager_password) {
      return NextResponse.json({
        error: 'יש להזין פרטי מנהל ראשי: שם, טלפון וסיסמה'
      }, { status: 400 })
    }

    // Check if phone already exists
    const { data: existingManager } = await supabase
      .from('call_center_managers')
      .select('id')
      .eq('phone', manager_phone)
      .single()

    if (existingManager) {
      return NextResponse.json({
        error: 'מספר הטלפון כבר קיים במערכת'
      }, { status: 400 })
    }

    // Create call center
    const { data: callCenter, error: centerError } = await supabase
      .from('call_centers')
      .insert({ name })
      .select()
      .single()

    if (centerError) {
      console.error('Error creating call center:', centerError)
      return NextResponse.json({ error: centerError.message }, { status: 500 })
    }

    // Create primary manager
    const { error: managerError } = await supabase
      .from('call_center_managers')
      .insert({
        call_center_id: callCenter.id,
        full_name: manager_name,
        phone: manager_phone,
        password: manager_password,
        title: 'מנהל מוקד',
        is_primary: true,
        is_active: true
      })

    if (managerError) {
      // Rollback - delete the call center
      await supabase.from('call_centers').delete().eq('id', callCenter.id)
      console.error('Error creating manager:', managerError)
      return NextResponse.json({ error: managerError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      callCenter,
      message: 'המוקד נוצר בהצלחה עם מנהל ראשי'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
