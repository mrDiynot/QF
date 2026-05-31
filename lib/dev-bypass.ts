/**
 * Dev Bypass Utilities
 * Helpers for gracefully degrading when the backend is unreachable in dev.
 * The `devBypass` flag is set in sessionStorage by useLogin when it cannot
 * reach localhost:5050, allowing the UI to be tested without a live backend.
 */

/**
 * Returns true when the devBypass flag is active in this browser session.
 */
export function isDevBypassActive(): boolean {
  return (
    typeof window !== 'undefined' &&
    sessionStorage.getItem('devBypass') === 'true'
  );
}

/**
 * Logs an error to the console ONLY when devBypass is NOT active.
 * Use this in service catch-blocks so network errors stay silent during dev.
 */
export function devLog(message: string, error?: unknown): void {
  if (!isDevBypassActive()) {
    console.error(message, error);
  } else {
    // Minimal debug trace so you can still see what was suppressed
    console.debug('[devBypass suppressed]', message);
  }
}
