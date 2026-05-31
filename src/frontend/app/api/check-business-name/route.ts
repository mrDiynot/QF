import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

/**
 * API route to check if a business name is available
 * Proxies the request to the backend API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessName = searchParams.get('name');

  if (!businessName) {
    return NextResponse.json(
      { available: false, error: 'Business name is required' },
      { status: 400 }
    );
  }

  try {
    // Check against the backend
    const response = await fetch(
      `${getApiUrl('auth/check-business-name')}?name=${encodeURIComponent(businessName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // If backend returns error, assume name is available (fail open for UX)
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('[check-business-name] Error:', error);
    // Fail open - let the registration attempt handle the error
    return NextResponse.json({ available: true });
  }
}
