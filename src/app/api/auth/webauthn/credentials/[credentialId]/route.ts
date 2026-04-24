import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveUser(supabase: ReturnType<typeof createClient<any>>, phone: string, password?: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  const { data: user } = await supabase
    .from('users')
    .select('id, password, is_active')
    .eq('phone', cleanPhone)
    .single() as { data: { id: string; password: string | null; is_active: boolean } | null }

  if (!user || !user.is_active) return null
  if (password && user.password) {
    const pwCheck = await verifyPassword(password, user.password)
    return pwCheck.valid ? user : null
  }
  return user
}

// PATCH /api/auth/webauthn/credentials/[credentialId]
// Body: { phone, password, friendlyName }
// Renames a passkey device
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    const { credentialId } = await params
    const { phone, password, friendlyName } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'יש להזין טלפון' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const user = await resolveUser(supabase, phone, password)
    if (!user) return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })

    const { error } = await supabase
      .from('webauthn_credentials')
      .update({ friendly_name: (friendlyName as string)?.trim() || null })
      .eq('id', credentialId)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'שגיאה בעדכון השם' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WebAuthn credential rename error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}

// DELETE /api/auth/webauthn/credentials/[credentialId]
// Body: { phone, password }
// Removes a passkey device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    const { credentialId } = await params
    const { phone, password } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'יש להזין טלפון' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const user = await resolveUser(supabase, phone, password)
    if (!user) return NextResponse.json({ error: 'טלפון או סיסמה שגויים' }, { status: 401 })

    const { error } = await supabase
      .from('webauthn_credentials')
      .delete()
      .eq('id', credentialId)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'שגיאה במחיקה' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WebAuthn credential delete error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
