/**
 * Puncture Shops Nearby API
 * GET /api/punctures/nearby?lat=...&lng=... — sorted by distance via PostGIS RPC
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') ?? '')
  const lng = parseFloat(request.nextUrl.searchParams.get('lng') ?? '')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('punctures_nearby', {
    user_lat: lat,
    user_lng: lng,
    radius_km: 50,
  })

  if (error) {
    console.error('Error fetching nearby punctures:', error)
    return NextResponse.json({ error: 'Failed to fetch nearby punctures' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
