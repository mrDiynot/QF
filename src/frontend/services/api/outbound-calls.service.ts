/**
 * Outbound Calls API Service
 */

import { apiClient } from '@/lib/axios';

export interface OutboundCall {
  id: string;
  contactId: string;
  contactName: string;
  phoneNumber: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer';
  direction: 'outbound';
  duration?: number;
  recordingUrl?: string;
  transcription?: string;
  callScriptId?: string;
  notes?: string;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export interface InitiateCallRequest {
  contactId: string;
  phoneNumber: string;
  callScriptId?: string;
  useAiAgent?: boolean;
}

export const outboundCallsService = {
  getCalls: async (params?: { pageNumber?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get<{ items: OutboundCall[]; totalCount: number }>('/OutboundCalls', { params });
    return response.data;
  },

  getCallById: async (id: string) => {
    const response = await apiClient.get<OutboundCall>(`/OutboundCalls/${id}`);
    return response.data;
  },

  initiateCall: async (data: InitiateCallRequest) => {
    const response = await apiClient.post<OutboundCall>('/OutboundCalls', data);
    return response.data;
  },

  endCall: async (id: string) => {
    const response = await apiClient.post<OutboundCall>(`/OutboundCalls/${id}/end`);
    return response.data;
  },

  addNotes: async (id: string, notes: string) => {
    const response = await apiClient.patch<OutboundCall>(`/OutboundCalls/${id}/notes`, { notes });
    return response.data;
  },

  getRecording: async (id: string) => {
    const response = await apiClient.get<{ recordingUrl: string }>(`/OutboundCalls/${id}/recording`);
    return response.data;
  },

  getTranscription: async (id: string) => {
    const response = await apiClient.get<{ transcription: string }>(`/OutboundCalls/${id}/transcription`);
    return response.data;
  },
};
