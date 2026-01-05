import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Generate a random 4-digit code
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// GET - List operators for a call center
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const callCenterId = searchParams.get('call_center_id')

    if (!callCenterId) {
      return NextResponse.json({ error: 'חסר מזהה מוקד' }, { status: 400 })
    }

    const { data: operators, error } = await supabase
      .from('operators')
      .select('*')
      .eq('call_center_id', callCenterId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching operators:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ operators: operators || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// POST - Create a new operator
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { call_center_id, full_name, phone } = body

    if (!call_center_id || !full_name || !phone) {
      return NextResponse.json({
        error: 'יש למלא את כל השדות: שם מלא וטלפון'
      }, { status: 400 })
    }

    // Check if phone already exists
    const { data: existingOperator } = await supabase
      .from('operators')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingOperator) {
      return NextResponse.json({
        error: 'מספר הטלפון כבר קיים במערכת'
      }, { status: 400 })
    }

    // Generate random code
    const code = generateCode()

    const { data: operator, error } = await supabase
      .from('operators')
      .insert({
        call_center_id,
        full_name,
        phone,
        code,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating operator:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      operator,
      message: 'המוקדן נוסף בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
