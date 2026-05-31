import { apiClient } from '@/lib/axios';

export interface TwilioAvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality?: string;
  region?: string;
  voiceEnabled: boolean;
  smsEnabled: boolean;
  mmsEnabled: boolean;
}

export interface TwilioPhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: string;
}

export interface TwilioSubAccount {
  accountSid: string;
  friendlyName: string;
  status: string;
}

export interface TwilioStatus {
  isTestMode: boolean;
  testPhoneNumber?: string;
  isDevelopmentMode: boolean;
  skipProvisioning: boolean;
  developmentPhoneNumber?: string;
}

export interface SearchPhoneNumbersParams {
  countryCode?: string;
  areaCode?: string;
  capabilities?: number; // PhoneNumberCapabilities flags
  limit?: number;
}

export const twilioService = {
  /**
   * Search for available Twilio phone numbers
   */
  searchAvailableNumbers: async (params: SearchPhoneNumbersParams): Promise<TwilioAvailableNumber[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.countryCode) queryParams.append('countryCode', params.countryCode);
    if (params.areaCode) queryParams.append('areaCode', params.areaCode);
    if (params.capabilities !== undefined) queryParams.append('capabilities', params.capabilities.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<TwilioAvailableNumber[]>(
      `/channels/twilio/available-numbers?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get Twilio sub-account for the current business
   */
  getSubAccount: async (): Promise<TwilioSubAccount> => {
    const response = await apiClient.get<TwilioSubAccount>('/channels/twilio/sub-account');
    return response.data;
  },

  /**
   * Get provisioned phone numbers for the current business
   */
  getProvisionedNumbers: async (): Promise<TwilioPhoneNumber[]> => {
    const response = await apiClient.get<TwilioPhoneNumber[]>('/channels/twilio/phone-numbers');
    return response.data;
  },

  /**
   * Get Twilio status including test mode indicator
   */
  getStatus: async (): Promise<TwilioStatus> => {
    const response = await apiClient.get<TwilioStatus>('/channels/twilio/status');
    return response.data;
  },
};

// PhoneNumberCapabilities enum (matches backend)
export enum PhoneNumberCapabilities {
  None = 0,
  Voice = 1,
  SMS = 2,
  MMS = 4,
  Fax = 8,
}

