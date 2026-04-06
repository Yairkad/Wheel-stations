import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function adminOnly(body: Record<string, unknown>): boolean {
  try { return verifyAdminPassword(body.admin_password as string) } catch { return false }
}

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  if (!adminOnly(params)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('created_at, users(id, full_name, phone, is_active)')
    .eq('role', 'puncture_manager')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const managers = (roles || []).map(r => {
    const u = Array.isArray(r.users) ? r.users[0] : r.users as { id: string; full_name: string; phone: string; is_active: boolean } | null
    return { id: u?.id, full_name: u?.full_name, phone: u?.phone, is_active: u?.is_active ?? true, created_at: r.created_at }
  })

  return NextResponse.json(managers)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full_name, phone, password } = body
  if (!full_name || !phone || !password)
    return NextResponse.json({ error: 'נדרש שם, טלפון וסיסמה' }, { status: 400 })

  const cleanPhone = phone.replace(/\D/g, '')

  // Find or create user
  let userId: string
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('phone', cleanPhone)
    .single()

  if (existingUser) {
    await supabase.from('users').update({ full_name, password }).eq('id', existingUser.id)
    userId = existingUser.id
  } else {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ full_name, phone: cleanPhone, password, is_active: true })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    userId = newUser!.id
  }

  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'puncture_manager',
    is_active: true,
  })

  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  return NextResponse.json({ id: userId, full_name, phone: cleanPhone, is_active: true })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, admin_password, ...fields } = body
  void admin_password
  if (!id) return NextResponse.json({ error: 'נדרש id' }, { status: 400 })

  // Update user fields (full_name, phone, password, is_active)
  const userFields: Record<string, unknown> = {}
  if (fields.full_name !== undefined) userFields.full_name = fields.full_name
  if (fields.phone !== undefined) userFields.phone = (fields.phone as string).replace(/\D/g, '')
  if (fields.password !== undefined) userFields.password = fields.password
  if (fields.is_active !== undefined) userFields.is_active = fields.is_active

  if (Object.keys(userFields).length > 0) {
    const { error } = await supabase.from('users').update(userFields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = body
  if (!id) return NextResponse.json({ error: 'נדרש id' }, { status: 400 })

  // Deactivate puncture_manager role; keep the user
  const { error } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', id)
    .eq('role', 'puncture_manager')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
