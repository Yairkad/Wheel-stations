import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'
import { getManagerSessionFromRequest } from '@/lib/manager-session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface SuperManagerVerifyResult {
  success: boolean
  superManager?: { id: string; full_name: string; phone: string; allowed_districts: string[] | null; can_edit: boolean }
  error?: string
}

export async function verifySuperManager(
  phone: string,
  password: string
): Promise<SuperManagerVerifyResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, password, is_active')
    .eq('phone', cleanPhone)
    .single()

  if (!user) return { success: false, error: 'מספר הטלפון לא נמצא' }
  if (!user.is_active) return { success: false, error: 'החשבון אינו פעיל' }
  const pwCheck = await verifyPassword(password?.trim() ?? '', user.password ?? '')
  if (!pwCheck.valid) return { success: false, error: 'סיסמא שגויה' }
  if (pwCheck.newHash) {
    const supabaseLocal = createClient(supabaseUrl, supabaseServiceKey)
    await supabaseLocal.from('users').update({ password: pwCheck.newHash }).eq('id', user.id)
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('id, allowed_districts, can_edit')
    .eq('user_id', user.id)
    .eq('role', 'super_manager')
    .eq('is_active', true)
    .single()

  if (!roleRow) return { success: false, error: 'אין הרשאת מנהל מחוז' }

  return {
    success: true,
    superManager: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      allowed_districts: roleRow.allowed_districts || null,
      can_edit: roleRow.can_edit ?? false
    }
  }
}

/**
 * Verifies a super (district) manager by their manager_session cookie instead
 * of a resent password. Re-checks the super_manager role row on every call so
 * a revoked role or a can_edit/allowed_districts change takes effect
 * immediately even while the session itself is still otherwise valid.
 */
export async function verifySuperManagerSession(request: NextRequest): Promise<SuperManagerVerifyResult> {
  const session = await getManagerSessionFromRequest(request)
  if (!session || session.role !== 'super_manager') {
    return { success: false, error: 'לא מחובר' }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, is_active')
    .eq('id', session.userId)
    .single()

  if (!user || !user.is_active) return { success: false, error: 'החשבון אינו פעיל' }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('id, allowed_districts, can_edit')
    .eq('user_id', user.id)
    .eq('role', 'super_manager')
    .eq('is_active', true)
    .single()

  if (!roleRow) return { success: false, error: 'אין הרשאת מנהל מחוז' }

  return {
    success: true,
    superManager: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      allowed_districts: roleRow.allowed_districts || null,
      can_edit: roleRow.can_edit ?? false
    }
  }
}
