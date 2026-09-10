/**
 * Public status check for a prefilled (wheel+phone) sign-form link.
 * GET /api/wheel-stations/[stationId]/public-borrow/status?wheel=<wheel_number>&phone=<phone>
 *
 * Lets the sign form detect that a link has already been used, so re-opening it (e.g. from
 * WhatsApp, after already signing) shows "already submitted" instead of the empty form.
 * Public, no auth — mirrors the existing public POST endpoint's access level.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const wheelNumber = request.nextUrl.searchParams.get('wheel')
    const phone = request.nextUrl.searchParams.get('phone')

    if (!wheelNumber || !phone) {
      return NextResponse.json({ status: 'not_submitted' })
    }

    const { data: wheel } = await supabase
      .from('wheels')
      .select('id')
      .eq('station_id', stationId)
      .eq('wheel_number', wheelNumber)
      .maybeSingle()

    if (!wheel) {
      return NextResponse.json({ status: 'not_submitted' })
    }

    // 'pending'/'borrowed' means this exact request is still open — a completed cycle
    // ('returned') or a declined one ('rejected') should allow a fresh submission again.
    const { data: borrow } = await supabase
      .from('wheel_borrows')
      .select('status, borrower_name')
      .eq('wheel_id', wheel.id)
      .eq('borrower_phone', phone)
      .in('status', ['pending', 'borrowed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!borrow) {
      return NextResponse.json({ status: 'not_submitted' })
    }

    return NextResponse.json({ status: borrow.status, borrower_name: borrow.borrower_name })
  } catch (error) {
    console.error('Error in GET public-borrow/status:', error)
    return NextResponse.json({ status: 'not_submitted' })
  }
}
