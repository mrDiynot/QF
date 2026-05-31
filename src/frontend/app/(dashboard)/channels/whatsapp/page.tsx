'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Search,
  Image as ImageIcon,
  Paperclip,
  Smile,
  CheckCheck,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useChannelByType, useConversationsByChannel } from '@/hooks/api/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Local types for WhatsApp conversations
interface WhatsAppConversation {
  id: string;
  leadName?: string;
  contactName?: string;
  phoneNumber?: string;
  contactPhone?: string;
  lastMessage?: string;
  lastMessageAt: Date | string;
  unreadCount?: number;
  status?: string;
  profilePicture?: string | null;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: string;
  sentAt: Date | string;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

export default function WhatsAppChannelPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Use standardized hooks for consistent data fetching
  const { data: whatsappChannel } = useChannelByType('whatsapp');
  const { data: apiConversations = [], isLoading } = useConversationsByChannel('whatsapp');
  
  // Use API conversations if available, otherwise use mock data for demo
  const conversations = apiConversations.length > 0 ? apiConversations : [
    {
      id: '1',
      leadName: 'Maria Garcia',
      phoneNumber: '+1 (555) 123-4567',
      lastMessage: 'Thanks for the information!',
      lastMessageAt: new Date(Date.now() - 1800000),
      unreadCount: 2,
      status: 'active',
      profilePicture: null,
    },
    {
      id: '2',
      leadName: 'Carlos Rodriguez',
      phoneNumber: '+1 (555) 234-5678',
      lastMessage: 'When can we schedule a demo?',
      lastMessageAt: new Date(Date.now() - 3600000),
      unreadCount: 0,
      status: 'active',
      profilePicture: null,
    },
  ];

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', 'whatsapp', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      return [
        {
          id: '1',
          content: 'Hi! I saw your ad and I\'m interested in learning more.',
          direction: 'inbound',
          status: 'delivered',
          sentAt: new Date(Date.now() - 7200000),
          mediaType: null,
          mediaUrl: null,
        },
        {
          id: '2',
          content: 'Hello! Thanks for reaching out. I\'d be happy to help. What would you like to know?',
          direction: 'outbound',
          status: 'read',
          sentAt: new Date(Date.now() - 7100000),
          mediaType: null,
          mediaUrl: null,
        },
        {
          id: '3',
          content: 'Can you tell me about your pricing plans?',
          direction: 'inbound',
          status: 'delivered',
          sentAt: new Date(Date.now() - 3600000),
          mediaType: null,
          mediaUrl: null,
        },
      ];
    },
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      return { id: Date.now().toString(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
      toast.success('Message sent');
    },
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !messageText.trim()) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText,
    });
  };

  const filteredConversations = (conversations as WhatsAppConversation[]).filter((conv) =>
    conv.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phoneNumber?.includes(searchQuery)
  );

  const stats = {
    totalConversations: conversations.length,
    activeConversations: (conversations as WhatsAppConversation[]).filter((c) => c.status === 'active').length,
    unreadMessages: (conversations as WhatsAppConversation[]).reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    responseRate: 96.8,
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="size-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-navy">WhatsApp Business</h1>
                <p className="text-sm text-text-secondary mt-1">
                  {whatsappChannel?.phoneNumber || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
          <Badge variant={whatsappChannel?.isActive ? 'default' : 'secondary'}>
            {whatsappChannel?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-text-secondary">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
            <p className="text-xs text-text-secondary">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
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
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-text-secondary">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card className="h-[calc(100vh-400px)]">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-550px)]">
                {isLoading ? (
                  <div className="p-8 text-center text-text-secondary">Loading...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">No conversations</div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedConversation === conv.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{conv.leadName}</p>
                            {(conv.unreadCount ?? 0) > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-1">
                            {conv.phoneNumber}
                          </p>
                          <p className="text-sm text-text-secondary truncate mt-1">
                            {conv.lastMessage}
                          </p>
                        </div>
                        <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card className="h-[calc(100vh-400px)] flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {(() => {
                          const conv = (conversations as WhatsAppConversation[]).find((c) => c.id === selectedConversation);
                          return conv?.leadName || conv?.contactName || `Contact ${selectedConversation?.substring(0, 8)}`;
                        })()}
                      </CardTitle>
                      <p className="text-sm text-text-secondary mt-1">
                        {(() => {
                          const conv = (conversations as WhatsAppConversation[]).find((c) => c.id === selectedConversation);
                          return conv?.phoneNumber || conv?.contactPhone || 'WhatsApp';
                        })()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {(messages as WhatsAppMessage[]).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === 'outbound'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-70">
                            {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                          </span>
                          {message.direction === 'outbound' && message.status === 'read' && (
                            <CheckCheck className="size-3 opacity-70" />
                          )}
                          {message.direction === 'outbound' && message.status === 'delivered' && (
                            <CheckCheck className="size-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="size-4" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none flex-1"
                    />
                    <Button variant="ghost" size="sm">
                      <Smile className="size-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <MessageSquare className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
