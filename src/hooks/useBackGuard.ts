'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseBackGuardOptions {
  // Whether the current page IS the "floor" screen for the active role (e.g. the
  // manager's own station page, /operator, /call-center, /super-manager). Pressing
  // back while already here triggers onExitRequest instead of leaving the app.
  isHome: boolean
  // Where "back" should land when the user isn't on the home screen yet.
  homeHref: string
  // Called when back is pressed while already on the home screen — should show an
  // explicit confirmation (exit app / switch back to a previous role / cancel).
  onExitRequest: () => void
  // Disable entirely (e.g. while a modal-level confirm dialog of its own is open).
  enabled?: boolean
}

// Prevents a bare browser/hardware "back" press from ever falling through past a
// role's home screen and into an inconsistent session state (see AppHeader's
// forceLogout/pageshow handling) — back always stops at the home screen first, and
// only a second back from there asks explicitly what the user wants to do.
export function useBackGuard({ isHome, homeHref, onExitRequest, enabled = true }: UseBackGuardOptions) {
  const router = useRouter()
  const isHomeRef = useRef(isHome)
  const homeHrefRef = useRef(homeHref)
  const onExitRequestRef = useRef(onExitRequest)
  isHomeRef.current = isHome
  homeHrefRef.current = homeHref
  onExitRequestRef.current = onExitRequest

  useEffect(() => {
    if (!enabled) return

    // Insert a duplicate history entry so the very next back press is interceptable
    // via popstate instead of immediately navigating the browser away.
    window.history.pushState({ __appBackGuard: true }, '', window.location.href)

    const handlePopState = () => {
      // Re-arm the guard immediately so repeated back presses keep landing here.
      window.history.pushState({ __appBackGuard: true }, '', window.location.href)
      if (isHomeRef.current) {
        onExitRequestRef.current()
      } else {
        router.push(homeHrefRef.current)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enabled, router])
}
