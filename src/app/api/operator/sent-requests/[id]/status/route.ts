import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - One-time status check for a single sent-link (not live/polling — called
// only when the operator clicks "בדוק סטטוס" for that row).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase
    .from('wheel_borrows')
    .select('status, borrower_name')
    .eq('operator_send_request_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error checking sent-request status:', error)
    return NextResponse.json({ error: 'שגיאה בבדיקת הסטטוס' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ status: 'not_submitted' })
  }

  return NextResponse.json({ status: data.status, borrower_name: data.borrower_name })
}
