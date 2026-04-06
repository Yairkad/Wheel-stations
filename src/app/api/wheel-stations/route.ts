/**
 * Wheel Stations API
 * GET /api/wheel-stations - List all active wheel stations
 * POST /api/wheel-stations - Create a new station (super admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List all active wheel stations (public access)
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
        cities (name),
        wheels (
          id,
          is_available,
          deleted_at
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching wheel stations:', error)
      return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
    }

    // Fetch managers from unified tables
    const stationIds = (stations || []).map(s => s.id)
    const managerRoles = stationIds.length > 0
      ? (await supabase
          .from('user_roles')
          .select('station_id, is_primary, title, users(id, full_name, phone)')
          .eq('role', 'station_manager')
          .eq('is_active', true)
          .in('station_id', stationIds)
        ).data
      : []

    const managersByStation: Record<string, unknown[]> = {}
    for (const r of (managerRoles || [])) {
      const sid = r.station_id as string
      if (!managersByStation[sid]) managersByStation[sid] = []
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string } | null
      if (u) managersByStation[sid].push({ id: u.id, full_name: u.full_name, phone: u.phone, role: (r.title as string) || 'מנהל תחנה', is_primary: (r.is_primary as boolean) || false })
    }

    // Calculate wheel stats for each station (exclude soft-deleted wheels)
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
    console.error('Error in GET /api/wheel-stations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new wheel station (super admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify super admin
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, city_id, district, managers } = body

    if (!name) {
      return NextResponse.json({ error: 'Station name is required' }, { status: 400 })
    }

    // Create station (personal passwords are now stored per manager, not per station)
    const stationData: { name: string; address?: string; city_id?: string; district?: string } = { name, address, city_id }
    if (district) {
      stationData.district = district
    }

    const { data: station, error: stationError } = await supabase
      .from('wheel_stations')
      .insert(stationData)
      .select()
      .single()

    if (stationError) {
      console.error('Error creating station:', stationError)
      return NextResponse.json({ error: 'Failed to create station' }, { status: 500 })
    }

    // Add managers if provided
    if (managers && managers.length > 0) {
      for (const m of managers as { full_name: string; phone: string; role?: string; is_primary?: boolean; password?: string }[]) {
        const cleanPhone = m.phone.replace(/\D/g, '')
        const { data: existingUser } = await supabase.from('users').select('id').eq('phone', cleanPhone).single()
        let userId: string
        if (existingUser) {
          userId = existingUser.id
        } else {
          const { data: newUser } = await supabase.from('users').insert({ full_name: m.full_name, phone: cleanPhone, password: m.password || null, is_active: true }).select('id').single()
          if (!newUser) continue
          userId = newUser.id
        }
        const { error: rErr } = await supabase.from('user_roles').insert({ user_id: userId, role: 'station_manager', station_id: station.id, title: m.role || 'מנהל תחנה', is_primary: m.is_primary || false, is_active: true })
        if (rErr) throw rErr
      }
    }

    return NextResponse.json({ station }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
