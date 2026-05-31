'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail, Zap } from 'lucide-react';
import { config } from '@/lib/config';
import { GradientButton } from '@/components/shared/gradient-button';
import { Logo } from '@/components/shared/logo';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resent'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');

        // BEST PRACTICE: Don't auto-login after verification
        // User should explicitly login to start a secure session
        // Clear any pending verification data
        localStorage.removeItem('pendingVerificationEmail');
      } else {
        setStatus('error');
        setMessage(data.detail || data.message || 'Verification failed. The link may have expired.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to verify email. Please try again later.');
    }
  };

  const resendVerification = async () => {
    const email = localStorage.getItem('pendingVerificationEmail');
    if (!email) {
      setMessage('Please register again or contact support.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(`${config.api.baseUrl}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('resent');
        setMessage('A new verification email has been sent. Please check your inbox.');
      }
    } catch {
      setMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
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
              Almost There! One More Step
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Verify your email to unlock the full power of AI-driven lead qualification.
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
            &ldquo;The setup was incredibly smooth. Within minutes, I had my first leads being qualified automatically.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              MK
            </div>
            <div>
              <p className="font-semibold text-gray-900">Michael Kim</p>
              <p className="text-sm text-gray-600">Founder, StartupLabs</p>
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
                {status === 'loading' && (
                  <div className="flex items-center justify-center size-20 rounded-full bg-brand-purple/10">
                    <Loader2 className="size-10 text-brand-purple animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="flex items-center justify-center size-20 rounded-full bg-success/10">
                    <CheckCircle2 className="size-10 text-success" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center justify-center size-20 rounded-full bg-error/10">
                    <XCircle className="size-10 text-error" />
                  </div>
                )}
                {status === 'resent' && (
                  <div className="flex items-center justify-center size-20 rounded-full bg-brand-purple/10">
                    <Mail className="size-10 text-brand-purple" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-text-navy mb-2">
                  {status === 'loading' && 'Verifying Email...'}
                  {status === 'success' && 'Email Verified!'}
                  {status === 'error' && 'Verification Failed'}
                  {status === 'resent' && 'Email Sent!'}
                </h1>
                <p className="text-text-secondary">{message}</p>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {status === 'success' && (
                  <>
                    <GradientButton
                      className="w-full"
                      onClick={() => router.push('/login')}
                    >
                      Continue to Login
                    </GradientButton>
                    <p className="text-center text-sm text-gray-600">
                      Please log in to complete your onboarding and access your dashboard.
                    </p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={resendVerification}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                    <div className="text-center text-sm text-text-secondary">
                      <Link href="/register" className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors">
                        Back to Registration
                      </Link>
                    </div>
                  </>
                )}
                {status === 'resent' && (
                  <div className="text-center text-sm text-text-secondary">
                    Didn&apos;t receive the email?{' '}
                    <button
                      onClick={resendVerification}
                      className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors"
                      disabled={isResending}
                    >
                      Send again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

