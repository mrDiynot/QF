// Status tags for leads
export type LeadStatus = 'hot' | 'warm' | 'cold';

// Channel types
export type ChannelType = 'web_chat' | 'facebook' | 'google' | 'phone' | 'email' | 'sms';

// Journey types
export type JourneyType = 'new_lead_booking' | 'missed_call_recovery' | 'review_request' | 'upsell';

// Dashboard metrics
export interface MetricData {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: string;
}

// Recent leads
export interface Lead {
  id: string;
  initials: string;
  name: string;
  status: LeadStatus;
  description: string;
  score: number;
  timeAgo: string;
  channel: ChannelType;
}

// Active journeys
export interface Journey {
  id: string;
  type: JourneyType;
  title: string;
  activeCount: number;
  completedCount: number;
  progress: number;
}

// Pricing plans
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  highlighted?: boolean;
}

// FAQ items
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}