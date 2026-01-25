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
