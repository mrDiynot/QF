/**
 * Client-Side Rate Limiter
 * 
 * Provides throttling and rate limiting utilities to prevent
 * flooding the backend with requests from the simulator.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

const rateLimitStates = new Map<string, RateLimitState>();

/**
 * Check if a request is allowed under the rate limit
 * @param key - Unique identifier for the rate limit bucket (e.g., 'simulator-sms', 'simulator-voice')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  let state = rateLimitStates.get(key);

  // Initialize state if not exists
  if (!state) {
    state = { requests: [], lastReset: now };
    rateLimitStates.set(key, state);
  }

  // Remove expired requests from the window
  state.requests = state.requests.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  const remaining = config.maxRequests - state.requests.length;
  const oldestRequest = state.requests[0];
  const resetIn = oldestRequest
    ? Math.max(0, config.windowMs - (now - oldestRequest))
    : 0;

  if (state.requests.length >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn };
  }

  // Record this request
  state.requests.push(now);
  return { allowed: true, remaining: remaining - 1, resetIn };
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  rateLimitStates.delete(key);
}

/**
 * Reset all rate limits
 */
export function resetAllRateLimits(): void {
  rateLimitStates.clear();
}

/**
 * Throttle function - limits how often a function can be called
 * @param fn - Function to throttle
 * @param delay - Minimum delay between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return fn(...args) as ReturnType<T>;
    }

    // Schedule the call for later if not already scheduled
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, delay - timeSinceLastCall);
    }

    return undefined;
  };
}

/**
 * Debounce function - delays execution until after a pause in calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Pre-configured rate limits for simulator
export const SIMULATOR_RATE_LIMITS = {
  /** SMS simulation: 10 requests per minute */
  sms: { maxRequests: 10, windowMs: 60000 },
  /** Voice simulation: 5 requests per minute */
  voice: { maxRequests: 5, windowMs: 60000 },
  /** WhatsApp simulation: 10 requests per minute */
  whatsapp: { maxRequests: 10, windowMs: 60000 },
  /** Form submission: 20 requests per minute */
  form: { maxRequests: 20, windowMs: 60000 },
  /** Chat widget: 30 requests per minute */
  chat: { maxRequests: 30, windowMs: 60000 },
  /** AI analysis: 10 requests per minute */
  ai: { maxRequests: 10, windowMs: 60000 },
  /** Webhook simulation: 15 requests per minute */
  webhook: { maxRequests: 15, windowMs: 60000 },
} as const;

export type SimulatorRateLimitKey = keyof typeof SIMULATOR_RATE_LIMITS;

/**
 * Check simulator rate limit with pre-configured limits
 */
export function checkSimulatorRateLimit(key: SimulatorRateLimitKey) {
  return checkRateLimit(`simulator-${key}`, SIMULATOR_RATE_LIMITS[key]);
}

