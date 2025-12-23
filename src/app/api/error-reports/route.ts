import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Get all error reports (for admin)
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('error_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports: data || [] })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Submit new error report
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    const {
      vehicle_model_id,
      make,
      model,
      year_from,
      image_url,
      correct_bolt_count,
      correct_bolt_spacing,
      correct_center_bore,
      correct_rim_size,
      correct_tire_size,
      notes
    } = body

    const { data, error } = await supabase
      .from('error_reports')
      .insert([{
        vehicle_model_id: vehicle_model_id || null,
        make: make || null,
        model: model || null,
        year_from: year_from || null,
        image_url: image_url || null,
        correct_bolt_count: correct_bolt_count || null,
        correct_bolt_spacing: correct_bolt_spacing || null,
        correct_center_bore: correct_center_bore || null,
        correct_rim_size: correct_rim_size || null,
        correct_tire_size: correct_tire_size || null,
        notes: notes || null,
        status: 'pending'
      }])
      .select()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, report: data?.[0] })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
