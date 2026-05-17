import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logLogin(entry: {
  userId?: string
  fullName: string
  phone?: string
  role: string
  ip?: string
}) {
  try {
    await supabase.from('login_log').insert({
      user_id: entry.userId || null,
      full_name: entry.fullName,
      phone: entry.phone || null,
      role: entry.role,
      ip: entry.ip || null,
    })
  } catch (err) {
    console.error('Failed to write login log:', err)
  }
}
