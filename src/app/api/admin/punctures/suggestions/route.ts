import { NextRequest, NextResponse } from 'next/server'
import { verifyPunctureAccess, supabase } from '../_auth'

export async function GET(request: NextRequest) {
  const body = Object.fromEntries(request.nextUrl.searchParams)
  if (!(await verifyPunctureAccess(body, request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status') ?? 'pending'
  const query = supabase
    .from('puncture_suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  const { data, error } = status === 'all' ? await query : await query.eq('status', status)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
