/**
 * Reset password hook
 * Handles password reset with token
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { publicApiClient, handleApiError } from '@/lib/axios';
import { ResetPasswordFormData } from '@/lib/validations/auth';

interface ResetPasswordOptions {
  token: string;
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useResetPassword = (options: ResetPasswordOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await publicApiClient.post(
        'auth/reset-password',
        {
          email: options.email,
          token: options.token,
          newPassword: data.password,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successful. You can now log in.');
      options?.onSuccess?.();
      router.push('/login');
    },
    onError: (error: unknown) => {
      const message = handleApiError(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
};