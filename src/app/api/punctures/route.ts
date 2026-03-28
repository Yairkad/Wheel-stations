/**
 * Puncture Shops API
 * GET /api/punctures?q=searchterm
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  // 1. Fetch shops
  let shopsQuery = supabase
    .from('punctures')
    .select(`
      id, name, address, city, phone, hours,
      hours_regular, hours_evening, hours_friday, hours_saturday,
      lat, lng, notes, website, google_maps_url, google_rating
    `)
    .eq('is_active', true)
    .order('name')

  if (q) {
    shopsQuery = shopsQuery.or(`name.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%`)
  }

  const { data: shops, error: shopsError } = await shopsQuery

  if (shopsError) {
    console.error('Error fetching punctures:', shopsError)
    return NextResponse.json({ error: 'Failed to fetch punctures' }, { status: 500 })
  }

  if (!shops || shops.length === 0) return NextResponse.json([])

  // 2. Fetch all contacts for these shops in one query
  const ids = shops.map((s) => s.id)
  const { data: contacts } = await supabase
    .from('puncture_contacts')
    .select('id, puncture_id, name, phone, has_whatsapp, sort_order')
    .in('puncture_id', ids)
    .order('sort_order')

  // 3. Merge contacts into shops
  const contactsByShop = new Map<string, typeof contacts>()
  for (const c of contacts ?? []) {
    if (!contactsByShop.has(c.puncture_id)) contactsByShop.set(c.puncture_id, [])
    contactsByShop.get(c.puncture_id)!.push(c)
  }

  const result = shops.map((shop) => ({
    ...shop,
    puncture_contacts: contactsByShop.get(shop.id) ?? [],
  }))

  return NextResponse.json(result)
}
