'use client';

/**
 * Email OTP Verification Page
 * Allows users to enter the 6-digit OTP sent to their email
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';
import { GradientButton } from '@/components/shared/gradient-button';
import { Button } from '@/components/ui/button';
import { useVerifyEmailOtp, useResendEmailOtp } from '@/hooks/auth/useVerifyEmailOtp';

export default function VerifyEmailOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || sessionStorage.getItem('pendingOtpEmail') || '';
  const maskedEmail = searchParams.get('maskedEmail') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyEmailOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendEmailOtp();

  // Initialize cooldown from URL params
  useEffect(() => {
    const initialCooldown = parseInt(searchParams.get('cooldown') || '0', 10);
    if (initialCooldown > 0) {
      setCooldown(initialCooldown);
    }
  }, [searchParams]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) return;
    
    verifyOtp({ email, otpCode: code });
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    
    resendOtp({ email }, {
      onSuccess: (data) => {
        setCooldown(data.resendCooldownSeconds);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-navy transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-gray-200">
          {/* Icon */}
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-orange">
            <Mail className="size-8 text-white" />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-text-navy">
            Check your email
          </h1>
          <p className="mb-8 text-center text-text-secondary">
            We sent a verification code to{' '}
            <span className="font-medium text-text-navy">{maskedEmail || email}</span>
          </p>

          {/* OTP Input */}
          <div className="mb-6 flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className="size-12 rounded-lg border-2 border-slate-200 text-center text-xl font-semibold text-text-navy transition-all focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 disabled:opacity-50"
              />
            ))}
          </div>

          {/* Verify Button */}
          <GradientButton
            onClick={() => handleSubmit()}
            disabled={isVerifying || otp.some(d => d === '')}
            className="w-full h-12 text-base font-semibold"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </GradientButton>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Didn&apos;t receive the code?{' '}
              {cooldown > 0 ? (
                <span className="text-text-muted">
                  Resend in {cooldown}s
                </span>
              ) : (
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}
                  className="h-auto p-0 text-sm font-medium text-brand-purple hover:text-brand-purple/80"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-1 size-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend code'
                  )}
                </Button>
              )}
            </p>
          </div>

          {/* Expiration Notice */}
          <p className="mt-4 text-center text-xs text-text-muted">
            Code expires in 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

