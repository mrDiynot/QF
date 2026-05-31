const STORAGE_KEY = 'qualiflow_submitted_emails';

/**
 * Get list of previously submitted emails from localStorage
 */
function getSubmittedEmails(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save email to localStorage as submitted
 */
function markEmailAsSubmitted(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const emails = getSubmittedEmails();
    const normalizedEmail = email.toLowerCase().trim();
    if (!emails.includes(normalizedEmail)) {
      emails.push(normalizedEmail);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Check if email was already submitted (client-side check)
 */
export function isEmailAlreadySubmitted(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return getSubmittedEmails().includes(normalizedEmail);
}

/**
 * Submit email signup to waitlist via Brevo form endpoint through our API proxy.
 * Includes deduplication to prevent same email from being submitted multiple times.
 */
export async function submitToBrevo(email: string, source: string = 'newsletter'): Promise<{ success: boolean; alreadySubmitted?: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log('[Brevo] Starting submission for:', normalizedEmail, 'from:', source);
  
  // Client-side deduplication check
  const alreadyInStorage = isEmailAlreadySubmitted(normalizedEmail);
  console.log('[Brevo] LocalStorage check - already submitted:', alreadyInStorage);
  
  if (alreadyInStorage) {
    console.log('[Brevo] Email already submitted (client-side check) - returning alreadySubmitted: true');
    return { success: true, alreadySubmitted: true };
  }
  
  try {
    // Submit through our API route which proxies to Brevo
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, source }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Check if it's a duplicate error from server
      if (data.alreadySubmitted) {
        console.log('[Brevo] Email already submitted (server-side check)');
        markEmailAsSubmitted(normalizedEmail);
        return { success: true, alreadySubmitted: true };
      }
      console.warn('[Brevo] Submission rejected:', data.error);
      return { success: false, error: data.error || 'Submission failed. Please try again.' };
    }
    
    if (data.success) {
      console.log('[Brevo] Submission successful!');
      markEmailAsSubmitted(normalizedEmail);
      return { success: true, alreadySubmitted: data.alreadySubmitted };
    }
    
    console.warn('[Brevo] Submission rejected with success=false');
    return { success: false, error: data.error || 'Submission failed. Please try again.' };
  } catch (error) {
    console.warn('[Brevo] Submission failed with error:', error);
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}

/**
 * Alias for submitToBrevo for clarity.
 */
export const submitToWaitlist = submitToBrevo;
