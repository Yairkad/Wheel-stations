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

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (!(await verifyPunctureAccess(body))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { admin_password, pm_phone, pm_password, ...fields } = body
  void admin_password; void pm_phone; void pm_password

  if (!fields.name || !fields.lat || !fields.lng)
    return NextResponse.json({ error: 'נדרש שם, lat ו-lng' }, { status: 400 })

  const { data, error } = await supabase
    .from('punctures')
    .insert({ ...fields, is_active: true })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
