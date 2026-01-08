/**
 * Backup vehicle_models API endpoint
 * GET /api/admin/backup-vehicle-models
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    if (adminKey !== process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all records
    const { data, error, count } = await supabase
      .from('vehicle_models')
      .select('*', { count: 'exact' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Summary
    const makes = [...new Set((data || []).map(d => d.make))].length
    const withCenterBore = (data || []).filter(d => d.center_bore).length
    const withRimSizes = (data || []).filter(d => d.rim_sizes_allowed?.length > 0).length

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      summary: {
        totalRecords: data?.length || 0,
        uniqueMakes: makes,
        withCenterBore,
        withRimSizes
      },
      data
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
