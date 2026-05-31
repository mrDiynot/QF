'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { adminAuthService } from '@/services/api/admin.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAdminLogin } from '@/hooks/admin/useAdminAuth';
import { AdminAuthError, SessionReasonBanner } from '@/components/admin/AdminAuthError';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginMutation = useAdminLogin();

  // Determine the landing page based on role
  const getLandingPage = (role?: string) => {
    if (role === 'ContentAdmin') return '/admin/cms';
    return '/admin';
  };

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (adminAuthService.isAuthenticated()) {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      // If user must change password, redirect to change-password instead of landing page
      if (user?.mustChangePassword) {
        router.replace('/admin/change-password');
      } else {
        router.replace(getLandingPage(user?.role));
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await loginMutation.mutateAsync({ email, password });

      if (result.requiresMfaSetup && result.mfaSetupToken) {
        setSuccessMessage('Credentials verified. Redirecting to MFA setup…');
        router.push(`/admin/setup-mfa?session=${encodeURIComponent(result.mfaSetupToken)}`);
      } else if (result.requires2FA) {
        setSuccessMessage('Credentials verified. Redirecting to 2FA verification…');
        router.push(`/admin/verify-mfa?adminId=${result.adminId}`);
      } else if (result.requiresPasswordChange) {
        setSuccessMessage('Password change required. Redirecting…');
        router.push('/admin/change-password');
      } else if (result.tokens && result.profile) {
        const landingPage = getLandingPage(result.profile.role);
        setSuccessMessage(`Welcome back, ${result.profile.fullName}. Redirecting…`);
        // Short delay so user sees the success message
        setTimeout(() => { window.location.href = landingPage; }, 600);
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh">
      <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
        {/* Left Panel - Light brand illustration */}
        <div className="lg:block hidden flex-1 overflow-hidden relative z-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-r border-gray-200">

          {/* Giant tilted watermark logo — pushed behind everything */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/qualiflow-logo-full-v8.jpg"
              alt=""
              aria-hidden="true"
              className="w-[600px] h-auto opacity-[0.03] rotate-[8deg] scale-110 blur-[2px] select-none"
            />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 max-w-[520px] pt-20 ps-20">
            {/* Logo in a card — matching the floating card design */}
            <Link href="/" className="mb-8 inline-block group">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-gray-200/80 inline-block transform -rotate-2 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105 animate-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/qualiflow-logo-full-v8.jpg"
                  alt="Qualiflow AI"
                  className="h-10 w-auto"
                />
              </div>
            </Link>
            <h1 className="text-[40px] leading-[48px] text-gray-600">
              Manage your
              <span className="text-gray-900 font-bold block mt-2">
                Platform with Confidence
              </span>
            </h1>
            <p className="text-gray-500 mt-4 text-lg max-w-md">
              Access the Qualiflow AI administration panel to monitor businesses,
              manage subscriptions, and provide excellent customer support.
            </p>
          </div>

          {/* Decorative Elements - Subtle gradient wave */}
          <div className="absolute left-0 bottom-0 w-full h-[60%] z-[1]">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-50/40 via-transparent to-transparent" />
            <svg
              className="absolute bottom-0 left-0 w-full h-auto opacity-15"
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#gradient)"
                d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F39F6" />
                  <stop offset="50%" stopColor="#FF6900" />
                  <stop offset="100%" stopColor="#4F39F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Cards — positioned to avoid overlapping text content */}
          <div className="absolute right-8 top-[18%] transform rotate-6 z-20 animate-float">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/80 w-48">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#FF6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MRR Growth</p>
                  <p className="text-lg font-bold text-gray-900">+24.5%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-12 bottom-[18%] transform -rotate-3 z-20 animate-float" style={{ animationDelay: '1s' }}>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/80 w-52">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Businesses</p>
                  <p className="text-lg font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extra floating card — bottom-left for visual balance */}
          <div className="absolute left-16 bottom-[12%] transform rotate-3 z-20 animate-float" style={{ animationDelay: '2s' }}>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/80 w-44">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="text-lg font-bold text-gray-900">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 relative">
          <div className="h-full flex flex-col bg-white">
            <div className="max-w-[480px] md:px-12 md:py-16 p-8 mx-auto w-full h-full flex flex-col justify-center">
              {/* Mobile Logo */}
              <div className="flex justify-center items-center text-center mb-8 lg:hidden">
                <Link href="/">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/qualiflow-logo-full-v8.jpg"
                    alt="Qualiflow AI"
                    className="h-12 w-auto"
                  />
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-500">
                  Sign in to access the admin dashboard
                </p>
              </div>

              {/* Session Reason (e.g., idle timeout redirect) */}
              <SessionReasonBanner reason={sessionReason} />

              {/* Success State */}
              {successMessage && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Error Alert - surfaces full backend response */}
              {!!error && !successMessage && (
                <div className="mb-6">
                  <AdminAuthError error={error} fallbackMessage="Invalid credentials. Please try again." />
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@qualiflow.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                    className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6900] focus:ring-[#FF6900]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                      className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6900] focus:ring-[#FF6900]/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-[#FF6900] data-[state=checked]:border-[#FF6900]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                      Keep me signed in
                    </Label>
                  </div>
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-[#FF6900] hover:text-orange-600 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#FF6900] hover:bg-orange-600 text-white font-medium transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                  This is a restricted area. Unauthorized access is prohibited.
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-400 pb-8 text-center">
              © {new Date().getFullYear()} Qualiflow AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6900]" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
