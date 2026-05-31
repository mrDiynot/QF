import { apiClient } from '@/lib/axios';

// ============================================================================
// Voice Calls Types
// ============================================================================

export interface VoiceCallDetail {
  id: string;
  voiceAgentId?: string;
  agentName?: string;
  leadId?: string;
  conversationId?: string;
  contactName: string;
  phoneNumber: string;
  direction: string;
  status: string;
  outcome?: string;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  transcript?: string;
  recordingUrl?: string;
  sentimentScore?: number;
}

export interface CallbackRequest {
  voiceAgentId?: string;
}

export interface VoiceCallListResponse {
  calls: VoiceCallDetail[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VoiceInitiateCallRequest {
  voiceAgentId: string;
  phoneNumber: string;
  fromPhoneNumber?: string;
  contactName?: string;
  leadId?: string;
  contactId?: string;
}

export interface VoicePreviewRequest {
  text: string;
  voiceType?: string;
  speed?: number;
}

export interface VoiceOption {
  id: string;
  displayName: string;
  gender: string;
  description: string;
}

export interface EndCallRequest {
  outcome?: string;
  transcript?: string;
  notes?: string;
}

export interface OutcomeCount {
  outcome: string;
  count: number;
}

export interface DirectionCount {
  direction: string;
  count: number;
}

export interface DailyCallCount {
  date: string;
  count: number;
  duration: number;
}

export interface VoiceCallAnalytics {
  totalCalls: number;
  completedCalls: number;
  successRate: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  byOutcome: OutcomeCount[];
  byDirection: DirectionCount[];
  dailyTrend: DailyCallCount[];
  periodStart: string;
  periodEnd: string;
}

export interface CallTranscriptResponse {
  callId: string;
  transcript?: string;
  duration: number;
}

export interface VoiceCallFilters {
  page?: number;
  pageSize?: number;
  direction?: string;
  status?: string;
  agentId?: string;
  from?: string;
  to?: string;
}

// ============================================================================
// Voice Calls Service
// ============================================================================

export const voiceCallsService = {
  getCalls: async (filters: VoiceCallFilters = {}): Promise<VoiceCallListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.status) params.append('status', filters.status);
    if (filters.agentId) params.append('agentId', filters.agentId);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    
    const { data } = await apiClient.get<VoiceCallListResponse>(`/voice-calls?${params}`);
    return data;
  },

  getCall: async (id: string): Promise<VoiceCallDetail> => {
    const { data } = await apiClient.get<VoiceCallDetail>(`/voice-calls/${id}`);
    return data;
  },

  initiateCall: async (request: VoiceInitiateCallRequest): Promise<VoiceCallDetail> => {
    const { data } = await apiClient.post<VoiceCallDetail>('/voice-calls/initiate', request);
    return data;
  },

  endCall: async (id: string, request?: EndCallRequest): Promise<VoiceCallDetail> => {
    const { data } = await apiClient.post<VoiceCallDetail>(`/voice-calls/${id}/end`, request || {});
    return data;
  },

  getAnalytics: async (from?: string, to?: string): Promise<VoiceCallAnalytics> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const { data } = await apiClient.get<VoiceCallAnalytics>(`/voice-calls/analytics?${params}`);
    return data;
  },

  getTranscript: async (id: string): Promise<CallTranscriptResponse> => {
    const { data } = await apiClient.get<CallTranscriptResponse>(`/voice-calls/${id}/transcript`);
    return data;
  },

  callback: async (id: string, request?: CallbackRequest): Promise<VoiceCallDetail> => {
    const { data } = await apiClient.post<VoiceCallDetail>(`/voice-calls/${id}/callback`, request || {});
    return data;
  },

  // Voice Preview APIs
  getVoiceOptions: async (): Promise<VoiceOption[]> => {
    const { data } = await apiClient.get<VoiceOption[]>('/voice-preview/voices');
    return data;
  },

  generateVoicePreview: async (request: VoicePreviewRequest): Promise<Blob> => {
    const response = await apiClient.post('/voice-preview/generate', request, {
      responseType: 'blob',
    });
    return response.data;
  },

  getVoiceSample: async (voiceType: string): Promise<Blob> => {
    const response = await apiClient.get(`/voice-preview/sample/${encodeURIComponent(voiceType)}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default voiceCallsService;
