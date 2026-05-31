import { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Logo } from '@/components/shared/logo';
import { Lock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forgot Password | Qualiflow AI',
  description: 'Reset your Qualiflow AI password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 py-12">
      <div className="w-full max-w-md">
        {/* Reset Card */}
        <div className="rounded-2xl border border-border bg-white p-12 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo href="/" showText={true} size="lg" variant="default" />
          </div>

          {/* Title */}
          <h1 className="heading-1 mb-2 text-center text-text-navy">
            Forgot Password?
          </h1>
          <p className="body-text mb-8 text-center text-gray-text">
            No worries, we&apos;ll send you reset instructions
          </p>

          {/* Form */}
          <ForgotPasswordForm />

          {/* Back to Login */}
          <p className="body-text mt-6 text-center text-gray-text">
            Remember your password?{' '}
            <Link href="/login" className="text-brand-orange-alt hover:underline">
              Back to login
            </Link>
          </p>
        </div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-text-muted" />
            <span className="small-text text-text-muted">Secure Login</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-text-muted" />
            <span className="small-text text-text-muted">SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}