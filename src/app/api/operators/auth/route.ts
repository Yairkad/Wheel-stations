import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST - Authenticate operator
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json({
        error: 'יש להזין טלפון וקוד'
      }, { status: 400 })
    }

    // Find operator by phone
    const { data: operator, error } = await supabase
      .from('operators')
      .select(`
        id,
        full_name,
        phone,
        code,
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

    if (error || !operator) {
      return NextResponse.json({
        error: 'מספר טלפון לא נמצא'
      }, { status: 401 })
    }

    if (!operator.is_active) {
      return NextResponse.json({
        error: 'החשבון אינו פעיל'
      }, { status: 401 })
    }

    // Check code
    if (operator.code !== code) {
      return NextResponse.json({
        error: 'קוד שגוי'
      }, { status: 401 })
    }

    // Check if call center is active
    const callCenter = operator.call_centers as { id: string; name: string; is_active: boolean }
    if (!callCenter?.is_active) {
      return NextResponse.json({
        error: 'המוקד אינו פעיל'
      }, { status: 401 })
    }

    // Return operator info (without code)
    return NextResponse.json({
      success: true,
      operator: {
        id: operator.id,
        full_name: operator.full_name,
        phone: operator.phone,
        call_center_id: operator.call_center_id,
        call_center_name: callCenter.name
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
