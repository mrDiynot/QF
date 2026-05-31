/**
 * Widget Analytics Type Definitions
 * Track widget performance and user engagement
 */

export interface WidgetMetrics {
  totalConversations: number;
  activeConversations: number;
  avgResponseTime: number; // in seconds
  avgConversationDuration: number; // in seconds
  satisfactionScore: number; // 0-5
  conversionRate: number; // percentage
  totalMessages: number;
  uniqueVisitors: number;
}

export interface ConversationMetrics {
  date: string;
  conversations: number;
  messages: number;
  avgDuration: number;
  satisfactionScore: number;
}

export interface TopicAnalysis {
  topic: string;
  count: number;
  percentage: number;
  avgSatisfaction: number;
}

export interface TimeDistribution {
  hour: number;
  conversations: number;
}

export interface WidgetAnalytics {
  metrics: WidgetMetrics;
  conversationTrend: ConversationMetrics[];
  topTopics: TopicAnalysis[];
  timeDistribution: TimeDistribution[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  sourceBreakdown: {
    direct: number;
    organic: number;
    social: number;
    referral: number;
    paid: number;
  };
}
