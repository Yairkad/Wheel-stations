/**
 * Station Manager Authentication API
 * GET /api/wheel-stations/[stationId]/auth - Verify session token
 * POST /api/wheel-stations/[stationId]/auth - Login with phone + personal password
 * PUT /api/wheel-stations/[stationId]/auth - Change own password (requires current login)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Session expiry time: 7 days in milliseconds
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

const TOKEN_SECRET = process.env.TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret'

function signToken(payload: string): string {
  const hmac = createHmac('sha256', TOKEN_SECRET)
  hmac.update(payload)
  return hmac.digest('hex')
}

function createToken(stationId: string, managerId: string): string {
  const payload = `${stationId}:${managerId}:${Date.now()}`
  const sig = signToken(payload)
  return Buffer.from(`${payload}:${sig}`).toString('base64')
}

function verifyToken(token: string): { stationId: string; managerId: string; timestamp: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 4) return null
    const [stationId, managerId, timestamp, sig] = parts
    const payload = `${stationId}:${managerId}:${timestamp}`
    const expected = signToken(payload)
    if (sig !== expected) return null
    return { stationId, managerId, timestamp }
  } catch {
    return null
  }
}

// Rate limiting configuration
const MAX_ATTEMPTS = 5 // Maximum failed login attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000 // 1 hour window for counting attempts

// In-memory rate limit store (resets on server restart)
// In production, consider using Redis for persistence across instances
interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lockedUntil: number | null
}
const rateLimitStore = new Map<string, RateLimitEntry>()

function getRateLimitKey(ip: string, stationId: string): string {
  return `${ip}:${stationId}`
}

function checkRateLimit(ip: string, stationId: string): { allowed: boolean; remainingTime?: number } {
  const key = getRateLimitKey(ip, stationId)
  const entry = rateLimitStore.get(key)
  const now = Date.now()

  if (!entry) {
    return { allowed: true }
  }

  // Check if locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingTime = Math.ceil((entry.lockedUntil - now) / 1000 / 60)
    return { allowed: false, remainingTime }
  }

  // Check if attempts window has expired - reset if so
  if (now - entry.firstAttempt > ATTEMPT_WINDOW_MS) {
    rateLimitStore.delete(key)
    return { allowed: true }
  }

  // Clear lockout if expired
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    entry.lockedUntil = null
    entry.attempts = 0
    entry.firstAttempt = now
  }

  return { allowed: true }
}

function recordFailedAttempt(ip: string, stationId: string): { locked: boolean; remainingTime?: number } {
  const key = getRateLimitKey(ip, stationId)
  const now = Date.now()
  let entry = rateLimitStore.get(key)

  if (!entry || now - entry.firstAttempt > ATTEMPT_WINDOW_MS) {
    entry = { attempts: 1, firstAttempt: now, lockedUntil: null }
    rateLimitStore.set(key, entry)
    return { locked: false }
  }

  entry.attempts++

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS
    const remainingTime = Math.ceil(LOCKOUT_DURATION_MS / 1000 / 60)
    return { locked: true, remainingTime }
  }

  return { locked: false }
}

function clearRateLimit(ip: string, stationId: string): void {
  const key = getRateLimitKey(ip, stationId)
  rateLimitStore.delete(key)
}

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// GET - Verify session token is still valid
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const token = request.nextUrl.searchParams.get('token')
    const phone = request.nextUrl.searchParams.get('phone')

    if (!token || !phone) {
      return NextResponse.json({ valid: false, error: 'Missing token or phone' }, { status: 400 })
    }

    // Decode and validate token
    try {
      const parsed = verifyToken(token)

      if (!parsed) {
        return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
      }

      const { stationId: tokenStationId, managerId, timestamp } = parsed

      // Check station ID matches
      if (tokenStationId !== stationId) {
        return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
      }

      // Check if token has expired
      const tokenTime = parseInt(timestamp, 10)
      if (Date.now() - tokenTime > SESSION_EXPIRY_MS) {
        return NextResponse.json({ valid: false, error: 'Session expired', expired: true }, { status: 401 })
      }

      // Verify manager still exists, phone matches, and has role for this station
      const cleanPhone = phone.replace(/\D/g, '')

      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, phone, is_active')
        .eq('id', managerId)
        .eq('phone', cleanPhone)
        .single()

      if (!user || !user.is_active) {
        return NextResponse.json({ valid: false, error: 'Manager not found or phone mismatch' }, { status: 401 })
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('id, is_primary, title')
        .eq('user_id', user.id)
        .eq('role', 'station_manager')
        .eq('station_id', stationId)
        .eq('is_active', true)
        .single()

      if (!roleRow) {
        return NextResponse.json({ valid: false, error: 'Manager not found or phone mismatch' }, { status: 401 })
      }

      return NextResponse.json({
        valid: true,
        manager: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          role: roleRow.title || 'מנהל תחנה',
          is_primary: roleRow.is_primary || false
        }
      })
    } catch {
      return NextResponse.json({ valid: false, error: 'Invalid token format' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/[stationId]/auth:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Login (verify phone is manager + password matches)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit before processing
    const rateLimitCheck = checkRateLimit(ip, stationId)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: `יותר מדי ניסיונות כניסה. נסה שוב בעוד ${rateLimitCheck.remainingTime} דקות`,
        code: 'RATE_LIMITED'
      }, { status: 429 })
    }

    const body = await request.json()
    const phone = body.phone?.trim()
    const password = body.password?.trim()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
    }

    // Find user by phone
    const cleanPhone = phone.replace(/\D/g, '')
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, phone, password, is_active')
      .eq('phone', cleanPhone)
      .single()

    if (!user || !user.is_active) {
      const failResult = recordFailedAttempt(ip, stationId)
      if (failResult.locked) {
        return NextResponse.json({
          error: `יותר מדי ניסיונות כניסה. נסה שוב בעוד ${failResult.remainingTime} דקות`,
          code: 'RATE_LIMITED'
        }, { status: 429 })
      }
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }, { status: 401 })
    }

    // Check if user has a station_manager role for this station
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id, is_primary, title')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('station_id', stationId)
      .eq('is_active', true)
      .single()

    if (!roleRow) {
      const failResult = recordFailedAttempt(ip, stationId)
      if (failResult.locked) {
        return NextResponse.json({
          error: `יותר מדי ניסיונות כניסה. נסה שוב בעוד ${failResult.remainingTime} דקות`,
          code: 'RATE_LIMITED'
        }, { status: 429 })
      }
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }, { status: 401 })
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json({
        error: 'לא הוגדרה סיסמא אישית. יש לפנות לאדמין להגדרת סיסמא.',
        code: 'NO_PASSWORD_SET'
      }, { status: 400 })
    }

    // Verify password
    if (user.password !== password) {
      const failResult = recordFailedAttempt(ip, stationId)
      if (failResult.locked) {
        return NextResponse.json({
          error: `יותר מדי ניסיונות כניסה. נסה שוב בעוד ${failResult.remainingTime} דקות`,
          code: 'RATE_LIMITED'
        }, { status: 429 })
      }
      return NextResponse.json({ error: 'סיסמא שגויה' }, { status: 401 })
    }

    // Successful login - clear rate limit for this IP/station
    clearRateLimit(ip, stationId)

    // Generate HMAC-signed token
    const token = createToken(stationId, user.id)

    return NextResponse.json({
      success: true,
      manager: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: roleRow.title || 'מנהל תחנה',
        is_primary: roleRow.is_primary || false
      },
      token
    })
  } catch (error) {
    console.error('Error in POST /api/wheel-stations/[stationId]/auth:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Change own personal password (any manager can change their own password)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { phone, current_password, new_password } = body

    if (!phone || !current_password || !new_password) {
      return NextResponse.json({ error: 'Phone, current password and new password are required' }, { status: 400 })
    }

    if (new_password.length < 4) {
      return NextResponse.json({ error: 'הסיסמא חייבת להכיל לפחות 4 תווים' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const { data: user } = await supabase
      .from('users')
      .select('id, password')
      .eq('phone', cleanPhone)
      .eq('is_active', true)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'אינך מנהל תחנה מורשה' }, { status: 403 })
    }

    if (user.password !== current_password) {
      return NextResponse.json({ error: 'סיסמא נוכחית שגויה' }, { status: 401 })
    }

    // Verify this user actually has a station_manager role for this station
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'station_manager')
      .eq('station_id', stationId)
      .eq('is_active', true)
      .single()

    if (!roleRow) {
      return NextResponse.json({ error: 'אינך מנהל תחנה מורשה' }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: new_password })
      .eq('id', user.id)
    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'הסיסמא שונתה בהצלחה' })
  } catch (error) {
    console.error('Error in PUT /api/wheel-stations/[stationId]/auth:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
