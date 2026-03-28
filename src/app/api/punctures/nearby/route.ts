/**
 * Puncture Shops Nearby API
 * GET /api/punctures/nearby?lat=...&lng=...
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

  // 1. Get distance-sorted IDs from PostGIS RPC
  const { data: nearby, error: rpcError } = await supabase.rpc('punctures_nearby', {
    user_lat: lat,
    user_lng: lng,
    radius_km: 50,
  })

  if (rpcError) {
    console.error('Error fetching nearby punctures:', rpcError)
    return NextResponse.json({ error: 'Failed to fetch nearby punctures' }, { status: 500 })
  }

  if (!nearby || nearby.length === 0) return NextResponse.json([])

  // 2. Fetch full shop data for those IDs
  const ids = nearby.map((n: { id: string }) => n.id)
  const { data: shops, error: shopsError } = await supabase
    .from('punctures')
    .select(`
      id, name, address, city, phone, hours,
      hours_regular, hours_evening, hours_friday, hours_saturday,
      lat, lng, notes, website, google_maps_url, google_rating
    `)
    .in('id', ids)

  if (shopsError || !shops) {
    return NextResponse.json({ error: 'Failed to fetch shop details' }, { status: 500 })
  }

  // 3. Fetch contacts
  const { data: contacts } = await supabase
    .from('puncture_contacts')
    .select('id, puncture_id, name, phone, has_whatsapp, sort_order')
    .in('puncture_id', ids)
    .order('sort_order')

  const contactsByShop = new Map<string, typeof contacts>()
  for (const c of contacts ?? []) {
    if (!contactsByShop.has(c.puncture_id)) contactsByShop.set(c.puncture_id, [])
    contactsByShop.get(c.puncture_id)!.push(c)
  }

  // 4. Merge distance + contacts, preserve RPC sort order
  const distanceMap = new Map(
    nearby.map((n: { id: string; distance_km: number }) => [n.id, n.distance_km])
  )

  const result = ids
    .map((id: string) => {
      const shop = shops.find((s) => s.id === id)
      if (!shop) return null
      return {
        ...shop,
        puncture_contacts: contactsByShop.get(id) ?? [],
        distance_km: distanceMap.get(id),
      }
    })
    .filter(Boolean)

  return NextResponse.json(result)
}
