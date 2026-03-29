import { NextRequest, NextResponse } from 'next/server'
import { verifyPunctureAccess, supabase } from '../../_auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (!(await verifyPunctureAccess(body))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { admin_password, pm_phone, pm_password, ...fields } = body
  void admin_password; void pm_phone; void pm_password

  const { error } = await supabase.from('punctures').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (!(await verifyPunctureAccess(body))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('punctures').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
