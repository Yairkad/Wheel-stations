/**
 * Super Managers Admin API
 * GET /api/admin/super-managers - List all super managers
 * POST /api/admin/super-managers - Create a new super manager
 * PUT /api/admin/super-managers - Update a super manager
 * DELETE /api/admin/super-managers - Delete a super manager
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - List all super managers
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('id, allowed_districts, created_at, users(id, full_name, phone, is_active)')
      .eq('role', 'super_manager')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching super managers:', error)
      return NextResponse.json({ error: 'Failed to fetch super managers' }, { status: 500 })
    }

    const superManagers = (roles || []).map(r => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
      return {
        id: u?.id,
        full_name: u?.full_name,
        phone: u?.phone,
        is_active: u?.is_active ?? true,
        allowed_districts: r.allowed_districts || null,
        created_at: r.created_at,
      }
    })

    return NextResponse.json({ superManagers })
  } catch (error) {
    console.error('Error in GET /api/admin/super-managers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new super manager
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, full_name, phone, password, allowed_districts } = body

    if (!(await verifyAdminAuth(admin_password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!full_name || !phone || !password) {
      return NextResponse.json({ error: 'נא למלא שם, טלפון וסיסמא' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'הסיסמא חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const cleanPhone = phone.replace(/\D/g, '')

    // Find or create user
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    if (existingUser) {
      await supabase.from('users').update({ full_name, password: password.trim() }).eq('id', existingUser.id)
      userId = existingUser.id
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ full_name, phone: cleanPhone, password: password.trim(), is_active: true })
        .select('id')
        .single()

      if (userError) {
        if (userError.code === '23505') return NextResponse.json({ error: 'מספר טלפון זה כבר קיים במערכת' }, { status: 400 })
        console.error('Error creating user:', userError)
        return NextResponse.json({ error: 'Failed to create super manager' }, { status: 500 })
      }
      userId = newUser!.id
    }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'super_manager',
      allowed_districts: allowed_districts?.length ? allowed_districts : null,
      is_active: true,
    })

    if (roleError) {
      console.error('Error creating role:', roleError)
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
    const { admin_password, id, full_name, phone, password, is_active, allowed_districts } = body

    if (!(await verifyAdminAuth(admin_password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing super manager ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update user fields
    const userUpdate: Record<string, unknown> = {}
    if (full_name !== undefined) userUpdate.full_name = full_name
    if (phone !== undefined) userUpdate.phone = phone.replace(/\D/g, '')
    if (password !== undefined && password !== '') userUpdate.password = password.trim()
    if (is_active !== undefined) userUpdate.is_active = is_active

    if (Object.keys(userUpdate).length > 0) {
      const { error } = await supabase.from('users').update(userUpdate).eq('id', id)
      if (error) {
        if (error.code === '23505') return NextResponse.json({ error: 'מספר טלפון זה כבר קיים במערכת' }, { status: 400 })
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update super manager' }, { status: 500 })
      }
    }

    // Update role fields
    if (allowed_districts !== undefined) {
      const { error: rErr } = await supabase
        .from('user_roles')
        .update({ allowed_districts: allowed_districts?.length ? allowed_districts : null })
        .eq('user_id', id)
        .eq('role', 'super_manager')
      if (rErr) return NextResponse.json({ error: 'Failed to update districts' }, { status: 500 })
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

    if (!(await verifyAdminAuth(admin_password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing super manager ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Deactivate super_manager role; keep the user
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', id)
      .eq('role', 'super_manager')

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
