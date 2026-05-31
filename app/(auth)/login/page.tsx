import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { SessionExpiredNotice } from '@/components/auth/SessionExpiredNotice';
import { PaymentPendingNotice } from '@/components/auth/PaymentPendingNotice';
import { ClearSessionOnMount } from '@/components/auth/ClearSessionOnMount';
import { LoginPageBackground } from '@/components/auth/LoginPageBackground';

export const metadata: Metadata = {
  title: 'Login | Qualiflow AI',
  description: 'Sign in to your Qualiflow AI account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ session_expired?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f0620] via-[#1e0a3c] to-[#3b1060] px-4 py-16">
      {/* Animated AI background orbs */}
      <LoginPageBackground />

      {/* Q Logo watermark — same treatment as HeroSection */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden sm:block">
        <Image
          src="/assets/qualiflow-logo_no_text.png"
          alt="Qualiflow AI Logo"
          width={600}
          height={600}
          className="w-[400px] md:w-[600px] h-auto"
        />
      </div>

      {/* Back to home — top left */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white/90 transition-colors group"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        Home
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-3xl bg-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <div className="px-8 pt-9 pb-8 space-y-5">
            <ClearSessionOnMount />

            {/* Logo centered at top of card */}
            <div className="flex justify-center pb-1">
              <Logo href="/" size="md" />
            </div>

            {/* Session / Payment notices */}
            {params.session_expired === 'true' && <SessionExpiredNotice />}
            <PaymentPendingNotice />

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back
              </h1>

              {/* OAuth — directly below heading */}
              <div className="pt-4">
                <OAuthButtons />
              </div>

              <p className="text-sm text-gray-500">
                 
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or continue with email</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Login form */}
            <LoginForm />

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500">
              No account?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#FF5722] hover:text-[#E64A19] transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-green-400" />
            <span className="text-xs font-medium text-white/50">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-green-400" />
            <span className="text-xs font-medium text-white/50">SOC 2 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
