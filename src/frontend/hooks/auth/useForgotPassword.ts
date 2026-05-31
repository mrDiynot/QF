/**
 * Forgot password hook
 * Handles password reset request
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { publicApiClient, handleApiError } from '@/lib/axios';
import { ForgotPasswordFormData } from '@/lib/validations/auth';

interface ForgotPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useForgotPassword = (options?: ForgotPasswordOptions) => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await publicApiClient.post(
        'auth/forgot-password',
        { email: data.email }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = handleApiError(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
};