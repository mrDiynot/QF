import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { isDisposableEmail } from '@/lib/disposable-domains';

// Brevo form endpoints — web chat submissions go to a separate list
const BREVO_DEFAULT_ENDPOINT =
  'https://bc74bff7.sibforms.com/serve/MUIFAOsrRYTjZP3MAeqe1Xd8hvxnoojYEwhNtIL9FgNjDNClUzIsIWl37YPfwmoaEJz2szPJ1xgPlS3ab8e3mWqIQb2ZBOuyItBDoPcLNpu6dy1T23LHM4eVNXbZY6wLXxQAiQoqaZ8SEoWHemLnev2Nvw4RlBpL-5kQE9vKt6DZYxIyyt__juEn6JaUm5a4JpFiTZaIMIP7BwmIwA';
const BREVO_WEBCHAT_ENDPOINT =
  'https://bc74bff7.sibforms.com/serve/MUIFAKwABxxConu5lHeF9vSjoqn50R5iazXYwXT8rAI2VnlC3HLGScyHj1MtmR5omJ4tzf28H9HHEXBmIEFZd4u_I9IhoK12dOQqX9M4uR_oGq3NuImjUQzvS8ke37MFMF51V1D6BxXVDuoSk981ZnPiZ-Xk-Lm-V3wSQw8cdNfbd5MFOb5ilX_zfGF2JUoOen3yVU24F30ScnDHZQ==';

/**
 * Server-side API route for priority access form submissions.
 * Submits to Brevo from the server (avoids browser CORS/no-cors issues).
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const { allowed, retryAfterMs } = checkRateLimit(ip, RATE_LIMITS.contact);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, companyName, source } = body;

    // Input validation
    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (typeof fullName !== 'string' || fullName.length > 200 ||
        typeof email !== 'string' || email.length > 254 ||
        (phone && (typeof phone !== 'string' || phone.length > 30)) ||
        (companyName && (typeof companyName !== 'string' || companyName.length > 200))) {
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

    if (isDisposableEmail(email.toLowerCase().trim())) {
      return NextResponse.json(
        { success: false, error: 'Temporary/disposable email addresses are not accepted.' },
        { status: 400 }
      );
    }

    // Parse phone number
    let countryCode = '+1';
    let phoneNumber = '';
    let formattedPhone = '';

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      if (cleanPhone.startsWith('+')) {
        const match = cleanPhone.match(/^\+(\d{1,3})/);
        if (match) {
          countryCode = '+' + match[1];
          phoneNumber = cleanPhone.slice(match[0].length).replace(/\D/g, '');
        }
      } else {
        phoneNumber = cleanPhone.replace(/\D/g, '');
      }
      formattedPhone = countryCode.replace('+', '') + phoneNumber;
    }

    // Build Brevo form data
    const formData = new URLSearchParams();
    formData.append('FULL_NAME', fullName);
    formData.append('EMAIL', email);
    formData.append('COMPANY_NAME', companyName || '');

    if (phone && phone.trim()) {
      formData.append('SMS__COUNTRY_CODE', countryCode);
      formData.append('SMS', phoneNumber);
      formData.append('LANDLINE_NUMBER', formattedPhone);
    }

    formData.append('email_address_check', ''); // Honeypot
    formData.append('locale', 'en');

    // Choose endpoint based on source
    const brevoEndpoint = source === 'web-chat' ? BREVO_WEBCHAT_ENDPOINT : BREVO_DEFAULT_ENDPOINT;

    const brevoResponse = await fetch(brevoEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!brevoResponse.ok) {
      const text = await brevoResponse.text().catch(() => '');
      console.error('[PriorityAccess] Brevo error:', brevoResponse.status, text);
      return NextResponse.json(
        { success: false, error: 'Submission failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PriorityAccess] Server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

