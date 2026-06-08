/**
 * API Route: Mark wheel as temporarily unavailable
 * POST /api/wheels/[wheelId]/unavailable - Mark as unavailable
 * DELETE /api/wheels/[wheelId]/unavailable - Mark as available again
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ wheelId: string }>
}

async function verifyManagerOwnsWheel(managerId: string, wheelId: string): Promise<boolean> {
  const { data: wheel } = await supabase.from('wheels').select('station_id').eq('id', wheelId).single()
  if (!wheel) return false
  const { data: role } = await supabase.from('user_roles')
    .select('id').eq('user_id', managerId).eq('role', 'station_manager')
    .eq('station_id', wheel.station_id).eq('is_active', true).single()
  return !!role
}

// POST - Mark wheel as temporarily unavailable
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { wheelId } = await params
    const body = await request.json()
    const { reason, notes, manager_id } = body

    if (!manager_id) {
      return NextResponse.json({ error: 'manager_id is required' }, { status: 401 })
    }

    if (!await verifyManagerOwnsWheel(manager_id, wheelId)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Update wheel status
    const { data: wheel, error } = await supabase
      .from('wheels')
      .update({
        temporarily_unavailable: true,
        unavailable_reason: reason,
        unavailable_notes: notes || null,
        unavailable_since: new Date().toISOString(),
        unavailable_by_manager_id: manager_id || null
      })
      .eq('id', wheelId)
      .select()
      .single()

    if (error) {
      console.error('Error marking wheel unavailable:', error)
      return NextResponse.json(
        { error: 'Failed to update wheel status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      wheel
    })
  } catch (error) {
    console.error('Error in POST unavailable:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Mark wheel as available again
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { wheelId } = await params
    const { searchParams } = new URL(request.url)
    const managerId = searchParams.get('manager_id')

    if (!managerId) {
      return NextResponse.json({ error: 'manager_id is required' }, { status: 401 })
    }

    if (!await verifyManagerOwnsWheel(managerId, wheelId)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    // Update wheel status
    const { data: wheel, error } = await supabase
      .from('wheels')
      .update({
        temporarily_unavailable: false,
        unavailable_reason: null,
        unavailable_notes: null,
        unavailable_since: null,
        unavailable_by_manager_id: null
      })
      .eq('id', wheelId)
      .select()
      .single()

    if (error) {
      console.error('Error marking wheel available:', error)
      return NextResponse.json(
        { error: 'Failed to update wheel status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      wheel
    })
  } catch (error) {
    console.error('Error in DELETE unavailable:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
