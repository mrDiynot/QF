'use client';

/**
 * Onboarding layout
 * Protected layout for onboarding wizard
 * Checks for authentication and allows access for:
 * - Authenticated users who need to complete onboarding
 * - Users returning from cancelled checkout (Resume Payment Dialog)
 * - Users who selected free plan
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

/**
 * Check if user is handling a cancelled checkout.
 * This persists across URL changes to prevent redirect loops.
 */
function isHandlingCancelledCheckout(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('handlingCancelledCheckout') === 'true';
}

/**
 * Set the cancelled checkout handling flag.
 */
function setHandlingCancelledCheckout(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    sessionStorage.setItem('handlingCancelledCheckout', 'true');
  } else {
    sessionStorage.removeItem('handlingCancelledCheckout');
  }
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    // Check for NextAuth session OR access token in sessionStorage (for fresh registrations)
    const accessToken = sessionStorage.getItem('accessToken');
    const hasValidSession = status === 'authenticated' && session?.user;

    if (!hasValidSession && !accessToken) {
      // No valid session found, redirect to login
      router.push('/login');
      return;
    }

    // Check if this is a return from cancelled checkout - set session flag and allow access
    // The wizard will show the Resume Payment Dialog to let user complete payment or start free trial
    const checkoutCancelled = searchParams.get('checkout_cancelled') === 'true';
    const paymentCanceled = searchParams.get('payment_canceled') === 'true';

    if (checkoutCancelled || paymentCanceled) {
      // Set session flag so this persists across URL changes
      setHandlingCancelledCheckout(true);
      setIsAuthorized(true);
      return;
    }

    // Check if we're already handling a cancelled checkout (flag set in previous render)
    if (isHandlingCancelledCheckout()) {
      setIsAuthorized(true);
      return;
    }

    // Allow access - the OnboardingWizard handles all the redirect logic now
    // We only check for authentication here, not payment status
    setIsAuthorized(true);
  }, [router, session, status, searchParams]);

  // Show loading while checking authorization
  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}