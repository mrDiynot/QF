/**
 * Web Chat Widget Builder Type Definitions
 * Multi-tenant aware widget configuration types
 */

export interface WidgetAppearance {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  borderRadius: number;
  iconType: 'chat' | 'message' | 'help' | 'support';
  buttonText?: string;
  showBranding: boolean;
}

export interface WidgetBehavior {
  welcomeMessage: string;
  autoOpen: boolean;
  autoOpenDelay: number; // seconds
  showOnPages: string[]; // URL patterns
  hideOnPages: string[]; // URL patterns
  triggerOnScroll: boolean;
  scrollPercentage?: number;
  triggerOnExit: boolean;
  showOfflineMessage: boolean;
  offlineMessage?: string;
}

export interface WidgetAISettings {
  personality: 'friendly' | 'professional' | 'casual' | 'formal';
  responseSpeed: 'instant' | 'natural' | 'slow';
  useEmojis: boolean;
  qualificationEnabled: boolean;
  handoffEnabled: boolean;
  handoffTriggers: string[];
  language: string;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: { // day of week
      enabled: boolean;
      start: string; // HH:mm format
      end: string;
    };
  };
}

export interface WidgetConfig {
  id?: string;
  businessId?: string; // Multi-tenant identifier
  name: string;
  description?: string;
  appearance: WidgetAppearance;
  behavior: WidgetBehavior;
  aiSettings: WidgetAISettings;
  businessHours: BusinessHours;
  isActive: boolean;
  widgetKey?: string; // Public key for embedding
}

export const DEFAULT_APPEARANCE: WidgetAppearance = {
  primaryColor: '#FF6B35',
  position: 'bottom-right',
  size: 'medium',
  borderRadius: 12,
  iconType: 'chat',
  showBranding: true,
};

export const DEFAULT_BEHAVIOR: WidgetBehavior = {
  welcomeMessage: 'Hi! How can we help you today?',
  autoOpen: false,
  autoOpenDelay: 5,
  showOnPages: ['*'],
  hideOnPages: [],
  triggerOnScroll: false,
  triggerOnExit: false,
  showOfflineMessage: true,
  offlineMessage: 'We\'re currently offline. Leave us a message and we\'ll get back to you soon!',
};

export const DEFAULT_AI_SETTINGS: WidgetAISettings = {
  personality: 'friendly',
  responseSpeed: 'natural',
  useEmojis: true,
  qualificationEnabled: true,
  handoffEnabled: true,
  handoffTriggers: ['speak to human', 'talk to agent', 'representative'],
  language: 'en-US',
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  enabled: false,
  timezone: 'America/New_York',
  schedule: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  },
};
