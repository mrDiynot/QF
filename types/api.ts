/**
 * API Types
 * Type definitions for backend API requests and responses
 */

// Common types
export interface PaginatedResponse<T> {
  items: T[];
  // Backend returns TotalItems but JSON serialization converts to camelCase (totalItems)
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  // Conversation-specific totals (optional for other paginated responses)
  totalActive?: number;
  totalClosed?: number;
  totalUnreadCount?: number;
}

export interface ApiError {
  message: string;
  title?: string;
  errors?: Record<string, string[]>;
}

// Analytics types
export interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  totalConversations: number;
  totalMessages: number;
  activeChannels: number;
  conversionRate: number;
  averageResponseTime: number; // in seconds (converted from TimeSpan)
  /** AI-handled conversations: conversations with no human agent assigned */
  aiConversations?: number;
  period?: {
    start: string;
    end: string;
  };
  // Computed/legacy fields for backward compatibility
  activeConversations?: number; // Maps to totalConversations
  bookedAppointments?: number;
  revenue?: number;
  // New overview metrics (from PG database)
  appointmentsBooked?: number;
  proposalsSent?: number;
  proposalsAccepted?: number;
  reviewsCollected?: number;
  missedCallsRecovered?: number;
  smsSent?: number;
  emailsSent?: number;
  socialChats?: number;
}

export interface ConversionFunnel {
  leadsCaptured: number;
  qualified: number;
  contacted: number;
  appointments: number;
  proposalsSent: number;
  closedWon: number;
}

export interface ChannelPerformance {
  channelType: string;
  channelName: string;
  totalConversations: number;
  totalLeads: number;
  totalMessages: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageResponseTime: number; // in seconds (converted from TimeSpan)
  period?: {
    start: string;
    end: string;
  };
  // Legacy field name for backward compatibility
  leadCount?: number; // Maps to totalLeads
}

export interface AIUsageSummary {
  totalOpenAIRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedOpenAICost: number;
  totalSmsInbound: number;
  totalSmsOutbound: number;
  totalVoiceMinutes: number;
  estimatedTwilioCost: number;
  totalEstimatedCost: number;
  operationBreakdown?: Record<string, number>;
}

// Lead types
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  score?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
}

export interface QualifyLeadRequest {
  leadId: string;
  isQualified: boolean;
  notes?: string;
}

// Conversation types
export interface Conversation {
  id: string;
  contactId: string;
  channel: string; // Backend field name
  channelType?: string; // Legacy/alias field
  status: 'active' | 'closed' | 'archived' | 'open';
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  isAIHandling?: boolean;
  assignedAgentId?: string;
  assignedAgentName?: string;
  leadId?: string;
  businessId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  channelType: string;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
  senderType?: 'ai' | 'agent' | 'customer';
  senderName?: string;
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  messageType?: string;
  channelType?: string;
  channel?: string;
  direction?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationNote {
  id: string;
  conversationId: string;
  content: string;
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface Form {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields: FormField[] | string;
  styling?: string;
  status: 'draft' | 'published' | 'archived';
  submissionCount?: number;
  thankYouMessage?: string;
  redirectUrl?: string;
  notifyOnSubmission?: boolean;
  notificationEmails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
  processed: boolean;
}

export interface CreateFormRequest {
  name: string;
  description?: string;
  fields: string; // JSON string
  styling?: string; // JSON string
  slug?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
  notifyOnSubmission?: boolean;
  notificationEmails?: string;
}

// Contact types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  tags: string[];
  score?: number;
  status: 'hot' | 'warm' | 'cold';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
}

// Deal types
export interface Deal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  title: string;
  contactId: string;
  value: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation';
  probability: number;
  expectedCloseDate?: string;
}

export interface PipelineStage {
  stage: string;
  deals: Deal[];
  totalValue: number;
  count: number;
}

// Channel types - matches backend ChannelDto exactly
export type ChannelType = 'None' | 'SMS' | 'Voice' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'ChatWidget' | 'WebForm' | 'QRCode';

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
  /** Channel configuration as JSON string */
  configuration?: string;
  /** External resource ID (e.g., Meta Page ID, Instagram Business Account ID) */
  externalId?: string;
  /** External provider account ID (e.g., Twilio Account SID, Meta App ID) */
  externalAccountId?: string;
  /** Additional metadata as JSON string */
  metadata?: string;
  channelIdentifier?: string;
}

export interface CreateChannelRequest {
  type: string;
  name: string;
  configuration?: Record<string, unknown>;
  channelIdentifier?: string;
  isActive?: boolean;
}

// Onboarding types
export interface OnboardingStatus {
  businessId?: string;
  businessName?: string;
  currentStep: number;
  completedSteps: string[] | number[];
  isComplete: boolean;
  isSkipped: boolean;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  progressPercentage?: number;
}

export interface BusinessProfileRequest {
  businessName: string;
  industry: string;
  companySize: string;
  website?: string;
  phone?: string;
}

