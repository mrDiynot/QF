'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GradientButton } from '@/components/shared/gradient-button';
import { Logo } from '@/components/shared/logo';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (!tokenParam || !emailParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [searchParams]);

  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword({
    token: token || '',
    email: email || '',
  });

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({ password: data.password, confirmPassword: data.confirmPassword });
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-12 shadow-2xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertCircle className="size-8 text-red-600" />
            </div>
            <h1 className="heading-1 mb-2 text-text-navy">Invalid Link</h1>
            <p className="body-text mb-8 text-gray-text">{error}</p>
            <Link href="/forgot-password">
              <GradientButton className="w-full" showArrow>
                Request New Reset Link
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-12 shadow-2xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-green-bg mb-6">
              <CheckCircle className="size-8 text-success-green" />
            </div>
            <h1 className="heading-1 mb-2 text-text-navy">Password Reset!</h1>
            <p className="body-text mb-8 text-gray-text">
              Your password has been reset successfully. You can now log in.
            </p>
            <Link href="/login">
              <GradientButton className="w-full" showArrow>
                Go to Login
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-white p-12 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <Logo href="/" showText={true} size="lg" variant="default" />
          </div>
          <h1 className="heading-1 mb-2 text-center text-text-navy">Reset Password</h1>
          <p className="body-text mb-8 text-center text-gray-text">
            Enter your new password below
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="small-text text-[#364153]">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" disabled={isPending} className="pl-10 pr-10" {...field} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="small-text text-[#364153]">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" disabled={isPending} className="pl-10 pr-10" {...field} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <GradientButton type="submit" className="w-full" disabled={isPending} showArrow>
                {isPending ? (<><Loader2 className="mr-2 size-4 animate-spin" />Resetting...</>) : 'Reset Password'}
              </GradientButton>
            </form>
          </Form>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-text-muted" />
            <span className="small-text text-text-muted">Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-text-muted" />
            <span className="small-text text-text-muted">Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-indigo-500" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

