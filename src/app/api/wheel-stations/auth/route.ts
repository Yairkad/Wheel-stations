import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
      return NextResponse.json({ error: 'Missing phone or password' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, password, is_active')
      .eq('phone', cleanPhone)
      .single()

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'מספר טלפון לא נמצא במערכת' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 })
    }

    // Find their station_manager role
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id, station_id, is_primary, title, wheel_stations(id, name)')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('is_active', true)
      .single()

    if (roleRow) {
      const ws = Array.isArray(roleRow.wheel_stations) ? roleRow.wheel_stations[0] : roleRow.wheel_stations as { id: string; name: string } | null
      return NextResponse.json({
        success: true,
        manager: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          station_id: ws?.id,
          station_name: ws?.name,
          role: roleRow.title || 'מנהל תחנה',
          is_primary: roleRow.is_primary || false,
          type: 'wheel_station'
        }
      })
    }

    // Try city_managers (equipment cabinets) — still in old table
    const { data: cityManagers } = await supabase
      .from('city_managers')
      .select('*, cities(id, name, password)')
      .eq('phone', phone)
      .limit(1)

    if (cityManagers && cityManagers.length > 0) {
      const manager = cityManagers[0]
      const city = manager.cities

      if (city?.password !== password) {
        return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        manager: {
          id: manager.id,
          full_name: manager.full_name,
          phone: manager.phone,
          city_id: city.id,
          city_name: city.name,
          type: 'city'
        }
      })
    }

    return NextResponse.json({ error: 'מספר טלפון לא נמצא במערכת' }, { status: 401 })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
