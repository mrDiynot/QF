'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Phone, User, Bot, UserPlus, Send,
  Mail, MessageSquare, Instagram, Facebook,
  Search, Filter, MoreVertical, PhoneCall,
  Paperclip, Smile, Star, Tag,
  AlertCircle, CheckCircle, Clock, Target,
  Settings, Eye, Calendar, FileText,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

type ChannelType = 'all' | 'sms' | 'email' | 'phone' | 'webchat' | 'facebook' | 'instagram' | 'whatsapp';
type ConversationStatus = 'ai-active' | 'human-active' | 'pending' | 'resolved' | 'waiting';

interface Message {
  id: string;
  from: 'customer' | 'ai' | 'human';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface CustomerInfo {
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
}

interface Conversation {
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
  customerInfo: CustomerInfo;
}

const conversations: Conversation[] = [
  { id: '1', name: 'Sarah Johnson', channel: 'webchat', status: 'ai-active', lastMessage: 'I need a quote for your premium service package', time: '2m ago', unread: 2, leadScore: 92, tags: ['hot-lead', 'premium'], customerInfo: { email: 'sarah@techcorp.com', phone: '+1 (555) 123-4567', company: 'TechCorp Inc.', location: 'San Francisco, CA' }, messages: [{ id: '1', from: 'customer', text: "Hi, I'm interested in your services", time: '5m ago', status: 'read' }, { id: '2', from: 'ai', text: "Hello Sarah! I'd be happy to help. What specific service are you interested in?", time: '4m ago', status: 'read' }, { id: '3', from: 'customer', text: 'I need a quote for your premium service package', time: '2m ago', status: 'read' }, { id: '4', from: 'ai', text: 'Great choice! The premium package starts at $5,000/month. Can I schedule a demo call to show you all the features?', time: '1m ago', status: 'delivered' }] },
  { id: '2', name: 'Mike Chen', channel: 'phone', status: 'ai-active', lastMessage: 'AI is qualifying the lead via phone call', time: '5m ago', unread: 0, leadScore: 78, tags: ['callback-requested'], customerInfo: { phone: '+1 (555) 234-5678', location: 'Austin, TX' }, messages: [{ id: '1', from: 'ai', text: '[CALL IN PROGRESS] Hello, this is QualiFlow AI calling about your recent inquiry...', time: '5m ago' }, { id: '2', from: 'customer', text: '[VOICE] Yes, I submitted a form yesterday', time: '4m ago' }] },
  { id: '3', name: 'Emma Davis', channel: 'sms', status: 'ai-active', lastMessage: 'What are your office hours?', time: '8m ago', unread: 1, leadScore: 65, tags: ['qualified'], customerInfo: { phone: '+1 (555) 345-6789', location: 'New York, NY' }, messages: [{ id: '1', from: 'customer', text: 'What are your office hours?', time: '8m ago', status: 'read' }, { id: '2', from: 'ai', text: "We're open Mon-Fri 9AM-6PM, Sat 10AM-4PM. Would you like to schedule an appointment?", time: '7m ago', status: 'delivered' }] },
  { id: '4', name: 'John Martinez', channel: 'email', status: 'pending', lastMessage: 'Thanks for the detailed proposal. I have a few questions...', time: '15m ago', unread: 3, leadScore: 85, tags: ['proposal-sent', 'warm-lead'], customerInfo: { email: 'john@startup.io', company: 'Startup.io', location: 'Seattle, WA' }, messages: [{ id: '1', from: 'ai', text: "Hi John, I've prepared a custom proposal based on your requirements.", time: '2h ago', status: 'read' }, { id: '2', from: 'customer', text: 'Thanks for the detailed proposal. I have a few questions about the implementation timeline.', time: '15m ago', status: 'sent' }] },
  { id: '5', name: 'Rachel Green', channel: 'whatsapp', status: 'human-active', lastMessage: "You're now handling this conversation", time: '1h ago', unread: 0, leadScore: 95, tags: ['vip', 'enterprise'], customerInfo: { phone: '+1 (555) 789-0123', company: 'Enterprise Corp', location: 'Boston, MA' }, messages: [{ id: '1', from: 'customer', text: 'We need an enterprise solution for 500+ users', time: '1h ago', status: 'read' }, { id: '2', from: 'human', text: "Hi Rachel, I'm taking over from here. I'd love to discuss your enterprise needs.", time: '55m ago', status: 'read' }] },
];

const CHANNELS: { id: ChannelType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all',       label: 'All',       icon: MessageCircle },
  { id: 'sms',       label: 'SMS',       icon: MessageSquare },
  { id: 'email',     label: 'Email',     icon: Mail },
  { id: 'phone',     label: 'Phone',     icon: Phone },
  { id: 'webchat',   label: 'Web Chat',  icon: MessageCircle },
  { id: 'facebook',  label: 'Facebook',  icon: Facebook },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: MessageSquare },
];

