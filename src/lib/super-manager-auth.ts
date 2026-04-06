import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function verifySuperManager(
  phone: string,
  password: string
): Promise<{ success: boolean; superManager?: { id: string; full_name: string; phone: string; allowed_districts: string[] | null }; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, password, is_active')
    .eq('phone', cleanPhone)
    .single()

  if (!user) return { success: false, error: 'מספר הטלפון לא נמצא' }
  if (!user.is_active) return { success: false, error: 'החשבון אינו פעיל' }
  if (user.password !== password) return { success: false, error: 'סיסמא שגויה' }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('id, allowed_districts')
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
      allowed_districts: roleRow.allowed_districts || null
    }
  }
}
