import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST - Unified authentication for call-center managers and operators
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`auth:${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'יותר מדי ניסיונות. נסה שוב בעוד דקה.' },
        { status: 429 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const phone = body.phone?.trim()
    const password = body.password?.trim()

    if (!phone || !password) {
      return NextResponse.json({ error: 'יש להזין טלפון וסיסמה' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, password, is_active')
      .eq('phone', cleanPhone)
      .single()

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'מספר טלפון לא נמצא' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 })
    }

    // Check for call_center_manager role
    const { data: managerRole } = await supabase
      .from('user_roles')
      .select('id, is_primary, title, call_center_id, call_centers(id, name, is_active)')
      .eq('user_id', user.id)
      .eq('role', 'call_center_manager')
      .eq('is_active', true)
      .single()

    if (managerRole) {
      const cc = Array.isArray(managerRole.call_centers) ? managerRole.call_centers[0] : managerRole.call_centers as { id: string; name: string; is_active: boolean } | null
      if (!cc?.is_active) {
        return NextResponse.json({ error: 'המוקד אינו פעיל' }, { status: 401 })
      }
      return NextResponse.json({
        success: true,
        role: 'manager',
        user: {
          id: user.id,
          full_name: user.full_name,
          title: managerRole.title,
          phone: user.phone,
          is_primary: managerRole.is_primary
        },
        call_center_id: managerRole.call_center_id,
        call_center_name: cc.name
      })
    }

    // Check for operator role
    const { data: operatorRole } = await supabase
      .from('user_roles')
      .select('id, call_center_id, call_centers(id, name, is_active)')
      .eq('user_id', user.id)
      .eq('role', 'operator')
      .eq('is_active', true)
      .single()

    if (operatorRole) {
      const cc = Array.isArray(operatorRole.call_centers) ? operatorRole.call_centers[0] : operatorRole.call_centers as { id: string; name: string; is_active: boolean } | null
      if (!cc?.is_active) {
        return NextResponse.json({ error: 'המוקד אינו פעיל' }, { status: 401 })
      }
      return NextResponse.json({
        success: true,
        role: 'operator',
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone
        },
        call_center_id: operatorRole.call_center_id,
        call_center_name: cc.name
      })
    }

    return NextResponse.json({ error: 'אין הרשאת מוקד למשתמש זה' }, { status: 401 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
