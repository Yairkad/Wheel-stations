import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List all call centers with their managers and operators
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: callCenters, error } = await supabase
      .from('call_centers')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching call centers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch managers and operators from user_roles
    const ccIds = (callCenters || []).map(c => c.id)

    const { data: managerRoles } = await supabase
      .from('user_roles')
      .select('call_center_id, is_primary, title, created_at, users(id, full_name, phone, is_active)')
      .eq('role', 'call_center_manager')
      .eq('is_active', true)
      .in('call_center_id', ccIds)
      .order('is_primary', { ascending: false })

    const { data: operatorRoles } = await supabase
      .from('user_roles')
      .select('call_center_id, created_at, users(id, full_name, phone, is_active)')
      .eq('role', 'operator')
      .eq('is_active', true)
      .in('call_center_id', ccIds)
      .order('created_at', { ascending: false })

    // Group by call_center_id
    const managersByCC: Record<string, unknown[]> = {}
    const operatorsByCC: Record<string, unknown[]> = {}

    for (const r of (managerRoles || [])) {
      const ccid = r.call_center_id as string
      if (!managersByCC[ccid]) managersByCC[ccid] = []
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
      if (u) managersByCC[ccid].push({ id: u.id, full_name: u.full_name, title: r.title, phone: u.phone, is_primary: r.is_primary, is_active: u.is_active, created_at: r.created_at })
    }

    for (const r of (operatorRoles || [])) {
      const ccid = r.call_center_id as string
      if (!operatorsByCC[ccid]) operatorsByCC[ccid] = []
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
      if (u) operatorsByCC[ccid].push({ id: u.id, full_name: u.full_name, phone: u.phone, is_active: u.is_active, created_at: r.created_at })
    }

    const enriched = (callCenters || []).map(cc => ({
      ...cc,
      call_center_managers: managersByCC[cc.id] || [],
      operators: operatorsByCC[cc.id] || [],
    }))

    return NextResponse.json({ callCenters: enriched })
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
      return NextResponse.json({ error: 'יש להזין פרטי מנהל ראשי: שם, טלפון וסיסמה' }, { status: 400 })
    }

    const cleanPhone = manager_phone.replace(/\D/g, '')

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

    // Find or create user
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    if (existingUser) {
      const { error: uErr } = await supabase.from('users').update({ full_name: manager_name, password: manager_password }).eq('id', existingUser.id)
      if (uErr) { await supabase.from('call_centers').delete().eq('id', callCenter.id); return NextResponse.json({ error: uErr.message }, { status: 500 }) }
      userId = existingUser.id
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ full_name: manager_name, phone: cleanPhone, password: manager_password, is_active: true })
        .select('id')
        .single()

      if (userError || !newUser) {
        await supabase.from('call_centers').delete().eq('id', callCenter.id)
        return NextResponse.json({ error: userError?.message || 'שגיאה ביצירת מנהל' }, { status: 500 })
      }
      userId = newUser.id
    }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'call_center_manager',
      call_center_id: callCenter.id,
      title: 'מנהל מוקד',
      is_primary: true,
      is_active: true,
    })

    if (roleError) {
      await supabase.from('call_centers').delete().eq('id', callCenter.id)
      // If user was newly created (no existingUser), delete it too to avoid orphan
      if (!existingUser) await supabase.from('users').delete().eq('id', userId)
      console.error('Error creating manager role:', roleError)
      return NextResponse.json({ error: roleError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, callCenter, message: 'המוקד נוצר בהצלחה עם מנהל ראשי' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
