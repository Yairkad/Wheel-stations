import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Mark a vehicle model row as human-verified (admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await validateAdminSession(request)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .update({
        verified_at: new Date().toISOString(),
        verified_by: 'admin'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error verifying vehicle model:', error)
      return NextResponse.json({ error: 'Failed to verify vehicle model' }, { status: 500 })
    }

    return NextResponse.json({ model: data })
  } catch (error) {
    console.error('Error in POST /api/vehicle-models/[id]/verify:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
