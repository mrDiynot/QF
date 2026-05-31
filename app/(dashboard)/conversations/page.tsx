'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageCircle, Phone, User, Bot, UserPlus, Send,
  Mail, MessageSquare, Instagram, Facebook, Twitter,
  Search, Filter, Circle, MoreVertical, PhoneCall,
  Paperclip, Smile, Star, Tag,
  AlertCircle, CheckCircle, Clock, Target,
  Volume2, Eye, Calendar, FileText
} from 'lucide-react';

type ChannelType = 'all' | 'sms' | 'email' | 'phone' | 'webchat' | 'facebook' | 'instagram' | 'twitter' | 'whatsapp';
type ConversationStatus = 'ai-active' | 'human-active' | 'pending' | 'resolved' | 'waiting';

type Message = {
  id: string;
  from: 'customer' | 'ai' | 'human';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
};

type Conversation = {
  id: string;
  name: string;
  channel: Exclude<ChannelType, 'all'>;
  status: ConversationStatus;
  lastMessage: string;
  time: string;
  unread: number;
  leadScore: number;
  tags: string[];
  messages: Message[];
  customerInfo: {
    email?: string;
    phone?: string;
    company?: string;
    location?: string;
  };
};

export default function ConversationsPage() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      channel: 'webchat',
      status: 'ai-active',
      lastMessage: 'I need a quote for your premium service package',
      time: '2m ago',
      unread: 2,
      leadScore: 92,
      tags: ['hot-lead', 'premium'],
      customerInfo: {
        email: 'sarah@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA'
      },
      messages: [
        { id: '1', from: 'customer', text: "Hi, I'm interested in your services", time: '5m ago', status: 'read' },
        { id: '2', from: 'ai', text: "Hello Sarah! I'd be happy to help. What specific service are you interested in?", time: '4m ago', status: 'read' },
        { id: '3', from: 'customer', text: 'I need a quote for your premium service package', time: '2m ago', status: 'read' },
        { id: '4', from: 'ai', text: 'Great choice! The premium package starts at $5,000/month. Can I schedule a demo call to show you all the features?', time: '1m ago', status: 'delivered' }
      ]
    },
    {
      id: '2',
      name: 'Mike Chen',
      channel: 'phone',
      status: 'ai-active',
      lastMessage: 'AI is qualifying the lead via phone call',
      time: '5m ago',
      unread: 0,
      leadScore: 78,
      tags: ['callback-requested'],
      customerInfo: { phone: '+1 (555) 234-5678', location: 'Austin, TX' },
      messages: [
        { id: '1', from: 'ai', text: '[CALL IN PROGRESS] Hello, this is QualiFlow calling about your recent inquiry...', time: '5m ago' },
        { id: '2', from: 'customer', text: '[VOICE] Yes, I submitted a form yesterday', time: '4m ago' },
        { id: '3', from: 'ai', text: "[VOICE] Great! I understand you're interested in our services. Can you tell me more about your business?", time: '3m ago' }
      ]
    },
    {
      id: '3',
      name: 'Emma Davis',
      channel: 'sms',
      status: 'ai-active',
      lastMessage: 'What are your office hours?',
      time: '8m ago',
      unread: 1,
      leadScore: 65,
      tags: ['qualified'],
      customerInfo: { phone: '+1 (555) 345-6789', location: 'New York, NY' },
      messages: [
        { id: '1', from: 'customer', text: 'What are your office hours?', time: '8m ago', status: 'read' },
        { id: '2', from: 'ai', text: "We're open Mon-Fri 9AM-6PM, Sat 10AM-4PM. Would you like to schedule an appointment?", time: '7m ago', status: 'delivered' },
        { id: '3', from: 'customer', text: 'Yes, do you have any openings this week?', time: '5m ago', status: 'read' }
      ]
    },
    {
      id: '4',
      name: 'John Martinez',
      channel: 'email',
      status: 'pending',
      lastMessage: 'Thanks for the detailed proposal. I have a few questions...',
      time: '15m ago',
      unread: 3,
      leadScore: 85,
      tags: ['proposal-sent', 'warm-lead'],
      customerInfo: { email: 'john@startup.io', company: 'Startup.io', location: 'Seattle, WA' },
      messages: [
        { id: '1', from: 'ai', text: "Hi John, I've prepared a custom proposal based on your requirements. Please find it attached.", time: '2h ago', status: 'read' },
        { id: '2', from: 'customer', text: 'Thanks for the detailed proposal. I have a few questions about the implementation timeline and pricing.', time: '15m ago', status: 'sent' }
      ]
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      channel: 'facebook',
      status: 'ai-active',
      lastMessage: 'Interested in your Black Friday deals!',
      time: '12m ago',
      unread: 1,
      leadScore: 58,
      tags: ['social-lead'],
      customerInfo: { location: 'Los Angeles, CA' },
      messages: [
        { id: '1', from: 'customer', text: 'Interested in your Black Friday deals!', time: '12m ago', status: 'read' },
        { id: '2', from: 'ai', text: 'Hi Lisa! We have amazing offers this week. What service are you most interested in?', time: '10m ago', status: 'delivered' }
      ]
    },
    {
      id: '6',
      name: 'David Kim',
      channel: 'instagram',
      status: 'waiting',
      lastMessage: 'Sent you a DM about pricing',
      time: '25m ago',
      unread: 0,
      leadScore: 42,
      tags: ['new-lead'],
      customerInfo: { location: 'Miami, FL' },
      messages: [
        { id: '1', from: 'customer', text: 'Sent you a DM about pricing', time: '25m ago', status: 'read' },
        { id: '2', from: 'ai', text: "Hi David! I'd be happy to help with pricing. What specific package are you interested in?", time: '24m ago', status: 'read' },
        { id: '3', from: 'customer', text: 'The starter package', time: '22m ago', status: 'read' },
        { id: '4', from: 'ai', text: 'Perfect! The starter package is $99/month. Would you like me to set up a demo?', time: '20m ago', status: 'delivered' }
      ]
    },
    {
      id: '7',
      name: 'Rachel Green',
      channel: 'whatsapp',
      status: 'human-active',
      lastMessage: "You're now handling this conversation",
      time: '1h ago',
      unread: 0,
      leadScore: 95,
      tags: ['vip', 'enterprise'],
      customerInfo: { phone: '+1 (555) 789-0123', company: 'Enterprise Corp', location: 'Boston, MA' },
      messages: [
        { id: '1', from: 'customer', text: 'We need an enterprise solution for 500+ users', time: '1h ago', status: 'read' },
        { id: '2', from: 'ai', text: 'This looks like an enterprise opportunity. Let me connect you with our sales team.', time: '1h ago', status: 'read' },
        { id: '3', from: 'human', text: "Hi Rachel, I'm taking over from here. I'd love to discuss your enterprise needs. When works for a call?", time: '55m ago', status: 'read' }
      ]
    }
  ];

  const channels = [
    { id: 'all' as const, label: 'All', icon: MessageCircle, count: conversations.length },
    { id: 'sms' as const, label: 'SMS', icon: MessageSquare, count: conversations.filter(c => c.channel === 'sms').length },
    { id: 'email' as const, label: 'Email', icon: Mail, count: conversations.filter(c => c.channel === 'email').length },
    { id: 'phone' as const, label: 'Phone', icon: Phone, count: conversations.filter(c => c.channel === 'phone').length },
    { id: 'webchat' as const, label: 'Web', icon: MessageCircle, count: conversations.filter(c => c.channel === 'webchat').length },
    { id: 'facebook' as const, label: 'FB', icon: Facebook, count: conversations.filter(c => c.channel === 'facebook').length },
    { id: 'instagram' as const, label: 'IG', icon: Instagram, count: conversations.filter(c => c.channel === 'instagram').length },
    { id: 'whatsapp' as const, label: 'WA', icon: MessageSquare, count: conversations.filter(c => c.channel === 'whatsapp').length }
  ];

  const getChannelIcon = (channel: string) => {
    const iconMap: Record<string, typeof MessageCircle> = {
      sms: MessageSquare, email: Mail, phone: Phone, webchat: MessageCircle,
      facebook: Facebook, instagram: Instagram, twitter: Twitter, whatsapp: MessageSquare
    };
    return iconMap[channel] || MessageCircle;
  };

  const getChannelColor = (channel: string) => {
    const colorMap: Record<string, string> = {
      sms: 'from-green-500 to-emerald-500', email: 'from-blue-500 to-indigo-500',
      phone: 'from-purple-500 to-pink-500', webchat: 'from-orange-500 to-red-500',
      facebook: 'from-blue-600 to-blue-700', instagram: 'from-pink-500 to-purple-600',
      twitter: 'from-blue-400 to-blue-500', whatsapp: 'from-green-600 to-green-700'
    };
    return colorMap[channel] || 'from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status: ConversationStatus) => {
    const styles = {
      'ai-active': { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'AI Active', icon: Bot },
      'human-active': { bg: 'bg-blue-500/20', text: 'text-blue-300', label: "You're Active", icon: User },
      'pending': { bg: 'bg-orange-500/20', text: 'text-orange-300', label: 'Pending', icon: Clock },
      'resolved': { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Resolved', icon: CheckCircle },
      'waiting': { bg: 'bg-white/10', text: 'text-white/60', label: 'Waiting', icon: AlertCircle }
    };
    return styles[status];
  };

  const filteredConversations = conversations
    .filter(c => activeChannel === 'all' || c.channel === activeChannel)
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const selectedConversation = conversations.find(c => c.id === selectedConvo);

  const handleTakeOver = () => { setIsTakenOver(true); };
  const handleSendMessage = () => { if (messageInput.trim()) setMessageInput(''); };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const aiActiveCount = conversations.filter(c => c.status === 'ai-active').length;
  const humanActiveCount = conversations.filter(c => c.status === 'human-active').length;

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/10">
      {/* ─── Left Sidebar ─── */}
      <div className="w-96 bg-white/[0.04] backdrop-blur-md border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/15 border border-white/10">
                <MessageCircle className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Inbox</h2>
            </div>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <Filter className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2.5 text-center">
              <div className="text-xl font-bold text-purple-600">{aiActiveCount}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">AI Active</div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2.5 text-center">
              <div className="text-xl font-bold text-blue-600">{humanActiveCount}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">You Active</div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2.5 text-center">
              <div className="text-xl font-bold text-orange-600">{totalUnread}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Unread</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 transition-all"
            />
          </div>
        </div>

        {/* Channel Filters */}
        <div className="p-2.5 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-1.5">
            {channels.map(channel => {
              const Icon = channel.icon;
              const isActive = activeChannel === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {channel.label}
                  {channel.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {channel.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <MessageCircle className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/30">No conversations found</p>
            </div>
          ) : (
            <div>
              {filteredConversations.map((convo) => {
                const Icon = getChannelIcon(convo.channel);
                const statusBadge = getStatusBadge(convo.status);
                const StatusIcon = statusBadge.icon;
                const isSelected = selectedConvo === convo.id;

                return (
                  <button
                    key={convo.id}
                    onClick={() => { setSelectedConvo(convo.id); setIsTakenOver(false); }}
                    className={`w-full text-left p-4 border-b border-white/5 transition-all duration-200 ${
                      isSelected
                        ? 'bg-white/[0.08] border-l-2 border-l-orange-500'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {convo.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${getChannelColor(convo.channel)} flex items-center justify-center border-2 border-[#1a0a2e]`}>
                          <Icon className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white truncate">{convo.name}</span>
                          <span className="text-[11px] text-white/40 ml-2">{convo.time}</span>
                        </div>
                        <div className="text-xs text-white/40 truncate mb-2">{convo.lastMessage}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                          {convo.leadScore >= 80 && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-[10px] font-medium flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {convo.leadScore}
                            </span>
                          )}
                          {convo.unread > 0 && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full text-[10px] font-bold min-w-[20px] text-center">
                              {convo.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Conversation Area ─── */}
      <div className="flex-1 flex flex-col bg-white/[0.02]">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="bg-white/[0.06] backdrop-blur-md border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${getChannelColor(selectedConversation.channel)} flex items-center justify-center border-2 border-[#1a0a2e]`}>
                      {(() => {
                        const ChannelIcon = getChannelIcon(selectedConversation.channel);
                        return <ChannelIcon className="w-3 h-3 text-white" />;
                      })()}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white tracking-tight">{selectedConversation.name}</h3>
                      {selectedConversation.leadScore >= 80 && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-lg shadow-orange-500/20">
                          <Star className="w-3 h-3" />
                          Hot Lead ({selectedConversation.leadScore})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      {selectedConversation.customerInfo.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedConversation.customerInfo.email}</span>
                      )}
                      {selectedConversation.customerInfo.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedConversation.customerInfo.phone}</span>
                      )}
                      {selectedConversation.customerInfo.location && (
                        <span>{selectedConversation.customerInfo.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedConversation.channel === 'phone' && (
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Volume2 className="w-5 h-5 text-white/50" />
                    </button>
                  )}
                  {!isTakenOver ? (
                    <>
                      <button className="px-4 py-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/15 transition-all flex items-center gap-2 text-sm font-medium border border-white/10">
                        <Eye className="w-4 h-4" />
                        Monitor
                      </button>
                      <button
                        onClick={handleTakeOver}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <UserPlus className="w-4 h-4" />
                        Take Over
                      </button>
                    </>
                  ) : (
                    <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl flex items-center gap-2 text-sm font-medium border border-green-500/20">
                      <CheckCircle className="w-4 h-4" />
                      You&apos;re Active
                    </span>
                  )}
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <MoreVertical className="w-5 h-5 text-white/50" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {selectedConversation.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {selectedConversation.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white/[0.06] text-white/50 rounded-full text-[10px] font-medium flex items-center gap-1 border border-white/5">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {selectedConversation.messages.map((msg) => {
                  const isFromCustomer = msg.from === 'customer';
                  const isFromAI = msg.from === 'ai';

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2.5 max-w-[70%] ${isFromCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isFromCustomer && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isFromAI ? 'bg-purple-500/20 border border-purple-500/20' : 'bg-blue-500/20 border border-blue-500/20'
                          }`}>
                            {isFromAI ? <Bot className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-blue-400" />}
                          </div>
                        )}

                        <div>
                          <div className={`rounded-2xl px-4 py-3 ${
                            isFromCustomer
                              ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/10'
                              : isFromAI
                              ? 'bg-white/[0.08] text-white/90 border border-white/10 backdrop-blur-sm'
                              : 'bg-blue-500/15 text-white/90 border border-blue-500/15'
                          }`}>
                            {!isFromCustomer && (
                              <div className="flex items-center gap-1 mb-1 text-[10px] text-white/40">
                                {isFromAI ? (
                                  <><Bot className="w-3 h-3" /><span>AI Assistant</span></>
                                ) : (
                                  <><User className="w-3 h-3" /><span>You</span></>
                                )}
                              </div>
                            )}
                            <div className="text-sm leading-relaxed">{msg.text}</div>
                          </div>
                          <div className={`flex items-center gap-1 mt-1.5 text-[10px] text-white/30 ${isFromCustomer ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.time}</span>
                            {msg.status && isFromCustomer && (
                              <span className="text-orange-400">• {msg.status}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white/[0.04] backdrop-blur-md border-t border-white/10 p-4">
              {!isTakenOver && (
                <div className="mb-3 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2 text-sm text-purple-300">
                  <Bot className="w-4 h-4" />
                  <span>AI is currently handling this conversation</span>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Paperclip className="w-5 h-5 text-white/40" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Smile className="w-5 h-5 text-white/40" />
                    </button>
                    {selectedConversation.channel === 'phone' && (
                      <button className="px-3 py-2 bg-purple-500/15 text-purple-300 rounded-lg hover:bg-purple-500/25 transition-all flex items-center gap-2 text-sm font-medium border border-purple-500/20">
                        <PhoneCall className="w-4 h-4" />
                        Join Call
                      </button>
                    )}
                  </div>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                    }}
                    placeholder={isTakenOver ? "Type your message..." : "AI is handling... Click 'Take Over' to respond"}
                    disabled={!isTakenOver}
                    rows={3}
                    className={`w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 resize-none transition-all ${
                      !isTakenOver ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!isTakenOver || !messageInput.trim()}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                    isTakenOver && messageInput.trim()
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:shadow-lg hover:shadow-orange-500/30'
                      : 'bg-white/10 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Unified Inbox</h3>
              <p className="text-white/40 max-w-md text-sm">
                Select a conversation from the left to view messages from SMS, Email, Phone, Web Chat, and Social Media channels
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Right Sidebar ─── */}
      {selectedConversation && (
        <div className="w-80 bg-white/[0.04] backdrop-blur-md border-l border-white/10 p-5 overflow-y-auto">
          <h3 className="text-base font-bold text-white tracking-tight mb-5">Customer Details</h3>

          {/* Lead Score */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Lead Score</span>
              <span className={`text-2xl font-bold ${
                selectedConversation.leadScore >= 80 ? 'text-orange-400' :
                selectedConversation.leadScore >= 60 ? 'text-yellow-400' : 'text-white/50'
              }`}>
                {selectedConversation.leadScore}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  selectedConversation.leadScore >= 80 ? 'bg-gradient-to-r from-orange-500 to-pink-600' :
                  selectedConversation.leadScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-white/30'
                }`}
                style={{ width: `${selectedConversation.leadScore}%` }}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-5">
            {selectedConversation.customerInfo.company && (
              <div>
                <div className="text-[10px] text-white/30 font-medium uppercase tracking-wide mb-1">Company</div>
                <div className="text-sm font-medium text-white">{selectedConversation.customerInfo.company}</div>
              </div>
            )}
            {selectedConversation.customerInfo.email && (
              <div>
                <div className="text-[10px] text-white/30 font-medium uppercase tracking-wide mb-1">Email</div>
                <div className="text-sm font-medium text-white">{selectedConversation.customerInfo.email}</div>
              </div>
            )}
            {selectedConversation.customerInfo.phone && (
              <div>
                <div className="text-[10px] text-white/30 font-medium uppercase tracking-wide mb-1">Phone</div>
                <div className="text-sm font-medium text-white">{selectedConversation.customerInfo.phone}</div>
              </div>
            )}
            {selectedConversation.customerInfo.location && (
              <div>
                <div className="text-[10px] text-white/30 font-medium uppercase tracking-wide mb-1">Location</div>
                <div className="text-sm font-medium text-white">{selectedConversation.customerInfo.location}</div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 mb-5">
            <h4 className="text-xs text-white/40 font-medium uppercase tracking-wide mb-2">Quick Actions</h4>
            <button className="w-full px-3 py-2.5 bg-blue-500/15 text-blue-300 rounded-xl hover:bg-blue-500/25 transition-all flex items-center gap-2 text-sm font-medium border border-blue-500/15">
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
            <button className="w-full px-3 py-2.5 bg-purple-500/15 text-purple-300 rounded-xl hover:bg-purple-500/25 transition-all flex items-center gap-2 text-sm font-medium border border-purple-500/15">
              <FileText className="w-4 h-4" />
              Send Proposal
            </button>
            <button className="w-full px-3 py-2.5 bg-green-500/15 text-green-300 rounded-xl hover:bg-green-500/25 transition-all flex items-center gap-2 text-sm font-medium border border-green-500/15">
              <PhoneCall className="w-4 h-4" />
              Schedule Call
            </button>
          </div>

          {/* Tags */}
          <div className="mb-5">
            <h4 className="text-xs text-white/40 font-medium uppercase tracking-wide mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedConversation.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-white/[0.06] text-white/50 rounded-full text-[10px] font-medium border border-white/5">
                  {tag}
                </span>
              ))}
              <button className="px-2.5 py-1 bg-orange-500/15 text-orange-300 rounded-full text-[10px] font-medium hover:bg-orange-500/25 transition-all border border-orange-500/15">
                + Add Tag
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div>
            <h4 className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {[
                { action: 'Form submitted', time: '2 days ago' },
                { action: 'Email opened', time: '3 days ago' },
                { action: 'Website visit', time: '5 days ago' }
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <Circle className="w-1.5 h-1.5 fill-orange-400 text-orange-400 shrink-0" />
                  <span className="text-white/50">{activity.action}</span>
                  <span className="text-white/20">• {activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
