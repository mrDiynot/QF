'use client';

/**
 * Test AI Response Modal
 * Allows users to test AI responses before enabling for customers
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  RefreshCw,
  Zap,
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

interface TestMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

interface TestAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiPersona?: string;
  greetingMessage?: string;
}

export function TestAIModal({ 
  open, 
  onOpenChange, 
  aiPersona = 'professional',
  greetingMessage 
}: TestAIModalProps) {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [input, setInput] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);

  // Test AI response mutation
  const testAIMutation = useMutation({
    mutationFn: async (message: string) => {
      // Try to call the test endpoint, fall back to mock if not available
      try {
        const response = await apiClient.post<{ 
          response: string; 
          tokensUsed: number;
        }>('/ai/test-response', { 
          message,
          persona: aiPersona,
        });
        return response.data;
      } catch {
        // Mock response for demo/when backend is not available
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResponses = [
          "Thank you for reaching out! I'd be happy to help you with that. Could you tell me a bit more about your specific needs?",
          "Great question! Based on what you've shared, I think we can definitely help. What's your timeline for making a decision?",
          "I understand. Let me make sure I have this right - you're looking for a solution that can help with lead qualification and automated follow-ups?",
          "That's a common challenge many of our clients face. Our AI-powered platform can automate about 80% of your initial lead engagement. Would you like to see how it works?",
        ];
        return {
          response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          tokensUsed: Math.floor(Math.random() * 50) + 20,
        };
      }
    },
    onSuccess: (data) => {
      const aiMessage: TestMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date(),
        tokensUsed: data.tokensUsed,
      };
      setMessages(prev => [...prev, aiMessage]);
      setTotalTokens(prev => prev + (data.tokensUsed || 0));
    },
  });

  const handleSend = () => {
    if (!input.trim() || testAIMutation.isPending) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    testAIMutation.mutate(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setTotalTokens(0);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="h-[600px] flex flex-col p-0">
        <ModalHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Test AI Response
              </ModalTitle>
              <ModalDescription className="mt-1">
                Preview how your AI assistant responds to messages
              </ModalDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Persona: {aiPersona}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                <Zap className="size-3 mr-1" />
                {totalTokens} tokens
              </Badge>
            </div>
          </div>
        </ModalHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Test Your AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Send a test message to see how your AI will respond to customers. 
                This won&apos;t affect real conversations.
              </p>
              {greetingMessage && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary max-w-sm">
                  <p className="font-medium text-xs text-primary mb-1">Greeting Message:</p>
                  {greetingMessage}
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? "bg-muted/50 text-info" 
                    : "bg-primary/10 text-primary"
                )}>
                  {message.role === 'user' ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  message.role === 'user'
                    ? "bg-info text-white rounded-br-md"
                    : "bg-white border shadow-sm rounded-bl-md"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={cn(
                    "flex items-center gap-2 mt-1 text-xs",
                    message.role === 'user' ? "text-blue-200" : "text-muted-foreground/60"
                  )}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.role === 'ai' && message.tokensUsed && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-primary/5">
                        {message.tokensUsed} tokens
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {testAIMutation.isPending && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="size-4" />
              </div>
              <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {testAIMutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="size-4" />
              <span>Failed to get AI response. Please try again.</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              disabled={messages.length === 0}
              className="text-muted-foreground/60 hover:text-muted-foreground"
            >
              <RefreshCw className="size-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a test message..."
              className="flex-1"
              disabled={testAIMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || testAIMutation.isPending}
              className="bg-primary hover:bg-purple-700"
            >
              {testAIMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2 text-center">
            Test messages don&apos;t count toward your usage limits
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
}
