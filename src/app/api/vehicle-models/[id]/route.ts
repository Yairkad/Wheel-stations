import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ id: string }>
}

// DELETE - Delete a vehicle model (managers only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
    }

    // Delete the model
    const { error } = await supabase
      .from('vehicle_models')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting vehicle model:', error)
      return NextResponse.json({ error: 'Failed to delete vehicle model' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/vehicle-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a vehicle model
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      make, make_he, model, variants,
      year_from, year_to,
      bolt_count, bolt_spacing, center_bore,
      rim_size, rim_sizes_allowed, tire_size_front, source_url
    } = body

    if (!make || !model || !bolt_count || !bolt_spacing) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .update({
        make, make_he: make_he || null,
        model, variants: variants || null,
        year_from: year_from || null, year_to: year_to || null,
        bolt_count, bolt_spacing,
        center_bore: center_bore || null,
        rim_size: rim_size || null,
        rim_sizes_allowed: rim_sizes_allowed || null,
        tire_size_front: tire_size_front || null,
        source_url: source_url || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating vehicle model:', error)
      return NextResponse.json({ error: 'Failed to update vehicle model' }, { status: 500 })
    }

    return NextResponse.json({ model: data })
  } catch (error) {
    console.error('Error in PUT /api/vehicle-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get a specific vehicle model by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching vehicle model:', error)
      return NextResponse.json({ error: 'Failed to fetch vehicle model' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Vehicle model not found' }, { status: 404 })
    }

    return NextResponse.json({ model: data })
  } catch (error) {
    console.error('Error in GET /api/vehicle-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
