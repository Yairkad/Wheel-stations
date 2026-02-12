import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuditAction =
  | 'wheel_created'
  | 'wheel_updated'
  | 'wheel_deleted'
  | 'wheel_restored'
  | 'borrow_created'
  | 'borrow_returned'

export type ActorType = 'super_manager' | 'station_manager' | 'operator' | 'admin'

interface AuditLogEntry {
  action: AuditAction
  actorName: string
  actorType: ActorType
  stationId?: string
  stationName?: string
  details?: Record<string, unknown>
}

export async function logAction(entry: AuditLogEntry) {
  try {
    await supabase.from('audit_log').insert({
      action: entry.action,
      actor_name: entry.actorName,
      actor_type: entry.actorType,
      station_id: entry.stationId || null,
      station_name: entry.stationName || null,
      details: entry.details || {}
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}
