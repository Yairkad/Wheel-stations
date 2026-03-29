import { NextRequest, NextResponse } from 'next/server'
import { verifyPunctureAccess, supabase } from '../_auth'

export async function GET(request: NextRequest) {
  const body = Object.fromEntries(request.nextUrl.searchParams)
  if (!(await verifyPunctureAccess(body))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('punctures')
    .select('id, name, city, address, lat, lng, is_active, hours_regular, hours_evening, hours_friday, hours_saturday, hours, phone, notes, website, google_maps_url, google_rating')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
