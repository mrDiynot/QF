/**
 * AI Training React Query Hooks
 * Sprint 37 Feature
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aiTrainingService,
  type QualificationCriteria,
  type UpdateToneRequest,
  type AddTrainingDataRequest,
  type TrainingJobStatus,
  type AITestRequest,
} from '@/services/api/ai-training.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const aiTrainingKeys = {
  all: ['ai-training'] as const,
  config: () => [...aiTrainingKeys.all, 'config'] as const,
  data: (type?: string, limit?: number) => [...aiTrainingKeys.all, 'data', { type, limit }] as const,
  trainingStatus: (jobId: string) => [...aiTrainingKeys.all, 'training-status', jobId] as const,
};

export function useAiTrainingConfig() {
  return useQuery({
    queryKey: aiTrainingKeys.config(),
    queryFn: aiTrainingService.getConfig,
    ...queryConfig.standard,
  });
}

export function useTrainingData(type: string = 'conversations', limit: number = 50) {
  return useQuery({
    queryKey: aiTrainingKeys.data(type, limit),
    queryFn: () => aiTrainingService.getTrainingData(type, limit),
    ...queryConfig.standard,
  });
}

export function useTrainingJobStatus(jobId: string) {
  return useQuery({
    queryKey: aiTrainingKeys.trainingStatus(jobId),
    queryFn: () => aiTrainingService.getTrainingStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 5 seconds while training is in progress
      const data = query.state.data as TrainingJobStatus | undefined;
      return data?.status === 'in_progress' ? 5000 : false;
    },
    staleTime: 5 * 1000, // Short stale time for active jobs
    gcTime: 30 * 1000,
  });
}

export function useUpdateAiTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateToneRequest) => aiTrainingService.updateTone(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, aiTrainingKeys.all, [['ai-readiness']]);
    },
  });
}

export function useUpdateQualificationCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (criteria: QualificationCriteria) =>
      aiTrainingService.updateQualificationCriteria(criteria),
    onSuccess: () => {
      invalidateListQueries(queryClient, aiTrainingKeys.all);
    },
  });
}

export function useAddTrainingData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddTrainingDataRequest) => aiTrainingService.addTrainingData(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, aiTrainingKeys.all);
    },
  });
}

export function useTriggerTraining() {
  return useMutation({
    mutationFn: () => aiTrainingService.triggerTraining(),
  });
}

export function useTestAiModel() {
  return useMutation({
    mutationFn: (request: AITestRequest) => aiTrainingService.testModel(request),
  });
}

export function useUpdateAutoResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => aiTrainingService.updateAutoResponse(enabled),
    onSuccess: () => {
      invalidateListQueries(queryClient, aiTrainingKeys.all, [['ai-readiness']]);
    },
  });
}
