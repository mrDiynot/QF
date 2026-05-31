'use client';

/**
 * Forgot password form component
 * Request password reset email
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { GradientButton } from '@/components/shared/gradient-button';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export function ForgotPasswordForm() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-green-bg">
          <CheckCircle className="size-8 text-success-green" />
        </div>
        <div>
          <h3 className="heading-3 text-text-navy">Check your email</h3>
          <p className="body-text mt-2 text-gray-text">
            We&apos;ve sent a password reset link to your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="small-text text-[#364153]">Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isPending}
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-text">
                Enter the email address associated with your account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <GradientButton type="submit" className="w-full" disabled={isPending} showArrow>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </GradientButton>
      </form>
    </Form>
  );
}