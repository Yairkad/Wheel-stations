'use client'

import { useEffect } from 'react'

// Calls onOutside when a mousedown happens outside the given ref's element.
// Pass `enabled: false` to skip attaching the listener (e.g. while a menu is closed).
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, onOutside, enabled])
}
