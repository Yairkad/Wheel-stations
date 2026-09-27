'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push'

// Registers the SW unconditionally on first load, not just for users who opted
// into push notifications (the only other place that calls registerServiceWorker()).
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker().catch(() => {})
  }, [])

  return null
}
