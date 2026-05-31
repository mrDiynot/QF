import axios from 'axios';

// Use the Next.js proxy on client side (avoids CORS), direct URL on server side.
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.qualiflow.ai') + '/api/v1'
  : '/api/proxy';

const chatAxios = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

// Chat API Types
export interface StartChatSessionRequest {
  widgetKey: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  pageUrl?: string;
  referrerUrl?: string;
  preChatFormData?: Record<string, string>;
}

export interface StartChatSessionResponse {
  sessionId: string;
  sessionToken: string;
  greetingMessage?: string;
  enableAIResponses: boolean;
}

export interface SendChatMessageRequest {
  sessionToken: string;
  content: string;
  attachmentUrls?: string[];
}

export interface ChatMessageDto {
  id: string;
  chatSessionId: string;
  content: string;
  type: 'visitor' | 'ai' | 'AI' | 'Visitor' | 'agent' | 'Agent' | 'system' | 'System';
  senderId: string;
  senderName?: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
  attachments?: string[];
  detectedIntent?: string;
  sentimentScore?: number;
}

export interface PublicChatWidgetConfigDto {
  widgetKey: string;
  businessName: string;
  welcomeMessage: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  enableAI: boolean;
  enablePreChatForm: boolean;
  preChatFormFields?: string[];
  offlineMessage?: string;
  isOnline: boolean;
}

// Chat API Client
export const chatApi = {
  /**
   * Get widget configuration
   */
  getWidgetConfig: async (widgetKey: string): Promise<PublicChatWidgetConfigDto | null> => {
    try {
      const response = await chatAxios.get<PublicChatWidgetConfigDto>(
        `/public/chat/widget/${widgetKey}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get widget config:', error);
      return null;
    }
  },

  /**
   * Start a new chat session
   */
  startSession: async (request: StartChatSessionRequest): Promise<StartChatSessionResponse | null> => {
    try {
      const response = await chatAxios.post<StartChatSessionResponse>(
        `/public/chat/sessions`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to start chat session:', error);
      return null;
    }
  },

  /**
   * Send a message in a chat session
   */
  sendMessage: async (request: SendChatMessageRequest): Promise<ChatMessageDto | null> => {
    try {
      const response = await chatAxios.post<ChatMessageDto>(
        `/public/chat/sessions/${request.sessionToken}/messages`,
        { content: request.content, type: 'Visitor', attachmentUrls: request.attachmentUrls }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  },

  /**
   * Get messages for a session
   */
  getMessages: async (sessionToken: string, skip = 0, take = 50): Promise<ChatMessageDto[]> => {
    try {
      const url = `/public/chat/sessions/${sessionToken}/messages`;
      console.log('[getMessages] Calling:', url, { skip, take });
      const response = await chatAxios.get<ChatMessageDto[]>(
        url,
        { params: { skip, take } }
      );
      console.log('[getMessages] Response status:', response.status);
      console.log('[getMessages] Response data length:', response.data?.length);
      console.log('[getMessages] Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  },

  /**
   * End a chat session
   */
  endSession: async (sessionToken: string, reason?: string): Promise<boolean> => {
    try {
      await chatAxios.post(`/public/chat/sessions/end`, {
        sessionToken,
        reason,
      });
      return true;
    } catch (error) {
      console.error('Failed to end session:', error);
      return false;
    }
  },

  /**
   * Poll for AI response with improved reliability
   * Polls until an AI response is received or timeout
   */
  pollForAIResponse: async (
    sessionToken: string,
    afterTimestamp: Date,
    maxAttempts = 15,
    intervalMs = 1500
  ): Promise<ChatMessageDto | null> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        
        const messages = await chatApi.getMessages(sessionToken, 0, 30);
        const aiResponse = messages.find(m => 
          (m.type === 'ai' || m.type === 'AI') && 
          new Date(m.sentAt) > afterTimestamp
        );

        if (aiResponse) {
          return aiResponse;
        }
      } catch (error) {
        console.warn(`Poll attempt ${attempt + 1} failed:`, error);
      }
    }
    return null;
  },

  /**
   * Check if backend is available
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await chatAxios.get(`/health`, { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
