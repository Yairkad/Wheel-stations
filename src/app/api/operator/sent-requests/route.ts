import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST - Log a single "I sent this wheel's link" event, called once per prepared
// link (not once per copy/share button click). Returns the row id, which gets
// embedded in the link (?sr=<id>) so a later status check can find the exact
// borrow request (if any) that resulted from this specific send.
export async function POST(request: NextRequest) {
  try {
    const { operator_id, call_center_id, station_id, wheel_number } = await request.json()
    if (!operator_id || !station_id || !wheel_number) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase
      .from('operator_sent_requests')
      .insert({
        operator_id,
        call_center_id: call_center_id ?? null,
        station_id,
        wheel_number: String(wheel_number),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error logging sent request:', error)
      return NextResponse.json({ error: 'שגיאה בשמירת השליחה' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// GET ?operator_id=... - The operator's recent sent-link log (no status here —
// status is only fetched per-row, on demand, via the [id]/status route below).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const operatorId = searchParams.get('operator_id')
  if (!operatorId) {
    return NextResponse.json({ error: 'חסר operator_id' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase
    .from('operator_sent_requests')
    .select('id, wheel_number, created_at, wheel_stations(name)')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching sent requests:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const sentRequests = (data || []).map(r => ({
    id: r.id,
    wheel_number: r.wheel_number,
    created_at: r.created_at,
    station_name: (r.wheel_stations as unknown as { name: string } | null)?.name || 'לא ידוע',
  }))

  return NextResponse.json({ sentRequests })
}
