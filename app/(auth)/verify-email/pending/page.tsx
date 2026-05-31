'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { config } from '@/lib/config';
import { toast } from 'sonner';
import { GradientButton } from '@/components/shared/gradient-button';
import { useAuth } from '@/hooks/auth/useAuth';
import { Logo } from '@/components/shared/logo';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function VerifyEmailPendingPage() {
  const router = useRouter();
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { user, isAuthenticated, checkSession } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check for OAuth session (NextAuth) - these users have verified emails via OAuth provider
  const isOAuthUser = nextAuthStatus === 'authenticated' && nextAuthSession?.user;
  const oAuthEmailConfirmed = (nextAuthSession?.user as { emailConfirmed?: boolean })?.emailConfirmed;

  useEffect(() => {
    // Get email from localStorage first (set during registration), then fallback to session
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (nextAuthSession?.user?.email) {
      setEmail(nextAuthSession.user.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user, nextAuthSession]);

  useEffect(() => {
    // Track email verification status
    // For non-OAuth: check user.emailConfirmed explicitly
    // For OAuth: they are verified by the OAuth provider
    if (user?.emailConfirmed === true) {
      setIsEmailVerified(true);
    } else if (isOAuthUser && oAuthEmailConfirmed === true) {
      // OAuth user with explicit emailConfirmed = true
      setIsEmailVerified(true);
    }
    // Don't set verified for undefined values - that's the pending state
  }, [user, isOAuthUser, oAuthEmailConfirmed]);

  useEffect(() => {
    // Redirect logic for already verified users
    // OAuth users: redirect to onboarding (they don't need email verification)
    if (isOAuthUser) {
      router.push('/onboarding');
      return;
    }
    // Non-OAuth users: only redirect if explicitly verified
    if (isAuthenticated && user?.emailConfirmed === true) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, user, router, isOAuthUser]);

  const resendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Silent fail - don't expose whether email exists
    } finally {
      setIsResending(false);
    }
  };

  const checkVerificationStatus = async () => {
    setIsChecking(true);
    try {
      toast.info('Checking verification status...');
      const result = await checkSession();

      // Use the returned result instead of stale state
      if (result.emailConfirmed) {
        setIsEmailVerified(true);
        toast.success('Email verified! Please log in to continue.');
        
        // Clear the pending verification flag AFTER confirming verification
        // This ends the "active verification flow" so login page can clear stale data
        localStorage.removeItem('pendingVerificationEmail');
        // Also clear sessionStorage tokens - user will get fresh tokens on login
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('businessId');
        
        // Redirect to login page for fresh authenticated session
        router.push('/login');
      } else if (!result.isAuthenticated) {
        // No valid session - token might have expired
        // Clear pending verification so user can re-register if needed
        toast.info('Session expired. Please log in to continue.');
        localStorage.removeItem('pendingVerificationEmail');
        sessionStorage.clear();
        router.push('/login');
      } else {
        toast.error('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch {
      toast.error('Failed to check verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-white border-r border-gray-200">
        {/* Logo */}
        <div>
          <Logo href="/" showText={true} size="lg" variant="default" />
        </div>

        {/* Main content */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2 mb-6">
              <Zap className="size-4 text-brand-orange" />
              <span className="text-sm font-medium text-brand-orange">Email Verification</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              Check Your Inbox
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We&apos;ve sent you a verification link. Click it to activate your account.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              'Secure your account',
              'Access your personalized dashboard',
              'Start qualifying leads with AI',
              'Connect your communication channels',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center size-6 rounded-full bg-green-100">
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
                <span className="text-gray-900 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-gray-600 italic mb-4">
            &ldquo;Qualiflow AI transformed how we handle leads. The AI qualification is spot-on every time.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              AL
            </div>
            <div>
              <p className="font-semibold text-gray-900">Amanda Lee</p>
              <p className="text-sm text-gray-600">VP Sales, TechVentures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[480px] animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo href="/" showText={true} size="lg" variant="default" />
          </div>

          {/* Verification Card */}
          <div className="rounded-2xl border border-border/50 bg-white shadow-elevation-xl">
            <div className="p-8 lg:p-10">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center size-20 rounded-full bg-brand-purple/10">
                  <Mail className="size-10 text-brand-purple" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-text-navy mb-2">
                  Check your email
                </h1>
                <p className="text-text-secondary">
                  We&apos;ve sent a verification link to{' '}
                  <span className="font-semibold text-text-navy">{email || 'your email'}</span>
                </p>
              </div>

              {/* Important Notice */}
              <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 mb-6">
                <p className="text-sm text-warning-dark">
                  <strong>Important:</strong> You need to verify your email before you can access
                  the dashboard. Click the link in your email to continue.
                </p>
              </div>

              {/* Success Message */}
              {resendSuccess && (
                <div className="flex items-center gap-2 text-success text-sm mb-6 p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="size-4" />
                  <span>Verification email sent!</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 mb-6">
                <GradientButton
                  className="w-full"
                  onClick={checkVerificationStatus}
                  disabled={isChecking || isEmailVerified}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : isEmailVerified ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Email verified!
                    </>
                  ) : (
                    "I've verified my email"
                  )}
                </GradientButton>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={resendVerification}
                  disabled={isResending || isEmailVerified}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isEmailVerified ? (
                    'Email already verified'
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </div>

              {/* Links */}
              <div className="space-y-2 text-center text-sm text-text-secondary">
                <p>
                  Wrong email?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('pendingVerificationEmail');
                      sessionStorage.removeItem('accessToken');
                      sessionStorage.removeItem('refreshToken');
                      sessionStorage.removeItem('user');
                      router.push('/register');
                    }}
                    className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors"
                  >
                    Register with a different email
                  </button>
                </p>
                <p>
                  Already verified?{' '}
                  <Link href="/login" className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

