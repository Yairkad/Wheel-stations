/**
 * Restore Deleted Wheel API
 * POST /api/wheel-stations/[stationId]/wheels/[wheelId]/restore
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySuperManagerSession } from '@/lib/super-manager-auth'
import { verifyStationManagerSession } from '@/lib/station-auth'
import { logAction } from '@/lib/audit-log'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTORE_WINDOW_DAYS = 14

interface RouteParams {
  params: Promise<{ stationId: string; wheelId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId, wheelId } = await params

    // Verify credentials - station manager or super manager, from whichever
    // role the caller's manager_session cookie was issued for
    let actorName = ''
    let actorType: 'super_manager' | 'station_manager' = 'station_manager'

    const smAuth = await verifySuperManagerSession(request)
    if (smAuth.success) {
      actorName = smAuth.superManager?.full_name || 'מנהל מחוז'
      actorType = 'super_manager'
    } else {
      const auth = await verifyStationManagerSession(request, stationId)
      if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
      }
      actorName = auth.managerName || 'מנהל תחנה'
      actorType = 'station_manager'
    }

    // Get the deleted wheel
    const { data: wheel, error: fetchError } = await supabase
      .from('wheels')
      .select('id, deleted_at, wheel_number')
      .eq('id', wheelId)
      .eq('station_id', stationId)
      .not('deleted_at', 'is', null)
      .single()

    if (fetchError || !wheel) {
      return NextResponse.json({ error: 'גלגל מחוק לא נמצא' }, { status: 404 })
    }

    // Check if within restore window
    const deletedAt = new Date(wheel.deleted_at)
    const now = new Date()
    const diffDays = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > RESTORE_WINDOW_DAYS) {
      return NextResponse.json({ error: 'חלון השחזור (14 יום) חלף. לא ניתן לשחזר את הגלגל.' }, { status: 400 })
    }

    // Restore the wheel
    const { error } = await supabase
      .from('wheels')
      .update({
        deleted_at: null,
        deleted_by_name: null,
        deleted_by_type: null
      })
      .eq('id', wheelId)
      .eq('station_id', stationId)

    if (error) {
      console.error('Error restoring wheel:', error)
      return NextResponse.json({ error: 'שגיאה בשחזור הגלגל' }, { status: 500 })
    }

    // Audit log
    logAction({
      action: 'wheel_restored',
      actorName,
      actorType,
      stationId,
      details: { wheelId, wheelNumber: wheel.wheel_number }
    })

    return NextResponse.json({ success: true, message: 'הגלגל שוחזר בהצלחה' })
  } catch (error) {
    console.error('Error in POST /api/.../restore:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
