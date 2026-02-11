import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function verifySuperManager(
  phone: string,
  password: string
): Promise<{ success: boolean; superManager?: { id: string; full_name: string; phone: string }; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const cleanPhone = phone.replace(/\D/g, '')

  const { data, error } = await supabase
    .from('super_managers')
    .select('id, phone, password, full_name, is_active')
    .limit(50)

  if (error || !data) {
    return { success: false, error: 'שגיאה באימות' }
  }

  const manager = data.find(
    (m: { phone: string }) => m.phone.replace(/\D/g, '') === cleanPhone
  )

  if (!manager) {
    return { success: false, error: 'מספר הטלפון לא נמצא' }
  }

  if (!manager.is_active) {
    return { success: false, error: 'החשבון אינו פעיל' }
  }

  if (manager.password !== password) {
    return { success: false, error: 'סיסמא שגויה' }
  }

  return {
    success: true,
    superManager: { id: manager.id, full_name: manager.full_name, phone: manager.phone }
  }
}
