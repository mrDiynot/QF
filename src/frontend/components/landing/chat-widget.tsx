'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, Minus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHAT_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
const WIDGET_KEY = 'coming-soon-widget';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  sessionToken: string;
  greetingMessage: string;
  enableAIResponses: boolean;
}

interface ChatMessageResponse {
  id: string;
  content: string;
  type: 'Visitor' | 'AI' | 'Agent';
  sentAt: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  // Initialize chat session when widget opens
  const initializeSession = useCallback(async () => {
    if (session || isInitializing) return;
    setIsInitializing(true);
    
    try {
      const response = await fetch(`${CHAT_API_BASE}/api/v1/public/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetKey: WIDGET_KEY, pageUrl: window.location.href }),
      });
      
      if (response.ok) {
        const data: ChatSession = await response.json();
        setSession(data);
        if (data.greetingMessage) {
          setMessages([{
            id: 'greeting',
            text: data.greetingMessage,
            isBot: true,
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setMessages([{
        id: 'error',
        text: "Hi! 👋 I'm Qualiflow AI's AI assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsInitializing(false);
    }
  }, [session, isInitializing]);

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!session?.sessionToken) return;
    
    try {
      const response = await fetch(
        `${CHAT_API_BASE}/api/v1/public/chat/sessions/${session.sessionToken}/messages?skip=0&take=50`
      );
      
      if (response.ok) {
        const apiMessages: ChatMessageResponse[] = await response.json();
        
        // Only update if we have new messages
        if (apiMessages.length > lastMessageCountRef.current) {
          lastMessageCountRef.current = apiMessages.length;
          
          const newMessages: Message[] = apiMessages.map((m) => ({
            id: m.id,
            text: m.content,
            isBot: m.type === 'AI' || m.type === 'Agent',
            timestamp: new Date(m.sentAt),
          }));
          
          // Prepend greeting if exists
          if (session.greetingMessage) {
            const hasGreeting = newMessages.some(m => m.id === 'greeting');
            if (!hasGreeting) {
              newMessages.unshift({
                id: 'greeting',
                text: session.greetingMessage,
                isBot: true,
                timestamp: new Date(0),
              });
            }
          }
          
          setMessages(newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
          
          // Check if latest message is from AI (stop typing indicator)
          const latestApiMessage = apiMessages[apiMessages.length - 1];
          if (latestApiMessage?.type === 'AI') {
            setIsTyping(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to poll messages:', error);
    }
  }, [session]);

  // Start/stop polling based on typing state
  useEffect(() => {
    if (isTyping && session?.sessionToken) {
      pollingRef.current = setInterval(pollMessages, 1500);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isTyping, session, pollMessages]);

  // Hide notification when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
      initializeSession();
    }
  }, [isOpen, initializeSession]);

  // Auto-show notification after 5 seconds on page
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowNotification(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Send message to backend API
    if (session?.sessionToken) {
      try {
        await fetch(`${CHAT_API_BASE}/api/v1/public/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: session.sessionToken,
            content: messageContent,
          }),
        });
        // Polling will pick up the AI response
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsTyping(false);
        setMessages((prev) => [...prev, {
          id: `error-${Date.now()}`,
          text: "Sorry, I couldn't process your message. Please try again.",
          isBot: true,
          timestamp: new Date(),
        }]);
      }
    } else {
      // Fallback if no session
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] transition-all duration-300 transform',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Qualiflow AI AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-xs">Online • Replies instantly</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                {isMinimized ? <ChevronDown className="size-4 text-white" /> : <Minus className="size-4 text-white" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages - Hidden when minimized */}
          <div className={cn(
            "h-[320px] overflow-y-auto p-4 space-y-4 bg-muted/20 transition-all duration-300",
            isMinimized && "hidden"
          )}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.isBot ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    message.isBot
                      ? 'bg-white border border-border text-foreground/80 rounded-bl-md'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-full border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="size-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
              Powered by Qualiflow AI AI • This is a demo
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
          isOpen
            ? 'bg-gray-900 hover:bg-gray-800'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 animate-bounce'
        )}
        style={{ animationDuration: isOpen ? '0s' : '2s' }}
      >
        {isOpen ? (
          <X className="size-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="size-6 text-white" />
            <Sparkles className="absolute -top-1 -right-1 size-3 text-yellow-300" />
          </div>
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && showNotification && (
        <div className="fixed bottom-[72px] right-6 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg border border-border px-4 py-2 max-w-[200px] relative">
            <button
              onClick={() => setShowNotification(false)}
              className="absolute -top-2 -right-2 size-5 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors border border-border"
              aria-label="Close notification"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground">
              👋 Hi! Need help? Chat with our AI assistant!
            </p>
          </div>
          <div className="absolute -bottom-1 right-4 size-2 bg-white border-r border-b border-border transform rotate-45" />
        </div>
      )}
    </>
  );
}
