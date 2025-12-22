import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PUT - Update a vehicle model
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    const {
      make,
      make_he,
      model,
      model_he,
      year_from,
      year_to,
      bolt_count,
      bolt_spacing,
      center_bore,
      rim_size,
      tire_size_front
    } = body

    const { data, error } = await supabase
      .from('vehicle_models')
      .update({
        make: make?.trim().toLowerCase(),
        make_he: make_he?.trim() || null,
        model: model?.trim().toLowerCase(),
        model_he: model_he?.trim() || null,
        year_from: year_from || null,
        year_to: year_to || null,
        bolt_count: bolt_count,
        bolt_spacing: bolt_spacing,
        center_bore: center_bore || null,
        rim_size: rim_size?.trim() || null,
        tire_size_front: tire_size_front?.trim() || null
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, vehicle: data?.[0] })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a vehicle model
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase
      .from('vehicle_models')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
