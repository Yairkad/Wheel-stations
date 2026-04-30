import React from 'react'
import type { StoryFn } from '@storybook/nextjs-vite'

type Handler = { pattern: string | RegExp; response: unknown; status?: number }

const SESSION_KEYS = ['operator_session', 'super_manager_session', 'vehicle_db_manager', 'auth_roles', 'active_role']

function clearAllSessions() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('station_session_') || key.startsWith('wheel_manager_') || SESSION_KEYS.includes(key)) {
      localStorage.removeItem(key)
    }
  })
}

function blockNavigation() {
  // Prevent window.location.href = '/login' from navigating the iframe
  try {
    Object.defineProperty(window.location, 'href', {
      set(url: string) {
        console.log('[Storybook] Blocked navigation to:', url)
      },
      configurable: true,
    })
  } catch {
    // Fallback: override assign/replace
    try {
      window.location.assign = () => {}
      window.location.replace = () => {}
    } catch {}
  }
}

export function mockFetch(handlers: Handler[]) {
  const orig = window.fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString()
    for (const h of handlers) {
      const match = typeof h.pattern === 'string' ? url.includes(h.pattern) : h.pattern.test(url)
      if (match) {
        return new Response(JSON.stringify(h.response), {
          status: h.status ?? 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    return orig(input, init)
  }
}

export function withSession(
  storageData: Record<string, unknown>,
  handlers: Handler[]
) {
  return (Story: StoryFn) => {
    clearAllSessions()
    blockNavigation()
    Object.entries(storageData).forEach(([k, v]) =>
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    )
    mockFetch(handlers)
    return <Story />
  }
}
