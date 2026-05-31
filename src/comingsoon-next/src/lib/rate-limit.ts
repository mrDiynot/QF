/**
 * Edge-compatible in-memory rate limiter for Vercel serverless.
 * 
 * IMPORTANT: This persists only within the same function instance (warm starts).
 * Cold starts reset the state. This is acceptable for basic abuse prevention.
 * For production-grade rate limiting, use Upstash Redis or Vercel KV.
 * 
 * @security Prevents rapid-fire form submission spam on /api/waitlist and /api/contact
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global state survives across warm invocations on same Vercel instance
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically (prevent memory leak)
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * 
 * @param identifier - Unique key (e.g., IP address or "ip:endpoint")
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // First request or expired window
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      retryAfterMs: 0,
    };
  }

  // Within window - check count
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  // Increment and allow
  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
    retryAfterMs: 0,
  };
}

/**
 * Extract client IP from Next.js request headers (Vercel-compatible).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Pre-configured rate limits
export const RATE_LIMITS = {
  /** Waitlist: 3 submissions per minute per IP */
  waitlist: { maxRequests: 3, windowMs: 60_000 },
  /** Contact form: 2 submissions per minute per IP */
  contact: { maxRequests: 2, windowMs: 60_000 },
  /** Chat API: 20 messages per minute per IP */
  chat: { maxRequests: 20, windowMs: 60_000 },
} as const;

