/**
 * Shared wheel-count stats used by all wheel-stations list/detail API routes
 */

export interface WheelStatsInput {
  is_available: boolean
  temporarily_unavailable?: boolean | null
  deleted_at?: string | null
}

export interface WheelStats {
  totalWheels: number
  availableWheels: number
  takenWheels: number
  inactiveWheels: number
}

export function computeWheelStats(wheels: WheelStatsInput[]): WheelStats {
  const nonDeleted = wheels.filter(w => !w.deleted_at)
  const inactiveWheels = nonDeleted.filter(w => w.temporarily_unavailable).length
  const availableWheels = nonDeleted.filter(w => w.is_available && !w.temporarily_unavailable).length
  const takenWheels = nonDeleted.filter(w => !w.is_available && !w.temporarily_unavailable).length

  return {
    totalWheels: nonDeleted.length,
    availableWheels,
    takenWheels,
    inactiveWheels,
  }
}
