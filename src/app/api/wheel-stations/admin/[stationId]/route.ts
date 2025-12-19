/**
 * Single Wheel Station Admin API (password protected)
 * PUT /api/wheel-stations/admin/[stationId] - Update station
 * DELETE /api/wheel-stations/admin/[stationId] - Delete station
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WHEELS_ADMIN_PASSWORD = process.env.WHEELS_ADMIN_PASSWORD || 'wheels2024'

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// PUT - Update station
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { admin_password, name, address, city_id, district, is_active, managers } = body

    // Verify admin password
    if (admin_password !== WHEELS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    // Build update object
    const updateData: {
      name?: string
      address?: string
      city_id?: string | null
      district?: string | null
      is_active?: boolean
    } = {}

    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (city_id !== undefined) updateData.city_id = city_id || null
    if (district !== undefined) updateData.district = district || null
    if (is_active !== undefined) updateData.is_active = is_active

    // Only update if there's something to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('wheel_stations')
        .update(updateData)
        .eq('id', stationId)

      if (updateError) {
        console.error('Error updating station:', updateError)
        return NextResponse.json({ error: 'שגיאה בעדכון תחנה' }, { status: 500 })
      }
    }

    // Update managers if provided (with personal passwords)
    if (managers !== undefined) {
      // Delete existing managers
      await supabase
        .from('wheel_station_managers')
        .delete()
        .eq('station_id', stationId)

      // Add new managers with their passwords
      if (managers.length > 0) {
        const managersWithStation = managers.map((m: { full_name: string; phone: string; role?: string; is_primary?: boolean; password?: string }) => ({
          station_id: stationId,
          full_name: m.full_name,
          phone: m.phone,
          role: m.role || 'מנהל תחנה',
          is_primary: m.is_primary || false,
          password: m.password || null
        }))

        const { error: managersError } = await supabase
          .from('wheel_station_managers')
          .insert(managersWithStation)

        if (managersError) {
          console.error('Error updating managers:', managersError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/wheel-stations/admin/[stationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete station
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { admin_password } = body

    // Verify admin password
    if (admin_password !== WHEELS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    // Delete related records first (managers, wheels, borrows)
    await supabase
      .from('wheel_borrows')
      .delete()
      .eq('station_id', stationId)

    await supabase
      .from('wheels')
      .delete()
      .eq('station_id', stationId)

    await supabase
      .from('wheel_station_managers')
      .delete()
      .eq('station_id', stationId)

    // Delete station
    const { error } = await supabase
      .from('wheel_stations')
      .delete()
      .eq('id', stationId)

    if (error) {
      console.error('Error deleting station:', error)
      return NextResponse.json({ error: 'שגיאה במחיקת תחנה' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/wheel-stations/admin/[stationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
