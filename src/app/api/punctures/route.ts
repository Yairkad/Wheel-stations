/**
 * Puncture Shops API
 * GET /api/punctures?q=searchterm — list all active shops with contacts, optional free-text filter
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SELECT_FIELDS = `
  id, name, address, city, phone, hours,
  hours_regular, hours_evening, hours_friday, hours_saturday,
  lat, lng, notes, website, google_maps_url, google_rating,
  puncture_contacts (id, name, phone, has_whatsapp, sort_order)
`

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  let query = supabase
    .from('punctures')
    .select(SELECT_FIELDS)
    .eq('is_active', true)
    .order('name')
    .order('sort_order', { referencedTable: 'puncture_contacts' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching punctures:', error)
    return NextResponse.json({ error: 'Failed to fetch punctures' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
