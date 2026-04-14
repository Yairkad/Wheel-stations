import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { verifyPassword } from '@/lib/password'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Accepts { admin_password } OR { pm_phone, pm_password }
export async function verifyPunctureAccess(body: Record<string, unknown>): Promise<boolean> {
  if (body.admin_password) {
    try { return await verifyAdminAuth(body.admin_password as string) } catch (e) { console.error('Admin auth config error:', e); return false }
  }
  if (body.pm_phone && body.pm_password) {
    const cleanPhone = (body.pm_phone as string).replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, password, is_active')
      .eq('phone', cleanPhone)
      .single()

    if (!user || !user.is_active) return false
    const pwCheck = await verifyPassword((body.pm_password as string)?.trim() ?? '', user.password ?? '')
    if (!pwCheck.valid) return false
    if (pwCheck.newHash) {
      await supabase.from('users').update({ password: pwCheck.newHash }).eq('id', user.id)
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'puncture_manager')
      .eq('is_active', true)
      .single()

    return !!roleRow
  }
  return false
}

export { supabase }
