'use client';

/**
 * Conversation Detail Page
 * Real-time messaging with SignalR integration
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Mic,
  User,
  Bot,
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useConversation, useMessages, useSendMessage, useTakeoverConversation } from '@/hooks/conversations/useConversations';
import { aiService } from '@/services/api/ai.service';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { Switch } from '@/components/ui/switch';
import { useConversationHub } from '@/hooks/useConversationHub';
import { TypingIndicator } from '@/components/conversations/TypingIndicator';
import { MessageStatus } from '@/components/conversations/MessageStatus';
import { QuickReplyChips } from '@/components/conversations/QuickReplyChips';
import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '@/types/api';
// Future components - kept for upcoming feature implementation
// import { FileAttachmentUploader } from '@/components/conversations/FileAttachmentUploader';
// import { InternalNotesPanel } from '@/components/conversations/InternalNotesPanel';

// Format message time
const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
};

// Message bubble component
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  // Determine if message is from AI based on senderType or fallback logic
  const isAI = message.senderType === 'ai' || 
    (message.direction === 'outbound' && !message.senderName);
  const isAgent = message.senderType === 'agent';
  
  return (
    <div className={cn("flex gap-3 mb-4", isOwn && "flex-row-reverse")}>
      {showAvatar && (
        <Avatar className="size-8 flex-shrink-0">
          <AvatarFallback className={cn(
            "text-xs",
            isAI ? "bg-purple-100 text-purple-600" :
            isOwn ? "bg-blue-100 text-blue-600" :
            "bg-gray-100 text-gray-600"
          )}>
            {isAI ? <Bot className="size-4" /> :
             isOwn ? <User className="size-4" /> :
             'C'}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && <div className="size-8 flex-shrink-0" />}
      
      <div className={cn("max-w-[70%]", isOwn && "text-right")}>
        <div className={cn(
          "inline-block px-4 py-2 rounded-2xl",
          isOwn 
            ? "bg-purple-600 text-white rounded-br-md" 
            : isAI
              ? "bg-purple-50 text-gray-900 rounded-bl-md border border-purple-100"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 mt-1 text-xs text-gray-400",
          isOwn && "justify-end"
        )}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            <MessageStatus 
              status={message.isRead ? 'read' : 'delivered'} 
            />
          )}
          {isAI && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-purple-200">
              <Sparkles className="size-2.5 mr-0.5" />
              AI
            </Badge>
          )}
          {isAgent && message.senderName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
              <UserCircle className="size-2.5 mr-0.5" />
              {message.senderName}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const conversationId = params.id as string;
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversation and messages
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(conversationId, { pageSize: 100 });
  const sendMessageMutation = useSendMessage();
  const takeoverMutation = useTakeoverConversation();

  // Subscription enforcement
  const { checkLimit, hasFeature, subscription } = useSubscriptionEnforcement();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Determine if AI is handling the conversation (default to true for new convos)
  const isAIHandling = conversation?.isAIHandling ?? true;

  // Handle takeover toggle
  const handleTakeoverToggle = () => {
    takeoverMutation.mutate({
      conversationId,
      takeControl: isAIHandling, // If AI is handling, take control; if human, release to AI
    });
  };

  // Real-time updates via SignalR
  const handleNewMessage = useCallback((event: { conversationId: string; message: Message }) => {
    if (event.conversationId === conversationId) {
      queryClient.invalidateQueries({ queryKey: ['conversations', 'messages', conversationId] });
    }
  }, [conversationId, queryClient]);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    getTypingUsers,
  } = useConversationHub({
    onNewMessage: handleNewMessage,
  });

  // Join conversation room on mount
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    // Check message limit
    const messageLimit = checkLimit('maxMessages');
    if (!messageLimit.allowed) {
      setUpgradeReason(`You've reached your monthly message limit (${messageLimit.limit} messages). Upgrade to send more messages.`);
      setShowUpgradeDialog(true);
      return;
    }

    // Check AI conversation limit if AI is handling
    if (isAIHandling) {
      const aiFeatureCheck = hasFeature('aiConversations');
      if (!aiFeatureCheck.allowed) {
        setUpgradeReason(aiFeatureCheck.reason || 'AI conversations not available in your plan');
        setShowUpgradeDialog(true);
        return;
      }

      const aiLimit = checkLimit('maxAiConversations');
      if (!aiLimit.allowed) {
        setUpgradeReason(`You've reached your AI conversation limit (${aiLimit.limit}/month). Upgrade for more AI conversations.`);
        setShowUpgradeDialog(true);
        return;
      }
    }

    const content = messageInput.trim();
    setMessageInput('');
    setIsTyping(false);
    sendTypingIndicator(conversationId, false);

    sendMessageMutation.mutate({
      conversationId,
      content,
      channelType: conversation?.channelType || 'webchat',
    });
  };

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate AI suggested response
  const handleGenerateSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    setSuggestedResponse(null);
    try {
      const result = await aiService.suggestResponse({
        conversationId,
        tone: 'professional',
      });
      setSuggestedResponse(result.suggestedResponse);
      setMessageInput(result.suggestedResponse);
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const typingUsers = getTypingUsers(conversationId);
  const messages = messagesData?.items || [];
  const isLoading = isLoadingConversation || isLoadingMessages;

  // Get the last customer message for quick reply suggestions
  const lastCustomerMessage = messages
    .filter((m: Message) => m.direction === 'inbound')
    .slice(-1)[0]?.content || '';

  // Build conversation history for quick replies (last 5 messages)
  const conversationHistory = messages.slice(-5).map((m: Message) => ({
    content: m.content,
    direction: m.direction as 'inbound' | 'outbound',
    timestamp: m.createdAt,
  }));

  // Handle quick reply selection
  const handleQuickReplySelect = (text: string) => {
    setMessageInput(text);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("flex gap-3", i % 2 === 0 && "justify-end")}>
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-16 w-64 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="size-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation Not Found</h2>
          <p className="text-gray-500 mb-6">This conversation doesn&apos;t exist or has been deleted.</p>
          <Button onClick={() => router.push('/conversations')}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Conversations
          </Button>
        </Card>
      </div>
    );
  }

  const contactName = `Contact ${conversation.contactId?.slice(-4) || ''}`;
  const contactInitials = contactName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <Avatar className="size-10">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {contactInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">{contactName}</h2>
              {isConnected && (
                <span className="size-2 rounded-full bg-green-500" title="Connected" />
              )}
            </div>
            <p className="text-xs text-gray-500 capitalize">
              via {conversation.channelType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Human Takeover Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border shadow-sm">
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              isAIHandling ? "text-purple-600" : "text-gray-400"
            )}>
              <Bot className="size-3.5" />
              <span>AI</span>
            </div>
            <Switch
              checked={!isAIHandling}
              onCheckedChange={handleTakeoverToggle}
              disabled={takeoverMutation.isPending}
              className="data-[state=checked]:bg-blue-600"
            />
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              !isAIHandling ? "text-blue-600" : "text-gray-400"
            )}>
              <User className="size-3.5" />
              <span>You</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="size-5" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Contact</DropdownMenuItem>
              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
              <DropdownMenuItem>Assign to Agent</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="size-12 mb-4 text-gray-300" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: Message, index: number) => {
            const isOwn = message.direction === 'outbound';
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || prevMessage.direction !== message.direction;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 mb-4">
            <Avatar className="size-8">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {contactInitials}
              </AvatarFallback>
            </Avatar>
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions */}
      {lastCustomerMessage && !isAIHandling && (
        <QuickReplyChips
          conversationId={conversationId}
          lastCustomerMessage={lastCustomerMessage}
          conversationHistory={conversationHistory}
          channelType={conversation?.channelType || conversation?.channel}
          onSelectReply={handleQuickReplySelect}
          enableKeyboardShortcuts={true}
        />
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        {/* AI Suggested Response Banner */}
        {suggestedResponse && (
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-purple-700 mb-1">AI Suggested Response</p>
                  <p className="text-sm text-gray-700">{suggestedResponse}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSuggestedResponse(null)}
                className="text-gray-400 hover:text-gray-600 h-6 px-2"
              >
                ×
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <Paperclip className="size-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "transition-colors",
              isGeneratingSuggestion 
                ? "text-purple-500" 
                : "text-gray-400 hover:text-purple-500"
            )}
            onClick={handleGenerateSuggestion}
            disabled={isGeneratingSuggestion}
            title="Generate AI suggestion"
          >
            {isGeneratingSuggestion ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
          </Button>
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-10 rounded-full bg-gray-50 border-gray-200"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="size-5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <Mic className="size-5" />
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="rounded-full bg-purple-600 hover:bg-purple-700"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <UpgradePrompt
        showDialog={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        reason={upgradeReason}
        currentPlan={subscription?.planName}
      />
    </div>
  );
}
