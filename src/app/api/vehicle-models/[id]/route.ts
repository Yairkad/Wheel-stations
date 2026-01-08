import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// PUT - Update a vehicle model (only updates provided fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}

    if (body.make !== undefined) updateData.make = body.make?.trim().toLowerCase()
    if (body.make_he !== undefined) updateData.make_he = body.make_he?.trim() || null
    if (body.model !== undefined) updateData.model = body.model?.trim().toLowerCase()
    if (body.variants !== undefined) updateData.variants = body.variants?.trim() || null
    if (body.year_from !== undefined) updateData.year_from = body.year_from || null
    if (body.year_to !== undefined) updateData.year_to = body.year_to || null
    if (body.bolt_count !== undefined) updateData.bolt_count = body.bolt_count
    if (body.bolt_spacing !== undefined) updateData.bolt_spacing = body.bolt_spacing
    if (body.center_bore !== undefined) updateData.center_bore = body.center_bore || null
    if (body.rim_size !== undefined) updateData.rim_size = body.rim_size?.trim() || null
    if (body.rim_sizes_allowed !== undefined) updateData.rim_sizes_allowed = body.rim_sizes_allowed || null
    if (body.tire_size_front !== undefined) updateData.tire_size_front = body.tire_size_front?.trim() || null
    if (body.source_url !== undefined) updateData.source_url = body.source_url?.trim() || null

    const { data, error } = await supabase
      .from('vehicle_models')
      .update(updateData)
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
