'use client';

/**
 * Login form component
 * Email/password login with validation and error handling
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CapsLockWarning } from '@/components/shared/CapsLockWarning';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GradientButton } from '@/components/shared/gradient-button';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/auth/useLogin';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
   
  };

    
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-text-navy">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
                  <Input  
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isPending}
                    className="h-11 pl-11"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-text-navy">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isPending}
                    className="h-11 pl-11 pr-11"
                    {...field}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={(_e) => {
                      field.onBlur();
                      setPasswordFocused(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-navy transition-colors cursor-pointer"
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" />
                    ) : (
                      <Eye className="size-[18px]" />
                    )}
                  </button>
                </div>
              </FormControl>
              <CapsLockWarning show={passwordFocused} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    className="size-5 rounded cursor-pointer"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal text-text-secondary cursor-pointer">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-purple hover:text-brand-purple/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <GradientButton
          type="submit"
          className="w-full h-12 text-base font-semibold mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </GradientButton>
      </form>
    </Form>
  );
}