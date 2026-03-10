'use client'

import { useState, useEffect } from 'react'

export function useAdminPendingReports() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/error-reports'),
          fetch('/api/missing-vehicle-reports')
        ])
        const [d1, d2] = await Promise.all([r1.json(), r2.json()])
        const c1 = (d1.reports || []).filter((r: { status: string }) => r.status === 'pending').length
        const c2 = (d2.reports || []).filter((r: { status: string }) => r.status === 'pending').length
        setCount(c1 + c2)
      } catch {
        // silently fail - badge just won't show
      }
    }
    fetchCounts()
  }, [])

  return count
}