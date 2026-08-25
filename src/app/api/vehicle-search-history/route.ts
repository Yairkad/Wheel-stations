import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MAX_HISTORY_ITEMS = 30

// GET - Shared list, pinned rows first, then most recently searched.
export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase
    .from('vehicle_search_history')
    .select('id, plate, display_name, year, vehicle_result, pinned, searched_by, searched_at')
    .order('pinned', { ascending: false })
    .order('searched_at', { ascending: false })
    .limit(MAX_HISTORY_ITEMS)

  if (error) {
    console.error('Error fetching vehicle search history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ history: data || [] })
}

// POST - Record (or bump) a plate search. Upserts on the unique `plate` column —
// searching an already-known plate again just refreshes it instead of duplicating.
export async function POST(request: NextRequest) {
  try {
    const { plate, displayName, year, vehicleResult, searchedBy } = await request.json()
    if (!plate || !displayName || !vehicleResult) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase
      .from('vehicle_search_history')
      .upsert(
        {
          plate,
          display_name: displayName,
          year: year ?? null,
          vehicle_result: vehicleResult,
          searched_by: searchedBy ?? null,
          searched_at: new Date().toISOString(),
        },
        { onConflict: 'plate' }
      )
      .select('id, plate, display_name, year, vehicle_result, pinned, searched_by, searched_at')
      .single()

    if (error) {
      console.error('Error saving vehicle search history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// PATCH - Toggle (or explicitly set) pinned for one row.
export async function PATCH(request: NextRequest) {
  try {
    const { id, pinned } = await request.json()
    if (!id || typeof pinned !== 'boolean') {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase
      .from('vehicle_search_history')
      .update({ pinned })
      .eq('id', id)

    if (error) {
      console.error('Error updating vehicle search history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// DELETE ?id=... - Remove one row from the shared history.
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'חסר id' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { error } = await supabase.from('vehicle_search_history').delete().eq('id', id)

  if (error) {
    console.error('Error deleting vehicle search history row:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
