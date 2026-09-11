/**
 * Shared station manager authentication helper.
 * Verifies against the unified users + user_roles tables.
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/password'
import { getManagerSessionFromRequest } from '@/lib/manager-session'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface VerifyResult {
  success: boolean
  isPrimary?: boolean
  managerId?: string
  managerName?: string
  managerPhone?: string
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

  const pwCheck = await verifyPassword(password?.trim() ?? '', user.password ?? '')
  if (!pwCheck.valid) {
    return { success: false, error: 'סיסמא שגויה' }
  }
  if (pwCheck.newHash) {
    await supabase.from('users').update({ password: pwCheck.newHash }).eq('id', user.id)
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
    managerPhone: user.phone,
  }
}

/**
 * Verifies a station manager by their manager_session cookie instead of a
 * resent password. Re-checks the station_manager role row on every call (not
 * cached in the token) so a revoked role takes effect immediately even while
 * the session itself is still otherwise valid.
 */
export async function verifyStationManagerSession(
  request: NextRequest,
  stationId: string
): Promise<VerifyResult> {
  const session = await getManagerSessionFromRequest(request)
  if (!session || session.role !== 'station_manager') {
    return { success: false, error: 'לא מחובר' }
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, phone, is_active')
    .eq('id', session.userId)
    .single()

  if (!user || user.is_active === false) {
    return { success: false, error: 'המשתמש אינו פעיל' }
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
    return { success: false, error: 'אין הרשאת ניהול לתחנה זו' }
  }

  return {
    success: true,
    isPrimary: roleRow.is_primary || false,
    managerId: user.id,
    managerName: user.full_name,
  }
}
