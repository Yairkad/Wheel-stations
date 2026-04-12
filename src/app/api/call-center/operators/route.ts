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

    let query = supabase
      .from('user_roles')
      .select('id, operator_code, created_at, users(id, full_name, phone, is_active)')
      .eq('role', 'operator')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (callCenterId) {
      query = query.eq('call_center_id', callCenterId)
    }

    const { data: roles, error } = await query

    if (error) {
      console.error('Error fetching operators:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const operators = (roles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
      return {
        id: u?.id,
        full_name: u?.full_name,
        phone: u?.phone,
        code: r.operator_code,
        is_active: u?.is_active ?? true,
        created_at: r.created_at,
      }
    })

    return NextResponse.json({ operators })
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

    const { call_center_id, full_name, custom_code } = body
    const phone = body.phone?.trim()

    if (!call_center_id || !full_name || !phone) {
      return NextResponse.json({ error: 'יש למלא את כל השדות: שם מלא וטלפון' }, { status: 400 })
    }

    if (custom_code && custom_code.trim().length < 4) {
      return NextResponse.json({ error: 'קוד מוקדן חייב להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const code = custom_code?.trim() || generateCode()

    // Check if phone already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    if (existingUser) {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('role', 'operator')
        .eq('call_center_id', call_center_id)
        .eq('is_active', true)
        .single()

      if (existingRole) {
        return NextResponse.json({ error: 'מספר הטלפון כבר קיים במערכת' }, { status: 400 })
      }

      const { error: roleErr } = await supabase.from('user_roles').insert({
        user_id: existingUser.id,
        role: 'operator',
        call_center_id,
        operator_code: code,
        is_active: true,
      })
      if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 })

      return NextResponse.json({
        success: true,
        operator: { id: existingUser.id, full_name, phone: cleanPhone, code, is_active: true },
        message: 'המוקדן נוסף בהצלחה'
      })
    }

    // Create new user (password = code for operators)
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ full_name, phone: cleanPhone, password: code, is_active: true })
      .select('id')
      .single()

    if (userError || !newUser) {
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: userError?.message || 'שגיאה ביצירת מוקדן' }, { status: 500 })
    }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: newUser.id,
      role: 'operator',
      call_center_id,
      operator_code: code,
      is_active: true,
    })

    if (roleError) {
      console.error('Error creating operator role:', roleError)
      return NextResponse.json({ error: roleError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      operator: { id: newUser.id, full_name, phone: cleanPhone, code, is_active: true },
      message: 'המוקדן נוסף בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
