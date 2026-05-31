/**
 * AI SMS Template Generation Hook
 * React Query hook for generating SMS templates using AI
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiService } from '@/services/api/ai.service';
import type { GenerateSmsTemplateRequest, GenerateSmsTemplateResponse } from '@/types/ai-sms-templates';

/**
 * Hook to generate SMS templates using AI
 *
 * @example
 * ```tsx
 * const { mutateAsync: generateTemplates, isPending } = useAISmsTemplateGeneration({
 *   onSuccess: (result) => {
 *     console.log('Generated templates:', result.templates);
 *   }
 * });
 *
 * await generateTemplates({
 *   purpose: 'Appointment reminders for dental clinic',
 *   industry: 'Healthcare',
 *   tone: 'Professional',
 *   variationCount: 3,
 * });
 * ```
 */
export function useAISmsTemplateGeneration(options?: {
  onSuccess?: (data: GenerateSmsTemplateResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (request: GenerateSmsTemplateRequest) => aiService.generateSmsTemplates(request),
    onSuccess: (data) => {
      if (data.success && data.templates.length > 0) {
        toast.success(`Generated ${data.templates.length} SMS template${data.templates.length > 1 ? 's' : ''} successfully!`);
        options?.onSuccess?.(data);
      } else if (data.limitExceeded) {
        toast.error('AI generation limit exceeded. Please upgrade your plan.');
      } else {
        toast.error(data.errorMessage || 'Failed to generate SMS templates');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate SMS templates');
      options?.onError?.(error);
    },
  });
}

/**
 * Query keys for AI SMS template generation
 */
export const aiSmsTemplateGenerationKeys = {
  all: ['ai', 'sms-template-generation'] as const,
  generation: () => [...aiSmsTemplateGenerationKeys.all, 'generate'] as const,
};

export default useAISmsTemplateGeneration;

