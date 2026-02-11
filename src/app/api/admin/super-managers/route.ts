/**
 * Super Managers Admin API
 * GET /api/admin/super-managers - List all super managers
 * POST /api/admin/super-managers - Create a new super manager
 * PUT /api/admin/super-managers - Update a super manager
 * DELETE /api/admin/super-managers - Delete a super manager
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List all super managers
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: superManagers, error } = await supabase
      .from('super_managers')
      .select('id, full_name, phone, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching super managers:', error)
      return NextResponse.json({ error: 'Failed to fetch super managers' }, { status: 500 })
    }

    return NextResponse.json({ superManagers: superManagers || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/super-managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new super manager
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, full_name, phone, password } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!full_name || !phone || !password) {
      return NextResponse.json({ error: 'נא למלא שם, טלפון וסיסמא' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'הסיסמא חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('super_managers')
      .insert({
        full_name,
        phone: phone.replace(/\D/g, ''),
        password,
        is_active: true
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'מספר טלפון זה כבר קיים במערכת' }, { status: 400 })
      }
      console.error('Error creating super manager:', error)
      return NextResponse.json({ error: 'Failed to create super manager' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'מנהל עליון נוצר בהצלחה' })
  } catch (error) {
    console.error('Error in POST /api/admin/super-managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a super manager
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, id, full_name, phone, password, is_active } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing super manager ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const updateData: Record<string, unknown> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone.replace(/\D/g, '')
    if (password !== undefined && password !== '') updateData.password = password
    if (is_active !== undefined) updateData.is_active = is_active

    const { error } = await supabase
      .from('super_managers')
      .update(updateData)
      .eq('id', id)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'מספר טלפון זה כבר קיים במערכת' }, { status: 400 })
      }
      console.error('Error updating super manager:', error)
      return NextResponse.json({ error: 'Failed to update super manager' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'מנהל עליון עודכן בהצלחה' })
  } catch (error) {
    console.error('Error in PUT /api/admin/super-managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a super manager
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, id } = body

    if (!verifyAdminPassword(admin_password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing super manager ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('super_managers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting super manager:', error)
      return NextResponse.json({ error: 'Failed to delete super manager' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'מנהל עליון נמחק בהצלחה' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/super-managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
