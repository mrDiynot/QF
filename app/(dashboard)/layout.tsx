'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { DashboardFooter } from '@/components/dashboard/footer';
import { DashboardBreadcrumb } from '@/components/dashboard/DashboardBreadcrumb';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlag } from '@/lib/feature-flags';
import DashCodeBusinessSidebar from '@/components/dashcode/sidebar/business-sidebar';
import { SimplifiedSidebar } from '@/components/navigation/SimplifiedSidebar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { cn } from '@/lib/utils';
import { conversationsService } from '@/services/api/conversations.service';
import { SubscriptionStatusBanner } from '@/components/subscription/SubscriptionStatusBanner';
import { Toaster } from '@/components/ui/sonner';
import { signOut } from 'next-auth/react';
import { useSessionRefresh } from '@/hooks/auth/useSessionRefresh';

/**
 * Dashboard access rules:
 * 1. Users who selected a PAID plan during registration MUST complete payment
 * 2. Users on free tier can access dashboard freely
 * 3. Payment prompts are shown within dashboard (upgrade banners, feature gates)
 */

/**
 * Checks if user has a pending paid plan that hasn't been paid for.
 * This prevents users who SELECTED a paid plan from accessing dashboard before payment.
 * Free tier users are NOT affected by this check.
 */
function hasPendingUnpaidPlan(): { hasPending: boolean; planId: string | null } {
  if (typeof window === 'undefined') return { hasPending: false, planId: null };

  const pendingPlanId = localStorage.getItem('pendingPlanId');
  const paymentConfirmed = sessionStorage.getItem('paymentConfirmed') === 'true';

  // Debug logging
  console.log('[Dashboard] Checking pending unpaid plan:', {
    pendingPlanId,
    paymentConfirmed,
  });

  // Check if there's a pending paid plan that hasn't been paid
  // IMPORTANT: Only enforce for users who explicitly selected a paid plan during registration
  if (pendingPlanId && pendingPlanId !== 'free-flow' && pendingPlanId !== 'freeflow' && !paymentConfirmed) {
    return { hasPending: true, planId: pendingPlanId };
  }

  return { hasPending: false, planId: null };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding, isFetched, error: onboardingError } = useOnboardingStatus();
  const [isReady, setIsReady] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Feature flag for DashCode sidebar
  const useDashCodeSidebar = useFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR);
  
  // Feature flag for new simplified navigation — force true for redesign
  const useSimplifiedNav = true;

  // Get total conversation count from conversations API
  const { data: conversationData } = useQuery({
    queryKey: ['conversations', 'total-count'],
    queryFn: () => conversationsService.getConversations({ pageNumber: 1, pageSize: 1 }),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: sessionStatus === 'authenticated',
  });

  const conversationCount = conversationData?.totalItems || 0;

  // Proactive session refresh - keeps session alive during user activity
  // This prevents session expiration during active use
  useSessionRefresh({
    enabled: sessionStatus === 'authenticated',
    onRefreshError: (error) => {
      console.error('[Dashboard] Session refresh failed:', error);
      // If refresh fails, redirect to login
      router.push('/login?session_expired=true');
    },
  });

  // Check onboarding status and redirect if necessary
  useEffect(() => {
    // Wait for session to load first
    if (sessionStatus === 'loading') return;

    // If not authenticated, redirect to login (middleware should handle this, but as fallback)
    // Skip this check when devBypass flag is set (backend unreachable in dev)
    const isDevBypass = typeof window !== 'undefined' && sessionStorage.getItem('devBypass') === 'true';
    if (sessionStatus === 'unauthenticated' && !isDevBypass) {
      console.warn('[Dashboard] User is unauthenticated - redirecting to login');
      router.push('/login?callbackUrl=/dashboard');
      return;
    }

    // Handle API errors (e.g., 401 Unauthorized)
    if (onboardingError) {
      const axiosError = onboardingError as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        console.warn('[Dashboard] API returned 401 - session may be invalid, redirecting to login');
        router.push('/login?callbackUrl=/dashboard&session_expired=true');
        return;
      }
      // For other errors, log and proceed (allow dashboard to show)
      console.error('[Dashboard] Onboarding status error:', onboardingError);
    }

    // CRITICAL: Check for pending unpaid plan BEFORE allowing dashboard access
    // This only affects users who SELECTED a paid plan during registration
    // Free tier users and users who didn't select a plan are NOT affected
    const { hasPending, planId } = hasPendingUnpaidPlan();
    if (hasPending && planId) {
      console.warn('[Dashboard] Pending unpaid plan detected:', planId);
      // Redirect to direct checkout page - skips plan selection, goes straight to Stripe
      router.push(`/checkout?plan=${planId}&returnTo=/onboarding`);
      return;
    }

    // Dev bypass — skip all onboarding checks and allow dashboard access
    if (isDevBypass) {
      setIsReady(true);
      return;
    }

    // Wait for onboarding status to load (only if authenticated)
    // BUT if we already have data showing complete/skipped, proceed even if refetching
    const hasCompletedStatus = onboardingStatus?.isComplete || onboardingStatus?.isSkipped;
    if (isLoadingOnboarding && !hasCompletedStatus && !isFetched) return;

    // Check if onboarding is incomplete
    if (onboardingStatus && !onboardingStatus.isComplete && !onboardingStatus.isSkipped) {
      // Redirect to onboarding for new users who haven't completed it
      router.push('/onboarding');
      return;
    }

    // User is authenticated and onboarding is complete/skipped
    // Free tier users can access dashboard - they see upgrade prompts within dashboard
    if (hasCompletedStatus || isFetched) {
      setIsReady(true);
    }
  }, [sessionStatus, onboardingStatus, isLoadingOnboarding, isFetched, onboardingError, router]);

  // Show loading while checking status
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d0618 0%, #1a0a2e 50%, #170d2e 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          <p className="text-sm text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0d0618 0%, #1a0a2e 30%, #13082a 60%, #170d2e 100%)' }}>
      {/* Subtle radial glow overlays */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Desktop Sidebar - Conditional based on feature flag */}
      {useSimplifiedNav ? (
        <div className="hidden lg:block">
          <SimplifiedSidebar
            unreadCount={conversationCount}
            onLogout={() => signOut({ callbackUrl: '/login' })}
            onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          />
        </div>
      ) : (
        <div className="hidden lg:block">
          {useDashCodeSidebar ? (
            <DashCodeBusinessSidebar unreadCount={conversationCount} />
          ) : (
            <DashboardSidebar />
          )}
        </div>
      )}

      {/* Mobile Sidebar - TODO: Create simplified mobile version */}
      <MobileSidebar />
      
      {/* Command Palette (Cmd+K) */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Main Content */}
      <main className={cn(
        "min-h-screen flex flex-col pt-16 lg:pt-0",
        useDashCodeSidebar ? "lg:ml-[248px]" : useSimplifiedNav ? "lg:ml-72" : "lg:ml-80"
      )}>
        <div className="flex-1 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 text-white">
            {/* Subscription status banner - shows trial expiring, free tier upgrade, payment issues */}
            <SubscriptionStatusBanner />
            <DashboardBreadcrumb />
          </div>
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
            {children}
          </div>
        </div>
        <DashboardFooter />
      </main>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}