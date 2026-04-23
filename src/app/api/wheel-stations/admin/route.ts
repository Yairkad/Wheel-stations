/**
 * Wheel Stations Admin API (password protected)
 * GET /api/wheel-stations/admin - List all stations with full details
 * POST /api/wheel-stations/admin - Create a new station
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List all stations with full details (no auth needed for listing)
export async function GET() {
  try {
    const { data: stations, error } = await supabase
      .from('wheel_stations')
      .select(`
        id,
        name,
        address,
        city_id,
        district,
        is_active,
        max_managers,
        cities (name),
        wheels (
          id,
          is_available,
          deleted_at
        )
      `)
      .order('name')

    if (error) {
      console.error('Error fetching wheel stations:', error)
      return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
    }

    // For each station, fetch its managers from user_roles + users
    const stationIds = (stations || []).map(s => s.id)
    const roleRows = stationIds.length > 0
      ? (await supabase
          .from('user_roles')
          .select('station_id, is_primary, title, users(id, full_name, phone, password)')
          .eq('role', 'station_manager')
          .eq('is_active', true)
          .in('station_id', stationIds)
        ).data
      : []

    // Group managers by station_id
    const managersByStation: Record<string, { id: string; full_name: string; phone: string; role: string; is_primary: boolean; password: string | null }[]> = {}
    for (const r of (roleRows || [])) {
      const sid = r.station_id as string
      if (!managersByStation[sid]) managersByStation[sid] = []
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; password: string | null } | null
      if (u) {
        managersByStation[sid].push({
          id: u.id,
          full_name: u.full_name,
          phone: u.phone,
          role: (r.title as string) || 'מנהל תחנה',
          is_primary: (r.is_primary as boolean) || false,
          password: u.password,
        })
      }
    }

    // Calculate wheel stats and attach managers
    const stationsWithStats = stations?.map(station => {
      const activeWheels = (station.wheels || []).filter((w: { deleted_at: string | null }) => !w.deleted_at)
      return {
        ...station,
        wheel_station_managers: managersByStation[station.id] || [],
        totalWheels: activeWheels.length,
        availableWheels: activeWheels.filter((w: { is_available: boolean }) => w.is_available).length,
        wheels: undefined
      }
    })

    return NextResponse.json({ stations: stationsWithStats })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new station (password protected)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, city_id, district, managers } = body

    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    if (!name) {
      return NextResponse.json({ error: 'שם תחנה הוא שדה חובה' }, { status: 400 })
    }

    const stationData: { name: string; address?: string; city_id?: string; district?: string; is_active: boolean } = {
      name,
      is_active: true
    }
    if (address) stationData.address = address
    if (city_id) stationData.city_id = city_id
    if (district) stationData.district = district

    const { data: station, error: stationError } = await supabase
      .from('wheel_stations')
      .insert(stationData)
      .select()
      .single()

    if (stationError) {
      console.error('Error creating station:', stationError)
      return NextResponse.json({ error: 'שגיאה ביצירת תחנה' }, { status: 500 })
    }

    // Add managers to unified tables if provided
    if (managers && managers.length > 0) {
      for (const m of managers as { full_name: string; phone: string; role?: string; is_primary?: boolean; password?: string }[]) {
        const cleanPhone = m.phone.replace(/\D/g, '')

        // Upsert user
        let userId: string | null = null
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('phone', cleanPhone)
          .single()

        if (existingUser) {
          userId = existingUser.id
        } else {
          const { data: newUser } = await supabase
            .from('users')
            .insert({ full_name: m.full_name, phone: cleanPhone, password: m.password || null, is_active: true })
            .select('id')
            .single()
          userId = newUser?.id || null
        }

        if (userId) {
          const { error: rErr } = await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'station_manager',
            station_id: station.id,
            title: m.role || 'מנהל תחנה',
            is_primary: m.is_primary || false,
            is_active: true,
          })
          if (rErr) throw rErr
        }
      }
    }

    return NextResponse.json({ station }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations/admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
