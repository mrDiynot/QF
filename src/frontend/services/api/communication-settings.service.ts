import { apiClient } from '@/lib/axios';

/**
 * Email settings interface
 */
export interface EmailSettings {
  senderName: string;
  replyToEmail: string;
  signature: string;
}

/**
 * SMS settings interface
 */
export interface SmsSettings {
  defaultSender: string;
  optOutMessage: string;
  enableAutoReply: boolean;
}

/**
 * Voice settings interface
 */
export interface VoiceSettings {
  businessHours: string;
  voicemailEnabled: boolean;
  callForwardingNumber?: string;
}

/**
 * Communication settings response interface
 */
export interface CommunicationSettings {
  email?: EmailSettings;
  sms?: SmsSettings;
  voice?: VoiceSettings;
  updatedAt?: string;
}

/**
 * Update communication settings request interface
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateCommunicationSettingsRequest {
  email?: EmailSettings;
  sms?: SmsSettings;
  voice?: VoiceSettings;
}

/**
 * Communication settings service for managing email, SMS, and voice preferences
 */
export const communicationSettingsService = {
  /**
   * Get communication settings for the current business
   */
  get: async (): Promise<CommunicationSettings> => {
    const response = await apiClient.get<CommunicationSettings>('/communication-settings');
    return response.data;
  },

  /**
   * Update communication settings for the current business
   * Only provided fields will be updated (partial update)
   */
  update: async (settings: UpdateCommunicationSettingsRequest): Promise<CommunicationSettings> => {
    const response = await apiClient.put<CommunicationSettings>('/communication-settings', settings);
    return response.data;
  },
};

