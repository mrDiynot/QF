/**
 * Voice Calls React Query Hooks
 * Sprint 37 Feature
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  voiceCallsService,
  type VoiceCallFilters,
  type VoiceInitiateCallRequest,
  type EndCallRequest,
} from '@/services/api/voice-calls.service';
import { useSignalREvent } from '@/hooks/useSignalR';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// SignalR event types for voice calls
interface VoiceCallStartedEvent {
  callId: string;
  conversationId: string;
  leadId: string;
  direction: string;
  phoneNumber: string;
  contactName: string;
  agentName: string;
  status: string;
}

interface VoiceCallEndedEvent {
  callId: string;
  duration: number;
  outcome: string;
  summary: string;
}

interface VoiceTranscriptUpdateEvent {
  callSid: string;
  callId: string;
  speaker: 'user' | 'assistant';
  text: string;
  isFinal: boolean;
  timestamp: string;
}

export interface TranscriptLine {
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFinal: boolean;
}

export const voiceCallsKeys = {
  all: ['voice-calls'] as const,
  list: (filters?: VoiceCallFilters) => [...voiceCallsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...voiceCallsKeys.all, 'detail', id] as const,
  analytics: (from?: string, to?: string) => [...voiceCallsKeys.all, 'analytics', { from, to }] as const,
  transcript: (id: string) => [...voiceCallsKeys.all, 'transcript', id] as const,
};

export function useVoiceCalls(filters?: VoiceCallFilters) {
  return useQuery({
    queryKey: voiceCallsKeys.list(filters),
    queryFn: () => voiceCallsService.getCalls(filters),
    ...queryConfig.realtime, // Voice calls need real-time updates
  });
}

export function useVoiceCall(id: string) {
  return useQuery({
    queryKey: voiceCallsKeys.detail(id),
    queryFn: () => voiceCallsService.getCall(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useVoiceCallAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: voiceCallsKeys.analytics(from, to),
    queryFn: () => voiceCallsService.getAnalytics(from, to),
    ...queryConfig.dashboard,
  });
}

export function useCallTranscript(id: string) {
  return useQuery({
    queryKey: voiceCallsKeys.transcript(id),
    queryFn: () => voiceCallsService.getTranscript(id),
    enabled: !!id,
    ...queryConfig.realtime, // Transcripts update frequently
  });
}

export function useInitiateCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: VoiceInitiateCallRequest) => voiceCallsService.initiateCall(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, voiceCallsKeys.all, [['conversations']]);
    },
  });
}

export function useEndCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request?: EndCallRequest }) =>
      voiceCallsService.endCall(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, voiceCallsKeys.all, [['conversations']]);
    },
  });
}

export function useCallbackCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voiceCallsService.callback(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, voiceCallsKeys.all);
    },
  });
}

/**
 * Hook that subscribes to real-time voice call events via SignalR
 * Automatically invalidates queries when calls start/end
 */
export function useVoiceCallRealtime() {
  const queryClient = useQueryClient();

  const handleCallStarted = useCallback((event: VoiceCallStartedEvent) => {
    console.log('[VoiceCall] Call started:', event);
    queryClient.invalidateQueries({ queryKey: voiceCallsKeys.all });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  const handleCallEnded = useCallback((event: VoiceCallEndedEvent) => {
    console.log('[VoiceCall] Call ended:', event);
    queryClient.invalidateQueries({ queryKey: voiceCallsKeys.all });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  useSignalREvent('VoiceCallStarted', handleCallStarted);
  useSignalREvent('VoiceCallEnded', handleCallEnded);
}

/**
 * Hook that subscribes to real-time voice transcript updates via SignalR
 * Returns transcript lines for a specific call
 */
export function useVoiceTranscriptRealtime(
  callId: string | null,
  onTranscriptUpdate?: (line: TranscriptLine) => void
) {
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);

  const handleTranscriptUpdate = useCallback((event: VoiceTranscriptUpdateEvent) => {
    if (callId && event.callId === callId) {
      const line: TranscriptLine = {
        speaker: event.speaker,
        text: event.text,
        timestamp: event.timestamp,
        isFinal: event.isFinal,
      };
      
      setTranscriptLines(prev => [...prev, line]);
      onTranscriptUpdate?.(line);
      
      console.log('[VoiceCall] Transcript update:', line);
    }
  }, [callId, onTranscriptUpdate]);

  useSignalREvent('VoiceTranscriptUpdate', handleTranscriptUpdate);

  // Reset transcript when call changes
  useEffect(() => {
    setTranscriptLines([]);
  }, [callId]);

  return {
    transcriptLines,
    clearTranscript: () => setTranscriptLines([]),
  };
}
