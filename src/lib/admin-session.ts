// Uses Web Crypto API — works in both Edge Runtime (middleware) and Node.js (API routes)

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const ADMIN_SESSION_COOKIE = 'admin_session'
export const ADMIN_SESSION_MAX_AGE = 30 * 24 * 60 * 60 // seconds

function secret(): string {
  const s = process.env.WHEELS_ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('No session secret configured')
  return s
}

async function hmacSign(key: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ expiry: Date.now() + SESSION_DURATION_MS, nonce: randomNonce() })
  const sig = await hmacSign(secret(), payload)
  return btoa(payload) + '.' + sig
}

export async function validateSessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return false
    const payloadB64 = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const payload = atob(payloadB64)
    const expectedSig = await hmacSign(secret(), payload)
    if (sig !== expectedSig) return false
    const { expiry } = JSON.parse(payload)
    return typeof expiry === 'number' && Date.now() < expiry
  } catch {
    return false
  }
}
