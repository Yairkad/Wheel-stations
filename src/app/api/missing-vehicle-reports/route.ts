import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Get all missing vehicle reports (for admin)
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('missing_vehicle_reports')
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

// POST - Submit new missing vehicle report
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    const { plate_number, notes } = body

    if (!plate_number) {
      return NextResponse.json({ error: 'חסר מספר רכב' }, { status: 400 })
    }

    // Check if this plate was already reported
    const { data: existing } = await supabase
      .from('missing_vehicle_reports')
      .select('id')
      .eq('plate_number', plate_number)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'הדיווח כבר קיים במערכת',
        already_reported: true
      })
    }

    const { data, error } = await supabase
      .from('missing_vehicle_reports')
      .insert([{
        plate_number,
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
