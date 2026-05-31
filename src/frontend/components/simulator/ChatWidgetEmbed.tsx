'use client';

/**
 * Chat Widget Embed Component
 * Embeddable chat widget for testing
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type ThemeMode = 'light' | 'dark';
type Position = 'bottom-right' | 'bottom-left';

interface ChatWidgetEmbedProps {
  theme: ThemeMode;
  position?: Position;
  primaryColor?: string;
  welcomeMessage?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
}

const mockResponses = [
  "Hi there! 👋 I'm your AI assistant. How can I help you today?",
  "That's a great question! Let me help you with that.",
  "I understand. Could you tell me a bit more about what you're looking for?",
  "Absolutely! I'd be happy to assist you with that.",
  "Let me check on that for you. One moment please...",
  "Based on what you've told me, I'd recommend our Professional plan. Would you like me to connect you with our sales team?",
];

export function ChatWidgetEmbed({
  theme,
  position = 'bottom-right',
  primaryColor = '#8b5cf6',
  welcomeMessage = "Hi! 👋 How can we help you today?",
}: ChatWidgetEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'delivered' } : m
        )
      );
    }, 500);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const positionClasses = position === 'bottom-right' ? 'right-4' : 'left-4';

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110',
          positionClasses,
          isOpen && 'scale-0 opacity-0'
        )}
        style={{ backgroundColor: primaryColor }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          1
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-4 z-50 transition-all duration-300 ease-out',
          positionClasses,
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
          isMinimized ? 'h-14' : 'h-[500px]'
        )}
        style={{ width: '380px' }}
      >
        <div className={cn(
          'h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden border',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}>
          {/* Header */}
          <div
            className="shrink-0 px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="text-white">
                <p className="font-semibold text-sm">AI Assistant</p>
                <p className="text-xs text-white/70">Online • Typically replies instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className={cn(
                'flex-1 overflow-y-auto p-4 space-y-4',
                isDark ? 'bg-slate-900' : 'bg-slate-50'
              )}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.sender === 'bot' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback style={{ backgroundColor: primaryColor }} className="text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                        message.sender === 'user'
                          ? 'rounded-br-md text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-200 rounded-bl-md'
                            : 'bg-white text-slate-700 rounded-bl-md shadow-sm'
                      )}
                      style={message.sender === 'user' ? { backgroundColor: primaryColor } : undefined}
                    >
                      {message.content}
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className={isDark ? 'bg-slate-700' : 'bg-slate-200'}>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2 items-end">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback style={{ backgroundColor: primaryColor }} className="text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'rounded-2xl rounded-bl-md px-4 py-3',
                      isDark ? 'bg-slate-800' : 'bg-white shadow-sm'
                    )}>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={cn(
                'shrink-0 p-4 border-t',
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              )}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn('w-9 h-9 shrink-0', isDark ? 'text-slate-400' : 'text-slate-500')}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className={cn(
                      'flex-1',
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn('w-9 h-9 shrink-0', isDark ? 'text-slate-400' : 'text-slate-500')}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    className="w-9 h-9 shrink-0"
                    style={{ backgroundColor: primaryColor }}
                    disabled={!input.trim()}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </form>
                <p className={cn(
                  'text-[10px] text-center mt-2',
                  isDark ? 'text-slate-600' : 'text-slate-400'
                )}>
                  Powered by Qualiflow AI
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
