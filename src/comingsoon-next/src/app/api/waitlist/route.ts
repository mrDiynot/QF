import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { isDisposableEmail } from '@/lib/disposable-domains';
import { verifyEmailDomain } from '@/lib/email-verification';

// Brevo form endpoint URL (environment variable with fallback)
const BREVO_FORM_URL = process.env.BREVO_WAITLIST_FORM_URL ||
  'https://bc74bff7.sibforms.com/serve/MUIFAM3b2grJ34Ti9YYSP5ygkbtGHb204lAMuygYqWhrSd8stVlDJzK2TlC3XvWZUvdXENCvk4zsCY8C_EQTKgDUaKUyFQCSLY6ozZ0dHSm7W-2kB0o3Syhz8CvUY7SVg27G0x7YykCqLGBMehtiTxLOjuI5KQZzYkTAmJdCFxMdzB2azF9wkOjTjeDz3gob3O-1gOZklSJchrLJtg==';

export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ──
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(`waitlist:${ip}`, RATE_LIMITS.waitlist);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(rateLimit.retryAfterMs / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { email, source = 'newsletter' } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();

    // ── Input Validation ──
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // RFC 5321: max 254 characters for email
    if (normalizedEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Email address is too long' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ── Disposable Email Check ──
    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Temporary/disposable email addresses are not accepted. Please use a permanent email.' },
        { status: 400 }
      );
    }

    // ── MX Record Verification (domain must be able to receive email) ──
    const domainCheck = await verifyEmailDomain(normalizedEmail);
    if (!domainCheck.valid) {
      return NextResponse.json(
        { success: false, error: domainCheck.error || 'This email domain cannot receive emails' },
        { status: 400 }
      );
    }

    // ── Submit to Brevo (deduplication handled natively by Brevo) ──
    const formData = new URLSearchParams();
    formData.append('EMAIL', normalizedEmail);
    formData.append('FULL_NAME', 'Waitlist User');
    formData.append('COMPANY_NAME', 'Early Access Subscriber');
    formData.append('MESSAGE', `Interested in QualiFlowAI early access (Source: ${source})`);
    formData.append('email_address_check', ''); // Honeypot field
    formData.append('locale', 'en');

    const brevoResponse = await fetch(BREVO_FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (brevoResponse.ok) {
      return NextResponse.json({ success: true, alreadySubmitted: false });
    }

    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
