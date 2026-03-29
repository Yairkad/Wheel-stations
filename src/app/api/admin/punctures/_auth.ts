import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Accepts { admin_password } OR { pm_phone, pm_password }
export async function verifyPunctureAccess(body: Record<string, unknown>): Promise<boolean> {
  if (body.admin_password) {
    try { return verifyAdminPassword(body.admin_password as string) } catch { return false }
  }
  if (body.pm_phone && body.pm_password) {
    const cleanPhone = (body.pm_phone as string).replace(/\D/g, '')
    const { data } = await supabase
      .from('puncture_managers')
      .select('id')
      .eq('phone', cleanPhone)
      .eq('password', body.pm_password as string)
      .eq('is_active', true)
      .single()
    return !!data
  }
  return false
}

export { supabase }
