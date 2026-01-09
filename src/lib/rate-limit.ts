/**
 * Simple in-memory rate limiter for API routes
 * Limits requests per IP address
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  maxRequests: number  // Maximum requests allowed
  windowMs: number     // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address or user ID
 * @param options - Rate limit configuration
 * @returns Result with success status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs
    })
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs
    }
  }

  // Check if limit exceeded
  if (entry.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Increment counter
  entry.count++
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
