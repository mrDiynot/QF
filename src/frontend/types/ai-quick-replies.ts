/**
 * AI Quick Reply Types
 * TypeScript types for AI-powered quick reply suggestions
 */

/**
 * Request to generate quick reply suggestions
 */
export interface QuickReplySuggestionRequest {
  /** The conversation ID to generate replies for */
  conversationId: string;
  /** The last message from the customer */
  lastCustomerMessage: string;
  /** Recent conversation history for context */
  conversationHistory?: ConversationHistoryItem[];
  /** The channel type (sms, whatsapp, webchat, etc.) */
  channelType?: string;
  /** Lead context for personalization */
  leadContext?: LeadContext;
  /** Maximum number of suggestions to return (default: 5) */
  maxSuggestions?: number;
}

/**
 * Conversation history item for context
 */
export interface ConversationHistoryItem {
  /** Message content */
  content: string;
  /** Direction: 'inbound' (customer) or 'outbound' (agent/AI) */
  direction: 'inbound' | 'outbound';
  /** Timestamp of the message */
  timestamp: string;
}

/**
 * Lead context for personalization
 */
export interface LeadContext {
  /** Lead name */
  name?: string;
  /** Lead status */
  status?: string;
  /** Lead score */
  score?: number;
  /** Lead source */
  source?: string;
}

/**
 * Result of quick reply suggestion generation
 */
export interface QuickReplySuggestionResult {
  /** Whether the generation was successful */
  success: boolean;
  /** List of suggested replies */
  suggestions: QuickReplySuggestion[];
  /** Error message if failed */
  errorMessage?: string;
  /** Audit ID for feedback tracking */
  auditId?: string;
  /** Number of tokens used */
  tokensUsed?: number;
  /** Generation time in milliseconds */
  generationTimeMs?: number;
  /** When the suggestions were generated */
  generatedAt?: string;
}

/**
 * Individual quick reply suggestion
 */
export interface QuickReplySuggestion {
  /** The suggested reply text */
  text: string;
  /** Confidence score (0-100) */
  confidence: number;
  /** Category of the reply */
  category: QuickReplyCategory;
  /** Tone of the reply */
  tone: QuickReplyTone;
  /** Whether this is a closing reply */
  isClosing: boolean;
  /** Brief explanation of why this reply is suggested */
  rationale?: string;
}

/**
 * Quick reply categories
 */
export type QuickReplyCategory =
  | 'greeting'
  | 'acknowledgment'
  | 'question'
  | 'information'
  | 'scheduling'
  | 'pricing'
  | 'closing'
  | 'followup'
  | 'objection_handling'
  | 'other';

/**
 * Quick reply tones
 */
export type QuickReplyTone =
  | 'friendly'
  | 'professional'
  | 'empathetic'
  | 'casual'
  | 'formal';

