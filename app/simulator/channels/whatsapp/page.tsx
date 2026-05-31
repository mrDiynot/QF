'use client';

/**
 * WhatsApp Simulator Page
 * Test WhatsApp Business messaging flows
 */

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Sparkles,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  MoreVertical,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { simulatorWebhooksService, ProvisionedNumber } from '@/services/api/simulator-webhooks.service';
import { useSimulatorTheme } from '../../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface WhatsAppMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  type: 'text' | 'image' | 'document' | 'template';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isAiResponse?: boolean;
}

const defaultTestContacts = [
  { id: '1', number: '+15551234567', name: 'John Doe', avatar: null, lastSeen: 'online' },
  { id: '2', number: '+15559876543', name: 'Sarah Johnson', avatar: null, lastSeen: '5 min ago' },
  { id: '3', number: '+15554567890', name: 'Mike Chen', avatar: null, lastSeen: '1 hour ago' },
];

const messageTemplates = [
  { id: 'welcome', name: 'Welcome Message', content: 'Hello {{name}}! Thanks for reaching out to us.' },
  { id: 'appointment', name: 'Appointment Reminder', content: 'Hi {{name}}, this is a reminder for your appointment tomorrow at {{time}}.' },
  { id: 'follow_up', name: 'Follow Up', content: 'Hi {{name}}, just following up on our conversation. Do you have any questions?' },
];

// AI responses reserved for auto-reply feature
const aiResponses = [
  "Thanks for your message! I'm here to help. What can I assist you with today?",
  "Great question! Let me get that information for you.",
  "I understand. Let me connect you with the right person to help.",
  "Would you like to schedule a call to discuss this further?",
];
void aiResponses;

export default function WhatsAppSimulatorPage() {
  useSimulatorTheme();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState(defaultTestContacts[0]);
  const [messageInput, setMessageInput] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [provisionedNumbers, setProvisionedNumbers] = useState<ProvisionedNumber[]>([]);
  const [selectedBusinessNumber, setSelectedBusinessNumber] = useState<string>('');
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [, setLastError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch provisioned phone numbers on mount
  useEffect(() => {
    const fetchNumbers = async () => {
      setIsLoadingNumbers(true);
      try {
        // For WhatsApp, we'd typically filter by WhatsApp-enabled numbers
        const numbers = await simulatorWebhooksService.getProvisionedNumbers();
        setProvisionedNumbers(numbers);
        if (numbers.length > 0) {
          setSelectedBusinessNumber(numbers[0].phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching provisioned numbers:', error);
      } finally {
        setIsLoadingNumbers(false);
      }
    };
    fetchNumbers();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedBusinessNumber) return;

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      direction: 'inbound',
      content: messageInput,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    const msgContent = messageInput;
    setMessageInput('');
    setIsSending(true);
    setLastError(null);

    try {
      // Call the real Twilio WhatsApp webhook
      const result = await simulatorWebhooksService.simulateInboundWhatsApp({
        from: selectedContact.number,
        to: selectedBusinessNumber,
        body: msgContent,
        profileName: selectedContact.name,
      });

      if (result.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'delivered' } : m
          )
        );

        if (aiEnabled) {
          setIsTyping(true);
          setTimeout(() => {
            const aiMessage: WhatsAppMessage = {
              id: (Date.now() + 1).toString(),
              direction: 'outbound',
              content: 'Message received and processed. Lead created/updated.',
              type: 'text',
              timestamp: new Date(),
              status: 'read',
              isAiResponse: true,
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
          }, 1000);
        }
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'sending' } : m
          )
        );
        setLastError(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending simulated WhatsApp:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'sending' } : m
        )
      );
      setLastError('Failed to connect to webhook endpoint');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = (template: typeof messageTemplates[0]) => {
    const content = template.content
      .replace('{{name}}', selectedContact.name.split(' ')[0])
      .replace('{{time}}', '2:00 PM');

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      direction: 'outbound',
      content: content,
      type: 'template',
      timestamp: new Date(),
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-600 to-green-500">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">WhatsApp Simulator</h1>
                <p className="text-xs text-slate-400">Test WhatsApp Business messaging</p>
              </div>
            </div>
            {isLoadingNumbers ? (
              <Badge variant="outline" className="border-slate-500/50 text-slate-400 gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </Badge>
            ) : provisionedNumbers.length > 0 ? (
              <Badge variant="outline" className="border-green-500/50 text-green-400 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                WhatsApp Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1.5">
                <AlertCircle className="w-3 h-3" />
                No Numbers Configured
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - WhatsApp Style Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contact List */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-[#111b21] flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-slate-800">
            <Input
              placeholder="Search or start new chat"
              className="bg-[#202c33] border-0 text-slate-300 placeholder:text-slate-500"
            />
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {defaultTestContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={cn(
                  'w-full p-3 flex items-center gap-3 hover:bg-[#202c33] transition-colors',
                  selectedContact.id === contact.id && 'bg-[#2a3942]'
                )}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#6b7c85] text-white">
                    {contact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-xs text-slate-400">{contact.lastSeen}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">AI Auto-Reply</span>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#0b141a' }}>
          {/* WhatsApp Chat Background Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Chat Header */}
          <div className="shrink-0 px-4 py-2 border-b border-slate-800 bg-[#202c33] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#6b7c85] text-white">
                  {selectedContact.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{selectedContact.name}</p>
                <p className="text-xs text-green-400">{selectedContact.lastSeen}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#aebac1]">
              <Video className="w-5 h-5 cursor-pointer hover:text-white" />
              <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center bg-[#182229] rounded-lg p-6">
                  <div className="w-20 h-20 rounded-full bg-[#00a884]/20 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-[#00a884]" />
                  </div>
                  <p className="text-white font-medium mb-1">WhatsApp Business</p>
                  <p className="text-sm text-slate-400">
                    Send a message to start testing
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[65%] rounded-lg px-3 py-2 relative',
                    message.direction === 'inbound'
                      ? 'bg-[#202c33] rounded-tl-none'
                      : 'bg-[#005c4b] rounded-tr-none'
                  )}>
                    {message.type === 'template' && (
                      <Badge className="mb-1 text-[9px] bg-[#00a884]/20 text-[#00a884]">
                        Template
                      </Badge>
                    )}
                    <p className="text-sm text-white">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {message.isAiResponse && (
                        <Sparkles className="w-3 h-3 text-[#00a884]" />
                      )}
                      <span className="text-[10px] text-slate-400">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.direction === 'outbound' && (
                        <CheckCheck className={cn(
                          'w-4 h-4',
                          message.status === 'read' ? 'text-[#53bdeb]' : 'text-slate-400'
                        )} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-end">
                <div className="bg-[#005c4b] rounded-lg rounded-tr-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Templates */}
          <div className="shrink-0 px-4 py-2 border-t border-slate-800 bg-[#202c33] relative z-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-slate-400 shrink-0">Templates:</span>
              {messageTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-[#00a884]/50 text-[#00a884] hover:bg-[#00a884]/10 text-xs"
                  onClick={() => handleSendTemplate(template)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 py-3 bg-[#202c33] flex items-center gap-3 relative z-10">
            <Button variant="ghost" size="icon" className="text-[#aebac1] hover:text-white">
              <Smile className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#aebac1] hover:text-white">
              <Paperclip className="w-6 h-6" />
            </Button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex-1 flex items-center gap-3"
            >
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-[#2a3942] border-0 text-white placeholder:text-slate-500"
              />
              {messageInput ? (
                <Button
                  type="submit"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#00a884]/80"
                  disabled={isSending || !selectedBusinessNumber}
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#00a884]/80"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
