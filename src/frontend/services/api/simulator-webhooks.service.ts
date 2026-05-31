/**
 * Simulator Webhooks Service
 * Simulates Twilio webhook calls for testing SMS, Voice, and WhatsApp
 *
 * Includes client-side rate limiting to prevent flooding the backend.
 */

import axios from 'axios';
import { config } from '@/lib/config';
import { checkSimulatorRateLimit } from '@/lib/rate-limiter';
import { apiClient } from '@/lib/axios';

// Get the backend URL from centralized config
const getWebhookBaseUrl = () => {
  return config.api.baseUrl;
};

export interface SimulateSmsRequest {
  from: string;
  to: string;
  body: string;
  fromCity?: string;
  fromState?: string;
  fromCountry?: string;
}

export interface SimulateVoiceRequest {
  from: string;
  to: string;
  callerCity?: string;
  callerState?: string;
  callerCountry?: string;
}

export interface SimulateWhatsAppRequest {
  from: string;
  to: string;
  body: string;
  profileName?: string;
}

export interface TwilioWebhookResult {
  success: boolean;
  twimlResponse?: string;
  error?: string;
}

export interface ProvisionedNumber {
  id: string;
  phoneNumber: string;
  friendlyName: string;
  channelType: string;
  isActive: boolean;
}

// Generate a fake Twilio SID
const generateMessageSid = () => `SM${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
const generateCallSid = () => `CA${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
const generateAccountSid = () => `AC${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();

export const simulatorWebhooksService = {
  /**
   * Get provisioned phone numbers for the business
   * These are the numbers that can receive inbound messages
   */
  getProvisionedNumbers: async (): Promise<ProvisionedNumber[]> => {
    try {
      const response = await apiClient.get<ProvisionedNumber[]>('/channels/type/SMS');
      return response.data;
    } catch (error) {
      console.error('Error fetching provisioned numbers:', error);
      return [];
    }
  },

  /**
   * Simulate an inbound SMS message
   * Calls the Twilio webhook endpoint with a mock payload
   * Rate limited to 10 requests per minute
   */
  simulateInboundSms: async (request: SimulateSmsRequest): Promise<TwilioWebhookResult> => {
    // Check rate limit before proceeding
    const rateLimit = checkSimulatorRateLimit('sms');
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetIn / 1000)} seconds before sending another SMS.`,
      };
    }

    try {
      // Format phone numbers (ensure they have + prefix)
      const fromNumber = request.from.startsWith('+') ? request.from : `+${request.from.replace(/\D/g, '')}`;
      const toNumber = request.to.startsWith('+') ? request.to : `+${request.to.replace(/\D/g, '')}`;

      // Build form data matching Twilio's webhook format
      const formData = new URLSearchParams();
      formData.append('MessageSid', generateMessageSid());
      formData.append('AccountSid', generateAccountSid());
      formData.append('From', fromNumber);
      formData.append('To', toNumber);
      formData.append('Body', request.body);
      formData.append('NumMedia', '0');
      if (request.fromCity) formData.append('FromCity', request.fromCity);
      if (request.fromState) formData.append('FromState', request.fromState);
      if (request.fromCountry) formData.append('FromCountry', request.fromCountry);

      // Call the webhook endpoint directly (bypasses auth since webhooks are anonymous)
      const response = await axios.post(
        `${getWebhookBaseUrl()}/api/v1/webhooks/twilio/sms`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        twimlResponse: response.data,
      };
    } catch (error: unknown) {
      console.error('Error simulating inbound SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Simulate an inbound voice call
   * Calls the Twilio voice webhook endpoint
   * Rate limited to 5 requests per minute
   */
  simulateInboundVoice: async (request: SimulateVoiceRequest): Promise<TwilioWebhookResult> => {
    // Check rate limit before proceeding
    const rateLimit = checkSimulatorRateLimit('voice');
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetIn / 1000)} seconds before making another call.`,
      };
    }

    try {
      const fromNumber = request.from.startsWith('+') ? request.from : `+${request.from.replace(/\D/g, '')}`;
      const toNumber = request.to.startsWith('+') ? request.to : `+${request.to.replace(/\D/g, '')}`;

      const formData = new URLSearchParams();
      formData.append('CallSid', generateCallSid());
      formData.append('AccountSid', generateAccountSid());
      formData.append('From', fromNumber);
      formData.append('To', toNumber);
      formData.append('CallStatus', 'ringing');
      formData.append('Direction', 'inbound');
      if (request.callerCity) formData.append('CallerCity', request.callerCity);
      if (request.callerState) formData.append('CallerState', request.callerState);
      if (request.callerCountry) formData.append('CallerCountry', request.callerCountry);

      const response = await axios.post(
        `${getWebhookBaseUrl()}/api/v1/webhooks/twilio/voice`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        twimlResponse: response.data,
      };
    } catch (error: unknown) {
      console.error('Error simulating inbound voice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Simulate an inbound WhatsApp message
   * Calls the Twilio WhatsApp webhook endpoint
   * Rate limited to 10 requests per minute
   */
  simulateInboundWhatsApp: async (request: SimulateWhatsAppRequest): Promise<TwilioWebhookResult> => {
    // Check rate limit before proceeding
    const rateLimit = checkSimulatorRateLimit('whatsapp');
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetIn / 1000)} seconds before sending another WhatsApp message.`,
      };
    }

    try {
      // WhatsApp numbers have "whatsapp:" prefix
      const fromNumber = request.from.startsWith('whatsapp:')
        ? request.from
        : `whatsapp:${request.from.startsWith('+') ? request.from : `+${request.from.replace(/\D/g, '')}`}`;
      const toNumber = request.to.startsWith('whatsapp:')
        ? request.to
        : `whatsapp:${request.to.startsWith('+') ? request.to : `+${request.to.replace(/\D/g, '')}`}`;

      const formData = new URLSearchParams();
      formData.append('MessageSid', generateMessageSid());
      formData.append('AccountSid', generateAccountSid());
      formData.append('From', fromNumber);
      formData.append('To', toNumber);
      formData.append('Body', request.body);
      formData.append('NumMedia', '0');
      if (request.profileName) formData.append('ProfileName', request.profileName);

      const response = await axios.post(
        `${getWebhookBaseUrl()}/api/v1/webhooks/twilio/whatsapp`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        twimlResponse: response.data,
      };
    } catch (error: unknown) {
      console.error('Error simulating inbound WhatsApp:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Send an outbound SMS via the Messages API
   */
  sendOutboundSms: async (to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
      const response = await apiClient.post('/Messages', {
        channelType: 'SMS',
        to,
        content: body,
      });
      return {
        success: true,
        messageId: response.data.id,
      };
    } catch (error: unknown) {
      console.error('Error sending outbound SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