const channelColor = (ch: string) => ({ sms: 'from-green-500 to-emerald-500', email: 'from-blue-500 to-indigo-500', phone: 'from-purple-500 to-pink-500', webchat: 'from-orange-500 to-red-500', facebook: 'from-blue-600 to-blue-700', instagram: 'from-pink-500 to-purple-600', whatsapp: 'from-green-600 to-green-700' } as Record<string, string>)[ch] ?? 'from-gray-500 to-gray-600';

const channelIcon = (ch: string) => ({ sms: MessageSquare, email: Mail, phone: Phone, webchat: MessageCircle, facebook: Facebook, instagram: Instagram, whatsapp: MessageSquare } as Record<string, React.ComponentType<{ className?: string }>>)[ch] ?? MessageCircle;

const statusBadge = (status: ConversationStatus) => ({
  'ai-active':    { bg: 'bg-purple-100', text: 'text-purple-700', label: 'AI Active',    icon: Bot },
  'human-active': { bg: 'bg-blue-100',   text: 'text-blue-700',   label: "You're Active", icon: User },
  'pending':      { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pending',      icon: Clock },
  'resolved':     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Resolved',     icon: CheckCircle },
  'waiting':      { bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Waiting',      icon: AlertCircle },
} as const)[status];

export default function BoostConversionsPage() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const filtered = conversations
    .filter(c => activeChannel === 'all' || c.channel === activeChannel)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));

  const selected = conversations.find(c => c.id === selectedConvo);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const aiActive = conversations.filter(c => c.status === 'ai-active').length;
  const humanActive = conversations.filter(c => c.status === 'human-active').length;

  const handleSend = () => { if (messageInput.trim()) setMessageInput(''); };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Compact marketing header strip */}
      <LandingPageHeader />

      <div className="flex flex-1 overflow-hidden pt-[83px]">
        {/* Left sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
              <div className="flex gap-1.5">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Settings className="w-4 h-4 text-gray-500" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Filter className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-purple-50 rounded-lg p-2 text-center"><div className="text-lg font-bold text-purple-600">{aiActive}</div><div className="text-[10px] text-purple-700">AI Active</div></div>
              <div className="bg-blue-50 rounded-lg p-2 text-center"><div className="text-lg font-bold text-blue-600">{humanActive}</div><div className="text-[10px] text-blue-700">You Active</div></div>
              <div className="bg-orange-50 rounded-lg p-2 text-center"><div className="text-lg font-bold text-orange-600">{totalUnread}</div><div className="text-[10px] text-orange-700">Unread</div></div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Channel filter */}
          <div className="p-2 border-b border-gray-100 overflow-x-auto">
            <div className="flex gap-1">
              {CHANNELS.map(ch => {
                const Icon = ch.icon;
                const count = ch.id === 'all' ? conversations.length : conversations.filter(c => c.channel === ch.id).length;
                const isActive = activeChannel === ch.id;
                return (
                  <button key={ch.id} onClick={() => setActiveChannel(ch.id)} className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap flex items-center gap-1 transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Icon className="w-3 h-3" />{ch.label}
                    <span className={`px-1 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(convo => {
              const Icon = channelIcon(convo.channel);
              const badge = statusBadge(convo.status);
              const StatusIcon = badge.icon;
              const isSelected = selectedConvo === convo.id;
              return (
                <motion.button key={convo.id} onClick={() => { setSelectedConvo(convo.id); setIsTakenOver(false); }} whileHover={{ backgroundColor: '#f9fafb' }} className={`w-full text-left p-3 border-b border-gray-100 transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">{convo.name.split(' ').map(n => n[0]).join('')}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${channelColor(convo.channel)} flex items-center justify-center border-2 border-white`}><Icon className="w-2.5 h-2.5 text-white" /></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{convo.name}</span>
                        <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{convo.time}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-1.5">{convo.lastMessage}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 ${badge.bg} ${badge.text}`}><StatusIcon className="w-2.5 h-2.5" />{badge.label}</span>
                        {convo.leadScore >= 80 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] flex items-center gap-0.5"><Target className="w-2.5 h-2.5" />{convo.leadScore}</span>}
                        {convo.unread > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-semibold min-w-[18px] text-center">{convo.unread}</span>}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main conversation area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">{selected.name.split(' ').map(n => n[0]).join('')}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${channelColor(selected.channel)} flex items-center justify-center border-2 border-white`}>{(() => { const Icon = channelIcon(selected.channel); return <Icon className="w-2.5 h-2.5 text-white" />; })()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{selected.name}</h3>
                        {selected.leadScore >= 80 && <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded text-xs font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5" />Hot Lead ({selected.leadScore})</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {selected.customerInfo.email && <span>{selected.customerInfo.email}</span>}
                        {selected.customerInfo.phone && <span>{selected.customerInfo.phone}</span>}
                        {selected.customerInfo.location && <span>{selected.customerInfo.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isTakenOver ? (
                      <>
                        <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Monitor</button>
                        <button onClick={() => setIsTakenOver(true)} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />Take Over</button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />You&apos;re Active</span>
                    )}
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>
                {selected.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {selected.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{tag}</span>)}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-4">
                {selected.messages.map(msg => {
                  const isCustomer = msg.from === 'customer';
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[70%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isCustomer && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.from === 'ai' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                            {msg.from === 'ai' ? <Bot className="w-3.5 h-3.5 text-purple-600" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        )}
                        <div>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isCustomer ? 'bg-blue-600 text-white' : msg.from === 'ai' ? 'bg-purple-100 text-purple-900' : 'bg-white border border-gray-200 text-gray-900'}`}>
                            {!isCustomer && <div className="text-[10px] font-bold mb-1 opacity-70">{msg.from === 'ai' ? 'AI Assistant' : 'You'}</div>}
                            {msg.text}
                          </div>
                          <div className={`text-[10px] text-gray-400 mt-1 ${isCustomer ? 'text-right' : ''}`}>{msg.time}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                {!isTakenOver && <div className="mb-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-xs text-purple-700"><Bot className="w-3.5 h-3.5" />AI is currently handling this conversation</div>}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <div className="flex gap-1.5 mb-1.5">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Paperclip className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Smile className="w-4 h-4 text-gray-500" /></button>
                      {selected.channel === 'phone' && <button className="px-2.5 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs font-semibold flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5" />Join Call</button>}
                    </div>
                    <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={isTakenOver ? 'Type your message...' : "AI is handling... Click 'Take Over' to respond"} disabled={!isTakenOver} rows={2} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${!isTakenOver ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} />
                  </div>
                  <button onClick={handleSend} disabled={!isTakenOver || !messageInput.trim()} className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${isTakenOver && messageInput.trim() ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unified Inbox</h3>
                <p className="text-gray-500 max-w-sm text-sm">Select a conversation to view messages from SMS, Email, Phone, Web Chat, and Social Media</p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {selected && (
          <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Customer Details</h3>
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600">Lead Score</span>
                <span className={`text-xl font-bold ${selected.leadScore >= 80 ? 'text-red-600' : selected.leadScore >= 60 ? 'text-orange-600' : 'text-gray-600'}`}>{selected.leadScore}</span>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div className={`h-full ${selected.leadScore >= 80 ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-orange-400'}`} style={{ width: `${selected.leadScore}%` }} />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {selected.customerInfo.company && <div><div className="text-[10px] text-gray-500 mb-0.5">Company</div><div className="text-sm font-semibold text-gray-900">{selected.customerInfo.company}</div></div>}
              {selected.customerInfo.email && <div><div className="text-[10px] text-gray-500 mb-0.5">Email</div><div className="text-sm text-gray-800 truncate">{selected.customerInfo.email}</div></div>}
              {selected.customerInfo.phone && <div><div className="text-[10px] text-gray-500 mb-0.5">Phone</div><div className="text-sm text-gray-800">{selected.customerInfo.phone}</div></div>}
              {selected.customerInfo.location && <div><div className="text-[10px] text-gray-500 mb-0.5">Location</div><div className="text-sm text-gray-800">{selected.customerInfo.location}</div></div>}
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions</p>
              <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Book Appointment</button>
              <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Send Proposal</button>
              <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5" />Schedule Call</button>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {selected.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{tag}</span>)}
                <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">+ Add</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LandingPageFooter />
    </div>
  );
}
