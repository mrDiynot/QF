/**
 * Channel Types and Interfaces
 * Matches backend DTOs from Qualiflow AIAI.Application.Features.Channels.DTOs
 */

export type ChannelType = 
  | 'SMS' 
  | 'Voice' 
  | 'WhatsApp' 
  | 'Instagram' 
  | 'Facebook' 
  | 'ChatWidget' 
  | 'WebForm' 
  | 'QRCode';

export interface Channel {
  id: string;
  businessId: string;
  type: ChannelType;
  name: string;
  isActive: boolean;
  phoneNumber?: string;
  webhookUrl?: string;
  verificationStatus: 'Pending' | 'Verified' | 'Failed';
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateChannelRequest {
  type: ChannelType;
  name: string;
  phoneNumber?: string;
  configuration?: string;
  externalAccountId?: string;
}

export interface UpdateChannelRequest {
  name?: string;
  isActive?: boolean;
  configuration?: string;
}

export interface ActivateChannelRequest {
  channelType: string;
  displayName?: string;
  phoneNumberOption?: 'existing' | 'new';
  existingPhoneNumber?: string;
}

export interface ActivateChannelResponse {
  success: boolean;
  channelId?: string;
  phoneNumber?: string;
  errorMessage?: string;
  /** Whether OAuth connection is required (for social channels) */
  requiresOAuth?: boolean;
  /** OAuth URL to redirect to for Meta connection */
  oAuthUrl?: string;
}

export interface PendingChannel {
  channelType: string;
  displayName: string;
  requiresPhoneNumber: boolean;
  requiresOAuth: boolean;
  isConfigured: boolean;
}

export interface TwilioAvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export interface TwilioPhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export interface TwilioSubAccount {
  sid: string;
  friendlyName: string;
  status: string;
  dateCreated: string;
}

export interface ChannelMetadata {
  type: ChannelType;
  displayName: string;
  description: string;
  icon: string;
  requiresPhone: boolean;
  requiresOAuth: boolean;
  isAvailable: boolean;
  comingSoon?: boolean;
}

