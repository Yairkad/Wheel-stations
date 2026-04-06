/**
 * Single Wheel Station Admin API (password protected)
 * PUT /api/wheel-stations/admin/[stationId] - Update station
 * DELETE /api/wheel-stations/admin/[stationId] - Delete station
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// PUT - Update station
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { admin_password, name, address, city_id, district, is_active, managers, max_managers } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    const updateData: {
      name?: string; address?: string; city_id?: string | null
      district?: string | null; is_active?: boolean; max_managers?: number
    } = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (city_id !== undefined) updateData.city_id = city_id || null
    if (district !== undefined) updateData.district = district || null
    if (is_active !== undefined) updateData.is_active = is_active
    if (max_managers !== undefined) updateData.max_managers = max_managers

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

    // Update managers if provided — replace all station_manager roles for this station
    if (managers !== undefined) {
      // Deactivate existing station_manager roles for this station
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('station_id', stationId)
        .eq('role', 'station_manager')

      // Re-add managers
      if (managers.length > 0) {
        for (const m of managers as { full_name: string; phone: string; role?: string; is_primary?: boolean; password?: string }[]) {
          const cleanPhone = m.phone.replace(/\D/g, '')

          let userId: string | null = null
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('phone', cleanPhone)
            .single()

          if (existingUser) {
            // Update name if changed; preserve password if not provided
            const userUpdate: Record<string, unknown> = { full_name: m.full_name }
            if (m.password) userUpdate.password = m.password
            await supabase.from('users').update(userUpdate).eq('id', existingUser.id)
            userId = existingUser.id
          } else {
            const { data: newUser } = await supabase
              .from('users')
              .insert({ full_name: m.full_name, phone: cleanPhone, password: m.password || null, is_active: true })
              .select('id')
              .single()
            userId = newUser?.id || null
          }

          if (userId) {
            // Check if a (deactivated) role already exists for this user+station
            const { data: existingRole } = await supabase
              .from('user_roles')
              .select('id')
              .eq('user_id', userId)
              .eq('role', 'station_manager')
              .eq('station_id', stationId)
              .single()

            if (existingRole) {
              await supabase
                .from('user_roles')
                .update({ is_active: true, is_primary: m.is_primary || false, title: m.role || 'מנהל תחנה' })
                .eq('id', existingRole.id)
            } else {
              await supabase.from('user_roles').insert({
                user_id: userId,
                role: 'station_manager',
                station_id: stationId,
                title: m.role || 'מנהל תחנה',
                is_primary: m.is_primary || false,
                is_active: true,
              })
            }
          }
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

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'סיסמת מנהל שגויה' }, { status: 403 })
    }

    // Deactivate station_manager roles for this station (keep users, just remove station access)
    await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('station_id', stationId)
      .eq('role', 'station_manager')

    await supabase.from('wheel_borrows').delete().eq('station_id', stationId)
    await supabase.from('wheels').delete().eq('station_id', stationId)

    const { error } = await supabase.from('wheel_stations').delete().eq('id', stationId)

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
