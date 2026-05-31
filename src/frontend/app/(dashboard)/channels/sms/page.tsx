'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  Users,
  MessageCircle,
  Zap,
  CheckCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { useConversationsByChannel, useChannelByType, useMessages } from '@/hooks/api/useConversations';
import { ChannelSetupDialog } from '@/components/channels/ChannelSetupDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Message } from '@/types/api';

// Extended conversation type for SMS page
interface SMSConversation {
  id: string;
  contactId?: string;
  unreadCount?: number;
  channel?: string;
  channelType?: string;
  lastMessageAt?: string;
  startedAt?: string;
  status?: 'active' | 'closed' | 'archived' | 'open';
  leadId?: string;
  businessId?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Messages response type
interface MessagesResponse {
  items?: Message[];
}

export default function SMSChannelPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const queryClient = useQueryClient();

  // Use standardized hooks for consistent data fetching
  const { data: smsChannel } = useChannelByType('sms');
  const { data: conversations = [], isLoading: conversationsLoading } = useConversationsByChannel('sms');
  const { data: messagesData } = useMessages({ conversationId: selectedConversation || undefined });
  const messages = (messagesData as unknown as MessagesResponse)?.items || (Array.isArray(messagesData) ? messagesData : []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      return messagesService.sendMessage({
        conversationId: data.conversationId,
        content: data.content,
        channel: 'SMS',
        direction: 'Outbound',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !messageText.trim()) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText,
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const contactId = conv.contactId || conv.leadId || conv.id || '';
    return contactId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = useMemo(() => {
    const total = conversations.length;
    const unread = conversations.filter((conv: SMSConversation) => (conv.unreadCount ?? 0) > 0).length;
    const active = conversations.filter((c: SMSConversation) => c.status === 'active').length;
    return {
      totalConversations: total,
      activeConversations: active,
      unreadMessages: unread,
      responseRate: 0,
    };
  }, [conversations]);

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="size-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-navy">SMS Channel</h1>
                <p className="text-sm text-text-secondary mt-1">
                  {smsChannel?.phoneNumber || 'No phone number configured'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={smsChannel?.isActive ? 'default' : 'secondary'}>
              {smsChannel?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-text-secondary">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
            <p className="text-xs text-text-secondary">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Zap className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-text-secondary">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-text-secondary">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Conversations List */}
        <div className="col-span-4">
          <Card className="h-[calc(100vh-400px)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="size-4" />
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-550px)]">
                {conversationsLoading ? (
                  <div className="p-8 text-center text-text-secondary">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">
                    No conversations found
                  </div>
                ) : (
                  (filteredConversations as SMSConversation[]).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">
                              {conv.contactId ? `Contact ${conv.contactId.substring(0, 8)}` : `Lead ${(conv.leadId || conv.id).substring(0, 8)}`}
                            </p>
                            {(conv.unreadCount || 0) > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-1">
                            {conv.channel || conv.channelType || 'SMS'} • {conv.status}
                          </p>
                        </div>
                        <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conv.lastMessageAt || conv.startedAt || conv.createdAt || new Date()), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="col-span-8">
          <Card className="h-[calc(100vh-400px)] flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {(() => {
                          const conv = (conversations as SMSConversation[]).find((c) => c.id === selectedConversation);
                          return conv?.contactId
                            ? `Contact ${conv.contactId.substring(0, 8)}`
                            : `Lead ${(conv?.leadId || conv?.id || '').substring(0, 8)}`;
                        })()}
                      </CardTitle>
                      <p className="text-sm text-text-secondary mt-1">
                        {(conversations as SMSConversation[]).find((c) => c.id === selectedConversation)?.channel || 'SMS'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                      No messages yet
                    </div>
                  ) : (
                    messages.map((message: { id: string; direction: string; content: string; createdAt: string; sentAt?: string; status?: string }) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'Outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.direction === 'Outbound'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(message.sentAt || message.createdAt), { addSuffix: true })}
                            </span>
                            {message.direction === 'Outbound' && (
                              <>
                                {message.status === 'delivered' && (
                                  <CheckCheck className="size-3 opacity-70" />
                                )}
                                {message.status === 'pending' && (
                                  <Clock className="size-3 opacity-70" />
                                )}
                                {message.status === 'failed' && (
                                  <AlertCircle className="size-3 opacity-70" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <MessageSquare className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Channel Setup Dialog */}
      <ChannelSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        channelType="SMS"
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['channels'] });
          setShowSetupDialog(false);
        }}
      />
    </div>
  );
}
