// TEMP DIAGNOSTIC (share-target investigation): records client-side lifecycle
// events (page loads, pageshow/bfcache, share-result detection) to localStorage
// so they survive the OS-triggered navigation, and can be exported as JSON for
// manual inspection when the device isn't connected to a debugger.
// Remove once the share-target investigation concludes.

const STORAGE_KEY = 'wheels_diag_log'
const MAX_ENTRIES = 300

interface DiagEntry {
  ts: string
  name: string
  data?: unknown
}

export function logDiag(name: string, data?: unknown) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const log: DiagEntry[] = raw ? JSON.parse(raw) : []
    log.push({ ts: new Date().toISOString(), name, data })
    while (log.length > MAX_ENTRIES) log.shift()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // localStorage unavailable/full — diagnostics are best-effort, never block the app
  }
}

export function getDiagLog(): DiagEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearDiagLog() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

export function downloadDiagLog() {
  const log = getDiagLog()
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wheels-diag-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
