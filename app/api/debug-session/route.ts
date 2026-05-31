import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      accessTokenPreview: session?.accessToken 
        ? String(session.accessToken).substring(0, 30) + '...' 
        : 'MISSING',
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        businessId: session.user.businessId,
      } : null,
      sessionKeys: session ? Object.keys(session) : [],
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
