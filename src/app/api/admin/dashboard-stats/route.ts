import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  if (!(await validateAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [users, stations, callCenters, punctures, vehicles, trustedMatches] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('wheel_stations').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('call_centers').select('id', { count: 'exact', head: true }),
    supabase.from('punctures').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vehicle_models').select('id', { count: 'exact', head: true }),
    supabase.from('trusted_vehicle_wheel_matches').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    users: users.count ?? 0,
    stations: stations.count ?? 0,
    callCenters: callCenters.count ?? 0,
    punctures: punctures.count ?? 0,
    vehicles: vehicles.count ?? 0,
    trustedMatches: trustedMatches.count ?? 0,
  })
}
