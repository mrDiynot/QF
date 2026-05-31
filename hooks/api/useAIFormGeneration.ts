/**
 * AI Form Generation Hook
 * React Query hook for generating forms using AI
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiService } from '@/services/api/ai.service';
import type { GenerateFormRequest, GenerateFormResponse } from '@/types/ai-forms';

/**
 * Hook to generate a form using AI
 * 
 * @example
 * ```tsx
 * const { mutateAsync: generateForm, isPending } = useAIFormGeneration({
 *   onSuccess: (result) => {
 *     console.log('Generated form:', result.form);
 *   }
 * });
 * 
 * await generateForm({
 *   purpose: 'Capture leads for SaaS demo requests',
 *   industry: 'Technology',
 *   includeBantFields: true,
 * });
 * ```
 */
export function useAIFormGeneration(options?: {
  onSuccess?: (data: GenerateFormResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (request: GenerateFormRequest) => aiService.generateForm(request),
    onSuccess: (data) => {
      if (data.success && data.form) {
        toast.success('Form generated successfully!');
        options?.onSuccess?.(data);
      } else if (data.limitExceeded) {
        toast.error('AI generation limit exceeded. Please upgrade your plan.');
      } else {
        toast.error(data.errorMessage || 'Failed to generate form');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate form');
      options?.onError?.(error);
    },
  });
}

/**
 * Query keys for AI form generation
 */
export const aiFormGenerationKeys = {
  all: ['ai', 'form-generation'] as const,
  generation: () => [...aiFormGenerationKeys.all, 'generate'] as const,
};

export default useAIFormGeneration;

