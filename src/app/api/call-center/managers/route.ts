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

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('id, is_primary, title, created_at, users(id, full_name, phone, is_active)')
      .eq('call_center_id', callCenterId)
      .eq('role', 'call_center_manager')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching managers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const managers = (roles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
      return {
        id: u?.id,
        full_name: u?.full_name,
        title: r.title,
        phone: u?.phone,
        is_primary: r.is_primary || false,
        is_active: u?.is_active ?? true,
        created_at: r.created_at,
      }
    })

    return NextResponse.json({ managers })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// POST - Create a new manager
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

    const cleanPhone = phone.replace(/\D/g, '')

    // Check if phone already has a manager role for this call center
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
        .eq('role', 'call_center_manager')
        .eq('call_center_id', call_center_id)
        .eq('is_active', true)
        .single()

      if (existingRole) {
        return NextResponse.json({ error: 'מספר הטלפון כבר קיים במערכת' }, { status: 400 })
      }

      // Update user info and add role
      const { error: userUpdErr } = await supabase.from('users').update({ full_name, password: password?.trim() }).eq('id', existingUser.id)
      if (userUpdErr) return NextResponse.json({ error: userUpdErr.message }, { status: 500 })

      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: existingUser.id,
        role: 'call_center_manager',
        call_center_id,
        title: title || 'מנהל מוקד',
        is_primary: false,
        is_active: true,
      })

      if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

      return NextResponse.json({
        success: true,
        manager: { id: existingUser.id, full_name, title: title || 'מנהל מוקד', phone: cleanPhone, is_primary: false, is_active: true },
        message: 'המנהל נוסף בהצלחה'
      })
    }

    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ full_name, phone: cleanPhone, password: password?.trim() || null, is_active: true })
      .select('id')
      .single()

    if (userError || !newUser) {
      return NextResponse.json({ error: userError?.message || 'שגיאה ביצירת משתמש' }, { status: 500 })
    }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: newUser.id,
      role: 'call_center_manager',
      call_center_id,
      title: title || 'מנהל מוקד',
      is_primary: false,
      is_active: true,
    })

    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      manager: { id: newUser.id, full_name, title: title || 'מנהל מוקד', phone: cleanPhone, is_primary: false, is_active: true },
      message: 'המנהל נוסף בהצלחה'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
