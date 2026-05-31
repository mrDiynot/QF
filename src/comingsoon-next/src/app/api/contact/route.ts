import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { isDisposableEmail } from '@/lib/disposable-domains';
import { verifyEmailDomain } from '@/lib/email-verification';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.qualiflow.ai';

// Brevo form endpoint URL (environment variable with fallback)
const BREVO_FORM_URL = process.env.BREVO_CONTACT_FORM_URL ||
  'https://bc74bff7.sibforms.com/serve/MUIFAGnI3jSChbQQX_TApm2GKA1hGz3TL6a1Qb4J61TQ16ArUm5myre9Lu8TxjzxMFsVMktB5OP1qw9ROAGlIQWrXZIlqwPrVrHWer76RGFrmytuS7eIXrZfeWfRNFF1E5KMlo0Jl_XTJ1l-_Yu0KsUs3u7O7NBmIYD0N9jyvkjzaV0-K55dR2d4ksMHx6dzyZU7ZC59d_SdfVsz7Q==';

/**
 * API route to handle contact form submissions
 * 1. Submits to Brevo form for list management
 * 2. Forwards to backend API for email notification with CC support
 */
export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ──
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(rateLimit.retryAfterMs / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json();
    const { name, email, company, phone, message } = body;

    // ── Input Validation ──
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Length validation to prevent DoS
    if (typeof name !== 'string' || name.length > 200 ||
        typeof email !== 'string' || email.length > 254 ||
        typeof message !== 'string' || message.length > 5000 ||
        (company && (typeof company !== 'string' || company.length > 200)) ||
        (phone && (typeof phone !== 'string' || phone.length > 30))) {
      return NextResponse.json(
        { success: false, error: 'Input exceeds maximum allowed length' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ── Disposable Email Check ──
    if (isDisposableEmail(email.toLowerCase().trim())) {
      return NextResponse.json(
        { success: false, error: 'Temporary/disposable email addresses are not accepted. Please use a permanent email.' },
        { status: 400 }
      );
    }

    // ── MX Record Verification (domain must be able to receive email) ──
    const domainCheck = await verifyEmailDomain(email.toLowerCase().trim());
    if (!domainCheck.valid) {
      return NextResponse.json(
        { success: false, error: domainCheck.error || 'This email domain cannot receive emails' },
        { status: 400 }
      );
    }

    // Parse phone number if provided
    let countryCode = '+1';
    let phoneNumber = '';
    let formattedPhone = '';

    if (phone) {
      if (phone.startsWith('+')) {
        const match = phone.match(/^\+(\d{1,3})/);
        if (match) {
          countryCode = '+' + match[1];
          phoneNumber = phone.slice(match[0].length).replace(/\D/g, '');
        }
      } else {
        phoneNumber = phone.replace(/\D/g, '');
      }
      formattedPhone = countryCode.replace('+', '') + phoneNumber;
    }

    // ── Submit to Brevo ──
    const formData = new URLSearchParams();
    formData.append('FULL_NAME', name);
    formData.append('EMAIL', email);
    formData.append('COMPANY_NAME', company || '');
    formData.append('MESSAGE', message);

    if (phone) {
      formData.append('SMS__COUNTRY_CODE', countryCode);
      formData.append('SMS', phoneNumber);
      formData.append('LANDLINE_NUMBER', formattedPhone);
    }

    formData.append('email_address_check', ''); // Honeypot field
    formData.append('locale', 'en');

    const brevoResponse = await fetch(BREVO_FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    // Forward to backend API for email notification (fire-and-forget, don't block)
    try {
      const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          phone: phone || undefined,
          subject: company ? `Contact from ${company}` : undefined,
          message,
        }),
      });

      if (!backendResponse.ok) {
        // Log server-side only — do not expose to client
      }
    } catch {
      // Backend email failure is non-critical — Brevo submission is primary
    }

    if (!brevoResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Submission failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