export interface ChannelSelectionRequest {
  channels: string[];
}

export interface AiConfigurationRequest {
  scoringCriteria: ScoringCriterion[];
  qualificationThreshold: number;
}

export interface ScoringCriterion {
  name: string;
  weight: number;
  description?: string;
}

// Settings types
export interface BusinessSettings {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  teamSize?: string;
  timezone?: string;
  logoUrl?: string;
  primaryColor?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  allowedEmailDomain?: string;
  enforceEmailDomainRestriction: boolean;
  // AI Configuration
  aiPersona?: 'friendly' | 'professional' | 'casual' | 'formal';
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: string[];
  qualificationThreshold?: number;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  followUpPreference?: 'sms' | 'email' | 'call';
  // Widget Configuration
  widgetPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  widgetWelcomeMessage?: string;
  widgetOfflineMessage?: string;
}

export interface UpdateBusinessSettingsRequest {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  teamSize?: string;
  timezone?: string;
  logoUrl?: string;
  primaryColor?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  allowedEmailDomain?: string;
  enforceEmailDomainRestriction?: boolean;
  // AI Configuration
  aiPersona?: 'friendly' | 'professional' | 'casual' | 'formal';
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: string[];
  qualificationThreshold?: number;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  followUpPreference?: 'sms' | 'email' | 'call';
  // Widget Configuration
  widgetPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  widgetWelcomeMessage?: string;
  widgetOfflineMessage?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  businessId: string;
  businessName: string;
  isActive: boolean;
  isOAuthUser: boolean;
  oAuthProvider?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

// Quick Reply types
export interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
  category?: string;
  usageCount: number;
  createdAt: string;
}

export interface CreateQuickReplyRequest {
  shortcut: string;
  content: string;
  category?: string;
}

// Booking types (if available)
export interface Booking {
  id: string;
  contactId: string;
  title: string;
  startTime: string;
  endTime: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'noshow';
  meetingType?: 'video' | 'phone' | 'in_person';
  leadName?: string;
  leadEmail?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  contactId: string;
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// Subscription types
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
export type BillingInterval = 'monthly' | 'quarterly' | 'yearly';

export interface PlanFeature {
  key: string;
  displayName: string;
  category: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceQuarterly?: number;
  priceYearly?: number;
  discountQuarterly: number;
  discountAnnual: number;
  onboardingPrice?: number;
  onboardingRequired: boolean;
  // Trial settings (configurable via admin CMS)
  allowsTrial: boolean;
  trialDays: number;
  // Feature keys for programmatic access checking (e.g., "webchat", "ai_sms")
  featureKeys: string[];
  // Feature details for UI display
  features: PlanFeature[];
  // Limits as key-value dictionary
  limits: Record<string, string>;
  isPopular?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdQuarterly?: string;
  stripePriceIdYearly?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingInterval?: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  monthlyAmount?: number;
  currency?: string;
  // Feature keys for checking access (from current plan)
  featureKeys?: string[];
  // Plan limits (e.g., maxChannels, maxLeads, maxSeats)
  limits?: Record<string, number>;
  createdAt?: string;
}

export interface SubscriptionUsage {
  aiInteractions: { used: number; limit: number; percentage: number };
  voiceMinutes: { used: number; limit: number; percentage: number };
  smsMessages: { used: number; limit: number; percentage: number };
  teamMembers: { used: number; limit: number; percentage: number };
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingInterval: BillingInterval;
  includeOnboarding?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface BillingPortalResponse {
  portalUrl: string;
}

export interface CheckoutSessionDetails {
  sessionId: string;
  status: string;
  paymentStatus?: string;
  customerEmail?: string;
  businessName?: string;
  planName: string;
  planDisplayName?: string;
  billingInterval: string;
  amountTotal: number;
  currency: string;
  includeOnboarding: boolean;
  onboardingAmount?: number;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  features: string[];
}

// Twilio Settings & Usage types
export interface TwilioSettings {
  businessId: string;
  isConfigured: boolean;
  isTestMode: boolean;
  subAccountSid?: string;
  subAccountStatus?: string;
  subAccountCreatedAt?: string;
  channels: TwilioChannelSummary[];
  message?: string;
  // Computed/derived fields for UI convenience
  hasSubAccount?: boolean;
  totalChannels?: number;
  testModePhoneNumber?: string;
}

export interface TwilioChannelSummary {
  channelId: string;
  type: string;
  phoneNumber: string;
  isActive: boolean;
  verificationStatus: string;
  // Alias for backward compatibility
  id?: string;
}

export interface TwilioUsageSummary {
  subAccountSid: string;
  startDate: string;
  endDate: string;
  sms: TwilioUsageCategory;
  voice: TwilioUsageCategory;
  whatsApp: TwilioUsageCategory;
  totalCost: number;
  currency: string;
}

export interface TwilioUsageCategory {
  inboundCount: number;
  outboundCount: number;
  totalCount: number;
  totalMinutes?: number;
  cost: number;
}