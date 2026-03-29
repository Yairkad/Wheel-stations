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

  const { data, error } = await supabase
    .from('puncture_managers')
    .select('id, full_name, phone, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full_name, phone, password } = body
  if (!full_name || !phone || !password)
    return NextResponse.json({ error: 'נדרש שם, טלפון וסיסמה' }, { status: 400 })

  const { data, error } = await supabase
    .from('puncture_managers')
    .insert({ full_name, phone: phone.replace(/\D/g, ''), password, is_active: true })
    .select('id, full_name, phone, is_active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, admin_password, ...fields } = body
  void admin_password
  if (!id) return NextResponse.json({ error: 'נדרש id' }, { status: 400 })

  const { error } = await supabase.from('puncture_managers').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  if (!adminOnly(body)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = body
  if (!id) return NextResponse.json({ error: 'נדרש id' }, { status: 400 })

  const { error } = await supabase.from('puncture_managers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
