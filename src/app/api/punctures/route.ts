/**
 * Puncture Shops API
 * GET /api/punctures?q=searchterm — list all active shops, optional free-text filter
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  let query = supabase
    .from('punctures')
    .select('id, name, address, phone, hours, lat, lng, notes')
    .eq('is_active', true)
    .order('name')

  if (q) {
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching punctures:', error)
    return NextResponse.json({ error: 'Failed to fetch punctures' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
