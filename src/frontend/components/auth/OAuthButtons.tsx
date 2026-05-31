'use client';

/**
 * OAuth buttons component
 * Google and Microsoft OAuth authentication
 * 
 * FLOW: Plan Selection → OAuth → Payment (if paid plan) → Onboarding
 * 
 * Before OAuth redirect, we store the selected plan info in localStorage.
 * After OAuth callback, the /oauth/callback page will:
 * 1. Check for pending plan in localStorage
 * 2. If paid plan, redirect to Stripe checkout
 * 3. If free plan, redirect to onboarding
 */

import { signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

import type { BillingInterval } from '@/types/api';

interface OAuthButtonsProps {
  disabled?: boolean;
  selectedPlan?: string | null;
  billingInterval?: BillingInterval;
  includeOnboarding?: boolean;
  companyName?: string;
  phoneNumber?: string;
}

export function OAuthButtons({ 
  disabled = false, 
  selectedPlan,
  billingInterval = 'monthly',
  includeOnboarding = false,
  companyName,
  phoneNumber,
}: OAuthButtonsProps) {
  if (!config.features.enableOAuth) {
    return null;
  }

  const handleOAuthSignIn = async (provider: 'google' | 'microsoft-entra-id') => {
    // Debug: Log ALL props received
    console.log('[OAuthButtons] handleOAuthSignIn called with props:', {
      disabled,
      selectedPlan,
      billingInterval,
      includeOnboarding,
      companyName,
      phoneNumber,
      provider,
    });
    
    if (disabled) return;
    
    // Store plan and business info in localStorage BEFORE OAuth redirect
    // This will be retrieved after OAuth completes
    if (selectedPlan) {
      localStorage.setItem('oauthPendingPlan', selectedPlan);
      localStorage.setItem('oauthPendingBillingInterval', billingInterval);
      localStorage.setItem('oauthPendingIncludeOnboarding', includeOnboarding ? 'true' : 'false');
      // Also set as cookie so NextAuth server-side can pass it to backend
      document.cookie = `oauthSelectedPlan=${encodeURIComponent(selectedPlan)}; path=/; max-age=3600; SameSite=Lax`;
      console.log('[OAuthButtons] Stored oauthSelectedPlan cookie:', selectedPlan);
    } else {
      // Clear any stale data
      localStorage.removeItem('oauthPendingPlan');
      localStorage.removeItem('oauthPendingBillingInterval');
      localStorage.removeItem('oauthPendingIncludeOnboarding');
      document.cookie = 'oauthSelectedPlan=; path=/; max-age=0';
    }
    
    // Store business info for OAuth flow - use BOTH localStorage AND cookies for reliability
    console.log('[OAuthButtons] Storing company info:', { companyName, phoneNumber });
    if (companyName) {
      localStorage.setItem('oauthPendingCompanyName', companyName);
      // Also set as cookie for reliability across OAuth redirect
      document.cookie = `oauthPendingCompanyName=${encodeURIComponent(companyName)}; path=/; max-age=3600; SameSite=Lax`;
      console.log('[OAuthButtons] Stored oauthPendingCompanyName:', companyName);
    }
    if (phoneNumber) {
      localStorage.setItem('oauthPendingPhoneNumber', phoneNumber);
      // Also set as cookie for reliability across OAuth redirect
      document.cookie = `oauthPendingPhoneNumber=${encodeURIComponent(phoneNumber)}; path=/; max-age=3600; SameSite=Lax`;
      console.log('[OAuthButtons] Stored oauthPendingPhoneNumber:', phoneNumber);
    }
    
    // Verify storage immediately
    console.log('[OAuthButtons] Verification - localStorage after store:', {
      oauthPendingPlan: localStorage.getItem('oauthPendingPlan'),
      oauthPendingCompanyName: localStorage.getItem('oauthPendingCompanyName'),
      oauthPendingPhoneNumber: localStorage.getItem('oauthPendingPhoneNumber'),
    });
    console.log('[OAuthButtons] Verification - cookies:', document.cookie);
    
    // Clear any stale session cookies via server-side route
    // This is required because httpOnly cookies can't be cleared client-side
    try {
      await fetch('/api/auth/clear-session', { method: 'POST' });
      // Also call signOut to clear NextAuth state
      await signOut({ redirect: false });
    } catch {
      // Ignore errors - session might already be empty
    }
    
    // Start fresh OAuth flow
    // Redirect to /oauth/callback which will handle the post-OAuth flow
    // (payment for paid plans, onboarding for free plans)
    // Note: NextAuth v5 uses 'redirectTo', v4 uses 'callbackUrl' - we provide both for compatibility
    signIn(provider, { 
      callbackUrl: '/oauth/callback',
      redirectTo: '/oauth/callback',
    });
  };

  const handleGoogleSignIn = () => handleOAuthSignIn('google');
  const handleMicrosoftSignIn = () => handleOAuthSignIn('microsoft-entra-id');

  return (
    <div className="grid grid-cols-1 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 bg-white hover:bg-muted/20 border-border/80 transition-all hover:border-border hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGoogleSignIn}
        disabled={disabled}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="font-medium text-text-navy">Google</span>
      </Button>
    </div>
  );
}