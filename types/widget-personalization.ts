/**
 * Widget Personalization Type Definitions
 * AI-powered personalization and context awareness
 */

export interface VisitorProfile {
  id: string;
  isReturning: boolean;
  visitCount: number;
  lastVisit?: Date;
  conversationCount: number;
  isQualified: boolean;
  tags: string[];
  customData?: Record<string, unknown>;
}

export interface ContextualGreeting {
  id: string;
  condition: 'new_visitor' | 'returning_visitor' | 'high_value_lead' | 'specific_page' | 'utm_campaign';
  value?: string; // For specific_page or utm_campaign
  greeting: string;
  enabled: boolean;
}

export interface BehaviorTrigger {
  id: string;
  type: 'time_on_page' | 'scroll_depth' | 'exit_intent' | 'inactivity' | 'page_views';
  value: number; // seconds, percentage, or count
  action: 'show_widget' | 'show_message' | 'play_sound';
  message?: string;
  enabled: boolean;
}

export interface PersonalizationSettings {
  enabled: boolean;
  greetings: ContextualGreeting[];
  behaviorTriggers: BehaviorTrigger[];
  trackingEnabled: {
    referrer: boolean;
    utmParams: boolean;
    previousConversations: boolean;
    pageHistory: boolean;
    deviceInfo: boolean;
  };
  enrichmentEnabled: boolean;
  customFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'date';
  }>;
}

export const DEFAULT_PERSONALIZATION: PersonalizationSettings = {
  enabled: false,
  greetings: [
    {
      id: 'default-new',
      condition: 'new_visitor',
      greeting: 'Hi! Welcome to our site. How can we help you today?',
      enabled: true,
    },
    {
      id: 'default-returning',
      condition: 'returning_visitor',
      greeting: 'Welcome back! How can we assist you today?',
      enabled: true,
    },
  ],
  behaviorTriggers: [],
  trackingEnabled: {
    referrer: true,
    utmParams: true,
    previousConversations: true,
    pageHistory: false,
    deviceInfo: true,
  },
  enrichmentEnabled: true,
  customFields: [],
};

// Helper to determine which greeting to show
export const getContextualGreeting = (
  greetings: ContextualGreeting[],
  visitor: VisitorProfile,
  currentPage: string,
  utmParams?: Record<string, string>
): string => {
  const enabledGreetings = greetings.filter(g => g.enabled);

  // Check specific conditions first (more specific)
  for (const greeting of enabledGreetings) {
    switch (greeting.condition) {
      case 'specific_page':
        if (greeting.value && currentPage.includes(greeting.value)) {
          return greeting.greeting;
        }
        break;
      case 'utm_campaign':
        if (greeting.value && utmParams?.utm_campaign === greeting.value) {
          return greeting.greeting;
        }
        break;
      case 'high_value_lead':
        if (visitor.isQualified) {
          return greeting.greeting;
        }
        break;
      case 'returning_visitor':
        if (visitor.isReturning) {
          return greeting.greeting;
        }
        break;
      case 'new_visitor':
        if (!visitor.isReturning) {
          return greeting.greeting;
        }
        break;
    }
  }

  // Fallback to default
  return 'Hi! How can we help you today?';
};

// Check if behavior trigger should fire
export const shouldTriggerBehavior = (
  trigger: BehaviorTrigger,
  metrics: {
    timeOnPage?: number;
    scrollDepth?: number;
    pageViews?: number;
    isExiting?: boolean;
    inactivityTime?: number;
  }
): boolean => {
  if (!trigger.enabled) return false;

  switch (trigger.type) {
    case 'time_on_page':
      return (metrics.timeOnPage || 0) >= trigger.value;
    case 'scroll_depth':
      return (metrics.scrollDepth || 0) >= trigger.value;
    case 'exit_intent':
      return metrics.isExiting || false;
    case 'inactivity':
      return (metrics.inactivityTime || 0) >= trigger.value;
    case 'page_views':
      return (metrics.pageViews || 0) >= trigger.value;
    default:
      return false;
  }
};
