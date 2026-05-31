/**
 * Server-side email domain verification using DNS MX record lookups.
 *
 * This module verifies that an email's domain:
 * 1. Actually exists in DNS
 * 2. Has MX (Mail Exchange) records configured to receive email
 *
 * Design: FAIL-OPEN — if DNS lookup times out or fails transiently,
 * we allow the email through rather than blocking a potentially valid user.
 *
 * This module uses Node.js built-in `dns` module and can only run server-side
 * (Next.js API routes / Server Components).
 */
import { promises as dns } from 'dns';

export interface EmailVerificationResult {
  valid: boolean;
  error?: string;
  /** The MX records found (for debugging/logging) */
  mxRecords?: Array<{ exchange: string; priority: number }>;
}

// Cache MX lookups to avoid repeated DNS queries for the same domain
// Key: domain, Value: { result, timestamp }
const mxCache = new Map<string, { result: EmailVerificationResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_MAX_SIZE = 500;

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of mxCache) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      mxCache.delete(key);
    }
  }
}

/**
 * Verify that an email domain has valid MX records and can receive email.
 *
 * @param email - The email address to verify
 * @returns Verification result with valid flag and optional error message
 *
 * @example
 * const result = await verifyEmailDomain('user@gmail.com');
 * // { valid: true, mxRecords: [{ exchange: 'gmail-smtp-in.l.google.com', priority: 5 }, ...] }
 *
 * const result = await verifyEmailDomain('user@fakdomain123.com');
 * // { valid: false, error: 'This email domain does not exist' }
 */
export async function verifyEmailDomain(email: string): Promise<EmailVerificationResult> {
  const domain = email.split('@')[1]?.toLowerCase().trim();

  if (!domain) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check cache first
  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Periodic cache cleanup
  if (mxCache.size > CACHE_MAX_SIZE) {
    cleanupCache();
  }

  try {
    // Set a timeout for the DNS lookup (3 seconds max)
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000)
      ),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      const result: EmailVerificationResult = {
        valid: false,
        error: 'This email domain cannot receive emails',
      };
      mxCache.set(domain, { result, timestamp: Date.now() });
      return result;
    }

    const result: EmailVerificationResult = {
      valid: true,
      mxRecords: mxRecords.map((r) => ({ exchange: r.exchange, priority: r.priority })),
    };
    mxCache.set(domain, { result, timestamp: Date.now() });
    return result;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException & { code?: string; message?: string };

    // Domain does not exist
    if (error.code === 'ENOTFOUND') {
      const result: EmailVerificationResult = {
        valid: false,
        error: 'This email domain does not exist',
      };
      mxCache.set(domain, { result, timestamp: Date.now() });
      return result;
    }

    // No MX records found (NODATA response)
    if (error.code === 'ENODATA') {
      // Some domains use A records as fallback for mail delivery (RFC 5321 §5.1)
      // Try resolving A records as a fallback
      try {
        const aRecords = await dns.resolve4(domain);
        if (aRecords && aRecords.length > 0) {
          // Domain exists with A records — mail might work via implicit MX
          const result: EmailVerificationResult = { valid: true };
          mxCache.set(domain, { result, timestamp: Date.now() });
          return result;
        }
      } catch {
        // A record lookup also failed
      }

      const result: EmailVerificationResult = {
        valid: false,
        error: 'This email domain cannot receive emails',
      };
      mxCache.set(domain, { result, timestamp: Date.now() });
      return result;
    }

    // DNS timeout or transient failure — FAIL OPEN (allow through)
    // We don't want to block legitimate users due to temporary DNS issues
    if (error.message === 'DNS_TIMEOUT' || error.code === 'ETIMEOUT' || error.code === 'ESERVFAIL') {
      console.warn(`[EmailVerification] DNS lookup timed out for domain: ${domain} — allowing through (fail-open)`);
      return { valid: true };
    }

    // Any other unexpected error — fail open
    console.warn(`[EmailVerification] Unexpected DNS error for domain: ${domain}`, error.code || error.message);
    return { valid: true };
  }
}

