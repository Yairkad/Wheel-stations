'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push'

// Registers the SW unconditionally on first load so the manifest's share_target
// (WhatsApp → "share to app") works for every visitor, not just users who opted
// into push notifications (the only other place that calls registerServiceWorker()).
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker().catch(() => {})
  }, [])

  return null
}
