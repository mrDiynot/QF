import { apiClient } from '@/lib/axios';

export interface VoiceAgent {
  id: string;
  name: string;
  role: string;
  voiceType: string;
  language: string;
  personality: string;
  speakingSpeed: number;
  isActive: boolean;
  callsToday: number;
  successRate: number;
  createdAt: string;
}

export interface VoiceCall {
  id: string;
  voiceAgentId: string;
  agentName: string;
  contactName: string;
  phoneNumber: string;
  direction: string;
  status: string;
  outcome?: string;
  durationSeconds: number;
  duration: string;
  startedAt: string;
  transcript?: string;
  timeAgo: string;
}

export interface VoiceStats {
  totalCalls: number;
  averageDuration: string;
  successRate: number;
  minutesUsed: number;
  activeAgents: number;
}

export interface CreateVoiceAgentRequest {
  name: string;
  role: string;
  voiceType?: string;
  language?: string;
  personality?: string;
  speakingSpeed?: number;
  script?: string;
}

export interface UpdateVoiceAgentRequest {
  name?: string;
  role?: string;
  voiceType?: string;
  language?: string;
  personality?: string;
  speakingSpeed?: number;
  isActive?: boolean;
  script?: string;
}

export const voiceAgentsService = {
  async getAgents(): Promise<VoiceAgent[]> {
    try {
      const response = await apiClient.get<VoiceAgent[]>('/voice-agents');
      return response.data || [];
    } catch (error) {
      console.error('[VoiceAgents] Failed to get agents:', error);
      return [];
    }
  },

  async getStats(): Promise<VoiceStats> {
    try {
      const response = await apiClient.get<VoiceStats>('/voice-agents/stats');
      return response.data || {
        totalCalls: 0,
        averageDuration: '0m 0s',
        successRate: 0,
        minutesUsed: 0,
        activeAgents: 0,
      };
    } catch (error) {
      console.error('[VoiceAgents] Failed to get stats:', error);
      return {
        totalCalls: 0,
        averageDuration: '0m 0s',
        successRate: 0,
        minutesUsed: 0,
        activeAgents: 0,
      };
    }
  },

  async getCalls(limit: number = 20): Promise<VoiceCall[]> {
    try {
      const response = await apiClient.get<VoiceCall[]>(`/voice-agents/calls?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('[VoiceAgents] Failed to get calls:', error);
      return [];
    }
  },

  async createAgent(request: CreateVoiceAgentRequest): Promise<VoiceAgent> {
    // Ensure all required fields are present with defaults
    const payload = {
      name: request.name,
      role: request.role,
      voiceType: request.voiceType || 'Female - Professional',
      language: request.language || 'English (US)',
      personality: request.personality || 'Friendly and Professional',
      speakingSpeed: request.speakingSpeed || 1.0,
      script: request.script || '',
    };
    console.log('[VoiceAgents] Creating agent with payload:', payload);
    const response = await apiClient.post<VoiceAgent>('/voice-agents', payload);
    return response.data;
  },

  async updateAgent(id: string, request: UpdateVoiceAgentRequest): Promise<VoiceAgent> {
    const response = await apiClient.patch<VoiceAgent>(`/voice-agents/${id}`, request);
    return response.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/voice-agents/${id}`);
  },
};
