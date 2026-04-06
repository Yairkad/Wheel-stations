/**
 * Shared station manager authentication helper.
 * Verifies against the unified users + user_roles tables.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface VerifyResult {
  success: boolean
  isPrimary?: boolean
  managerId?: string
  managerName?: string
  error?: string
}

/**
 * Verifies that a phone+password combination belongs to a station_manager of the given station.
 */
export async function verifyStationManager(
  stationId: string,
  phone: string,
  password: string
): Promise<VerifyResult> {
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, password, is_active')
    .eq('phone', cleanPhone)
    .single()

  if (!user || user.is_active === false) {
    return { success: false, error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }
  }

  if (user.password !== password) {
    return { success: false, error: 'סיסמא שגויה' }
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('id, is_primary')
    .eq('user_id', user.id)
    .eq('role', 'station_manager')
    .eq('station_id', stationId)
    .eq('is_active', true)
    .single()

  if (!roleRow) {
    return { success: false, error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }
  }

  return {
    success: true,
    isPrimary: roleRow.is_primary || false,
    managerId: user.id,
    managerName: user.full_name,
  }
}
