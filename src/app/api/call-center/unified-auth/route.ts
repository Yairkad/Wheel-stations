import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST - Unified authentication for managers and operators
// First tries to find a manager, then an operator
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute per IP
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

    const { phone, password } = body // password can be manager password or operator code

    if (!phone || !password) {
      return NextResponse.json({
        error: 'יש להזין טלפון וסיסמה'
      }, { status: 400 })
    }

    // First, try to find a manager with this phone
    const { data: manager } = await supabase
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

    if (manager) {
      // Found a manager - check password
      if (!manager.is_active) {
        return NextResponse.json({
          error: 'החשבון אינו פעיל'
        }, { status: 401 })
      }

      if (manager.password !== password) {
        return NextResponse.json({
          error: 'סיסמה שגויה'
        }, { status: 401 })
      }

      const callCenter = manager.call_centers as unknown as { id: string; name: string; is_active: boolean } | null
      if (!callCenter?.is_active) {
        return NextResponse.json({
          error: 'המוקד אינו פעיל'
        }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        role: 'manager',
        user: {
          id: manager.id,
          full_name: manager.full_name,
          title: manager.title,
          phone: manager.phone,
          is_primary: manager.is_primary
        },
        call_center_id: manager.call_center_id,
        call_center_name: callCenter.name
      })
    }

    // Not a manager - try to find an operator
    const { data: operator } = await supabase
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

    if (operator) {
      // Found an operator - check code
      if (!operator.is_active) {
        return NextResponse.json({
          error: 'החשבון אינו פעיל'
        }, { status: 401 })
      }

      if (operator.code !== password) {
        return NextResponse.json({
          error: 'קוד שגוי'
        }, { status: 401 })
      }

      const callCenter = operator.call_centers as unknown as { id: string; name: string; is_active: boolean } | null
      if (!callCenter?.is_active) {
        return NextResponse.json({
          error: 'המוקד אינו פעיל'
        }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        role: 'operator',
        user: {
          id: operator.id,
          full_name: operator.full_name,
          phone: operator.phone
        },
        call_center_id: operator.call_center_id,
        call_center_name: callCenter.name
      })
    }

    // Not found in either table
    return NextResponse.json({
      error: 'מספר טלפון לא נמצא'
    }, { status: 401 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
