/**
 * Station Manager Authentication API
 * GET /api/wheel-stations/[stationId]/auth - Verify session token
 * POST /api/wheel-stations/[stationId]/auth - Login with phone + personal password
 * PUT /api/wheel-stations/[stationId]/auth - Change own password (requires current login)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Session expiry time: 7 days in milliseconds
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

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
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [tokenStationId, managerId, timestamp] = decoded.split(':')

      // Check station ID matches
      if (tokenStationId !== stationId) {
        return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
      }

      // Check if token has expired
      const tokenTime = parseInt(timestamp, 10)
      if (Date.now() - tokenTime > SESSION_EXPIRY_MS) {
        return NextResponse.json({ valid: false, error: 'Session expired', expired: true }, { status: 401 })
      }

      // Verify manager still exists and phone matches
      const { data: station, error } = await supabase
        .from('wheel_stations')
        .select(`
          id,
          wheel_station_managers (
            id,
            full_name,
            phone,
            role,
            is_primary
          )
        `)
        .eq('id', stationId)
        .single()

      if (error || !station) {
        return NextResponse.json({ valid: false, error: 'Station not found' }, { status: 404 })
      }

      // Find manager by ID and verify phone
      const cleanPhone = phone.replace(/\D/g, '')
      const manager = station.wheel_station_managers.find(
        (m: { id: string; phone: string }) =>
          m.id === managerId && m.phone.replace(/\D/g, '') === cleanPhone
      )

      if (!manager) {
        return NextResponse.json({ valid: false, error: 'Manager not found or phone mismatch' }, { status: 401 })
      }

      return NextResponse.json({
        valid: true,
        manager: {
          id: manager.id,
          full_name: manager.full_name,
          phone: manager.phone,
          role: manager.role,
          is_primary: manager.is_primary || false
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
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
    }

    // Get station with managers (including their personal passwords)
    const { data: station, error } = await supabase
      .from('wheel_stations')
      .select(`
        id,
        wheel_station_managers (
          id,
          full_name,
          phone,
          role,
          is_primary,
          password
        )
      `)
      .eq('id', stationId)
      .single()

    if (error || !station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    // Find manager by phone
    const cleanPhone = phone.replace(/\D/g, '')
    const manager = station.wheel_station_managers.find((m: { phone: string }) =>
      m.phone.replace(/\D/g, '') === cleanPhone
    )

    if (!manager) {
      // Record failed attempt for wrong phone
      const failResult = recordFailedAttempt(ip, stationId)
      if (failResult.locked) {
        return NextResponse.json({
          error: `יותר מדי ניסיונות כניסה. נסה שוב בעוד ${failResult.remainingTime} דקות`,
          code: 'RATE_LIMITED'
        }, { status: 429 })
      }
      return NextResponse.json({ error: 'מספר הטלפון לא נמצא ברשימת המנהלים' }, { status: 401 })
    }

    // Check if manager has a password set
    if (!manager.password) {
      return NextResponse.json({
        error: 'לא הוגדרה סיסמא אישית. יש לפנות לאדמין להגדרת סיסמא.',
        code: 'NO_PASSWORD_SET'
      }, { status: 400 })
    }

    // Verify personal password
    if (manager.password !== password) {
      // Record failed attempt and check if now locked
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

    // Generate a simple token (in production, use JWT or similar)
    const token = Buffer.from(`${stationId}:${manager.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      manager: {
        id: manager.id,
        full_name: manager.full_name,
        phone: manager.phone,
        role: manager.role,
        is_primary: manager.is_primary || false
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

    // Get station with managers
    const { data: station, error } = await supabase
      .from('wheel_stations')
      .select(`
        id,
        wheel_station_managers (id, phone, password)
      `)
      .eq('id', stationId)
      .single()

    if (error || !station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    // Find manager by phone
    const cleanPhone = phone.replace(/\D/g, '')
    const manager = station.wheel_station_managers.find((m: { phone: string }) =>
      m.phone.replace(/\D/g, '') === cleanPhone
    )

    if (!manager) {
      return NextResponse.json({ error: 'אינך מנהל תחנה מורשה' }, { status: 403 })
    }

    // Verify current password
    if (manager.password !== current_password) {
      return NextResponse.json({ error: 'סיסמא נוכחית שגויה' }, { status: 401 })
    }

    // Update manager's personal password
    const { error: updateError } = await supabase
      .from('wheel_station_managers')
      .update({ password: new_password })
      .eq('id', manager.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'הסיסמא שונתה בהצלחה'
    })
  } catch (error) {
    console.error('Error in PUT /api/wheel-stations/[stationId]/auth:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
