import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - Get referral history for a call center's operators
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const callCenterId = searchParams.get('call_center_id')
    const operatorId = searchParams.get('operator_id') // Optional: filter by specific operator

    if (!callCenterId) {
      return NextResponse.json({ error: 'חסר מזהה מוקד' }, { status: 400 })
    }

    // Get operators for this call center
    const { data: operators } = await supabase
      .from('operators')
      .select('id, full_name')
      .eq('call_center_id', callCenterId)

    if (!operators || operators.length === 0) {
      return NextResponse.json({ history: [] })
    }

    // Build the referred_by pattern for operators
    const operatorIds = operatorId
      ? [operatorId]
      : operators.map(op => op.id)

    const patterns = operatorIds.map(id => `operator_${id}`)

    // Get signed forms with referred_by matching our operators
    let query = supabase
      .from('signed_forms')
      .select(`
        id,
        created_at,
        referred_by,
        wheel_stations (
          name
        )
      `)
      .not('referred_by', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100)

    // Filter by operator patterns
    if (patterns.length === 1) {
      query = query.eq('referred_by', patterns[0])
    } else {
      query = query.in('referred_by', patterns)
    }

    const { data: forms, error } = await query

    if (error) {
      console.error('Error fetching history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with operator names
    const history = (forms || []).map(form => {
      const refParts = form.referred_by?.split('_')
      const refOperatorId = refParts?.[1]
      const operator = operators.find(op => op.id === refOperatorId)

      return {
        id: form.id,
        created_at: form.created_at,
        operator_name: operator?.full_name || 'לא ידוע',
        operator_id: refOperatorId,
        station_name: (form.wheel_stations as { name: string } | null)?.name || 'לא ידוע'
      }
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
