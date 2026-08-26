import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List all manually-trusted vehicle/wheel matches
export async function GET(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('trusted_vehicle_wheel_matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trusted matches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matches: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// POST - Add a new manually-trusted vehicle/wheel match
export async function POST(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const {
      vehicle_make,
      vehicle_model,
      year_from,
      year_to,
      wheel_rim_size,
      wheel_bolt_count,
      wheel_bolt_spacing,
      wheel_center_bore,
      notes,
      created_by,
    } = body

    if (!vehicle_make || !vehicle_model || !wheel_rim_size || !wheel_bolt_count || !wheel_bolt_spacing) {
      return NextResponse.json({ error: 'נא למלא יצרן, דגם וכל שדות מפרט הגלגל' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('trusted_vehicle_wheel_matches')
      .insert({
        vehicle_make: String(vehicle_make).trim(),
        vehicle_model: String(vehicle_model).trim(),
        year_from: year_from ? parseInt(year_from) : null,
        year_to: year_to ? parseInt(year_to) : null,
        wheel_rim_size: String(wheel_rim_size).trim(),
        wheel_bolt_count: parseInt(wheel_bolt_count),
        wheel_bolt_spacing: parseFloat(wheel_bolt_spacing),
        wheel_center_bore: wheel_center_bore ? parseFloat(wheel_center_bore) : null,
        notes: notes || null,
        created_by: created_by || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trusted match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, match: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
