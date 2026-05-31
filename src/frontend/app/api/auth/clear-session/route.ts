/**
 * API Route to force-clear NextAuth session cookies
 * This is needed when stale sessions with errors block fresh OAuth
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Session cleared' });
  
  // Clear all NextAuth cookies
  response.cookies.set('next-auth.session-token', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('__Secure-next-auth.session-token', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('next-auth.callback-url', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('next-auth.csrf-token', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('authjs.session-token', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('authjs.callback-url', '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('authjs.csrf-token', '', {
    expires: new Date(0),
    path: '/',
  });
  
  console.log('[Clear Session] All session cookies cleared');
  
  return response;
}

export async function GET() {
  return POST();
}
