/**
 * Shared station manager authentication helper.
 * Used by multiple API routes to verify a station manager's credentials.
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
 * Verifies that a phone+password combination belongs to a manager of the given station.
 * Returns success, isPrimary, and managerId on success.
 */
export async function verifyStationManager(
  stationId: string,
  phone: string,
  password: string
): Promise<VerifyResult> {
  const { data: station, error } = await supabase
    .from('wheel_stations')
    .select(`
      id,
      wheel_station_managers (id, phone, password, is_primary, full_name)
    `)
    .eq('id', stationId)
    .single()

  if (error || !station) {
    return { success: false, error: 'Station not found' }
  }

  const cleanPhone = phone.replace(/\D/g, '')
  const manager = (station.wheel_station_managers as Array<{
    id: string; phone: string; password: string; is_primary: boolean; full_name: string
  }>).find(m => m.phone.replace(/\D/g, '') === cleanPhone)

  if (!manager) {
    return { success: false, error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }
  }

  if (manager.password !== password) {
    return { success: false, error: 'סיסמא שגויה' }
  }

  return {
    success: true,
    isPrimary: manager.is_primary || false,
    managerId: manager.id,
    managerName: manager.full_name,
  }
}
