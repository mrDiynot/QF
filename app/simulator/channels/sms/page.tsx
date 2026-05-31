'use client';

/**
 * SMS Simulator Page
 * Test inbound/outbound SMS messaging
 */

import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Send,
  RefreshCw,
  CheckCheck,
  User,
  Bot,
  Sparkles,
  MessageSquare,
  ArrowDownLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { simulatorWebhooksService, ProvisionedNumber } from '@/services/api/simulator-webhooks.service';
import { useSimulatorTheme } from '../../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SMSMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  isAiResponse?: boolean;
}

const defaultTestContacts = [
  { id: '1', number: '+15551234567', name: 'John Doe', type: 'lead' },
  { id: '2', number: '+15559876543', name: 'Sarah Johnson', type: 'customer' },
  { id: '3', number: '+15554567890', name: 'Mike Chen', type: 'lead' },
];

const quickReplies = [
  "Hi, I'm interested in your services",
  "What are your pricing options?",
  "Can I schedule a demo?",
  "I have a question about...",
  "Thanks for the information!",
];

// AI responses reserved for auto-reply feature
const aiResponses = [
  "Thanks for reaching out! I'd be happy to help. What specific information are you looking for?",
  "Great question! Our pricing starts at $99/month for the SmartFlow plan. Would you like me to share more details?",
  "Absolutely! I can help you schedule a demo. What day works best for you this week?",
  "I understand. Let me connect you with one of our specialists who can assist you better.",
  "You're welcome! Is there anything else I can help you with?",
];
void aiResponses;

export default function SMSSimulatorPage() {
  const { darkMode } = useSimulatorTheme();
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState(defaultTestContacts[0]);
  const [messageInput, setMessageInput] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [provisionedNumbers, setProvisionedNumbers] = useState<ProvisionedNumber[]>([]);
  const [selectedBusinessNumber, setSelectedBusinessNumber] = useState<string>('');
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch provisioned phone numbers on mount
  useEffect(() => {
    const fetchNumbers = async () => {
      setIsLoadingNumbers(true);
      try {
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

  const handleSendInbound = async () => {
    if (!messageInput.trim() || !selectedBusinessNumber) return;

    const newMessage: SMSMessage = {
      id: Date.now().toString(),
      direction: 'inbound',
      content: messageInput,
      from: selectedContact.number,
      to: selectedBusinessNumber,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    setIsSending(true);
    setLastError(null);

    try {
      // Call the real Twilio webhook
      const result = await simulatorWebhooksService.simulateInboundSms({
        from: selectedContact.number,
        to: selectedBusinessNumber,
        body: messageInput,
        fromCity: 'Test City',
        fromState: 'CA',
        fromCountry: 'US',
      });

      if (result.success) {
        // Update message status to delivered
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'delivered' } : m
          )
        );

        // If AI is enabled and we got a TwiML response, show it
        if (aiEnabled && result.twimlResponse) {
          setIsTyping(true);
          setTimeout(() => {
            const aiMessage: SMSMessage = {
              id: (Date.now() + 1).toString(),
              direction: 'outbound',
              content: 'Message received and processed. Lead created/updated.',
              from: selectedBusinessNumber,
              to: selectedContact.number,
              timestamp: new Date(),
              status: 'delivered',
              isAiResponse: true,
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
          }, 1000);
        }
      } else {
        // Update message status to failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'failed' } : m
          )
        );
        setLastError(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending simulated SMS:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'failed' } : m
        )
      );
      setLastError('Failed to connect to webhook endpoint');
    } finally {
      setIsSending(false);
    }
  };

  // Outbound SMS handler - reserved for agent-initiated messages
  const handleSendOutbound = async () => {
    if (!messageInput.trim() || !selectedBusinessNumber) return;

    const newMessage: SMSMessage = {
      id: Date.now().toString(),
      direction: 'outbound',
      content: messageInput,
      from: selectedBusinessNumber,
      to: selectedContact.number,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    setIsSending(true);

    try {
      const result = await simulatorWebhooksService.sendOutboundSms(
        selectedContact.number,
        messageInput
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id
            ? { ...m, status: result.success ? 'delivered' : 'failed' }
            : m
        )
      );

      if (!result.success) {
        setLastError(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending outbound SMS:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'failed' } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };
  void handleSendOutbound;

  const handleQuickReply = (text: string) => {
    setMessageInput(text);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={cn(
        "shrink-0 border-b backdrop-blur-xl",
        darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/80"
      )}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>SMS Simulator</h1>
                <p className={cn("text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>Test SMS messaging flows with real Twilio webhooks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingNumbers ? (
                <Badge variant="outline" className="border-slate-500/50 text-slate-400 gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </Badge>
              ) : provisionedNumbers.length > 0 ? (
                <Badge variant="outline" className="border-green-500/50 text-green-400 gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {provisionedNumbers.length} Number{provisionedNumbers.length > 1 ? 's' : ''} Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  No Numbers Configured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <aside className={cn(
          "w-72 shrink-0 border-r overflow-y-auto",
          darkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-50"
        )}>
          <div className="p-4 space-y-6">
            {/* Business Number Selection */}
            {provisionedNumbers.length > 0 && (
              <div>
                <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                  Business Number (To)
                </Label>
                <Select value={selectedBusinessNumber} onValueChange={setSelectedBusinessNumber}>
                  <SelectTrigger className={cn(darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300")}>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    {provisionedNumbers.map((num) => (
                      <SelectItem key={num.id} value={num.phoneNumber}>
                        {num.friendlyName || num.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {provisionedNumbers.length === 0 && !isLoadingNumbers && (
              <div className={cn("p-4 rounded-lg border", darkMode ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200")}>
                <p className={cn("text-sm font-medium", darkMode ? "text-amber-400" : "text-amber-700")}>No Phone Numbers</p>
                <p className={cn("text-xs mt-1", darkMode ? "text-amber-400/70" : "text-amber-600")}>
                  Configure a Twilio phone number in Channels settings to test SMS.
                </p>
              </div>
            )}

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Contact Selection */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Test Contact (From)
              </Label>
              <div className="space-y-2">
                {defaultTestContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all border',
                      selectedContact.id === contact.id
                        ? 'bg-green-500/20 border-green-500/50'
                        : darkMode 
                          ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={selectedContact.id === contact.id ? 'bg-green-500/30' : darkMode ? 'bg-slate-700' : 'bg-slate-200'}>
                          {contact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={cn("font-medium text-sm", darkMode ? "text-white" : "text-slate-900")}>{contact.name}</p>
                        <p className={cn("text-xs font-mono", darkMode ? "text-slate-500" : "text-slate-400")}>{contact.number}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* AI Settings */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                AI Settings
              </Label>
              <div className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"
                )}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className={cn("text-sm", darkMode ? "text-white" : "text-slate-900")}>Show AI Response</span>
                  </div>
                  <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                </div>
                {aiEnabled && (
                  <p className={cn("text-xs", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Shows confirmation when message is processed
                  </p>
                )}
              </div>
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Quick Replies */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Quick Messages
              </Label>
              <div className="space-y-2">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(reply)}
                    className={cn(
                      "w-full p-2 text-left text-xs rounded-lg border transition-colors",
                      darkMode 
                        ? "bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50 text-slate-300"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                    )}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Stats */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Session Stats
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"
                )}>
                  <p className="text-lg font-bold text-green-400">
                    {messages.filter((m) => m.direction === 'inbound').length}
                  </p>
                  <p className={cn("text-[10px]", darkMode ? "text-slate-500" : "text-slate-400")}>Inbound</p>
                </div>
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"
                )}>
                  <p className="text-lg font-bold text-blue-400">
                    {messages.filter((m) => m.direction === 'outbound').length}
                  </p>
                  <p className={cn("text-[10px]", darkMode ? "text-slate-500" : "text-slate-400")}>Outbound</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {lastError && (
              <>
                <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />
                <div className={cn("p-3 rounded-lg border", darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200")}>
                  <p className={cn("text-xs font-medium", darkMode ? "text-red-400" : "text-red-700")}>Last Error</p>
                  <p className={cn("text-xs mt-1", darkMode ? "text-red-400/70" : "text-red-600")}>{lastError}</p>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <div className={cn("flex-1 flex flex-col", darkMode ? "bg-slate-950" : "bg-white")}>
          {/* Chat Header */}
          <div className={cn(
            "shrink-0 px-4 py-3 border-b flex items-center justify-between",
            darkMode ? "border-slate-800" : "border-slate-200"
          )}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-green-500/20 text-green-400">
                  {selectedContact.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={cn("font-medium", darkMode ? "text-white" : "text-slate-900")}>{selectedContact.name}</p>
                <p className={cn("text-xs font-mono", darkMode ? "text-slate-500" : "text-slate-400")}>{selectedContact.number}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={darkMode ? "border-slate-700" : "border-slate-300"}
              onClick={clearConversation}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className={cn("w-12 h-12 mx-auto mb-3", darkMode ? "text-slate-700" : "text-slate-300")} />
                  <p className={darkMode ? "text-slate-500" : "text-slate-400"}>No messages yet</p>
                  <p className={cn("text-xs mt-1", darkMode ? "text-slate-600" : "text-slate-400")}>
                    {provisionedNumbers.length > 0 
                      ? "Send an inbound message to test Twilio webhook"
                      : "Configure a phone number first to start testing"}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.direction === 'inbound' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-slate-700">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    'max-w-[70%]',
                    message.direction === 'outbound' && 'text-right'
                  )}>
                    <div className={cn(
                      'inline-block rounded-2xl px-4 py-2.5',
                      message.direction === 'inbound'
                        ? darkMode 
                          ? 'bg-slate-800 text-slate-200 rounded-bl-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        : 'bg-green-600 text-white rounded-br-md'
                    )}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={cn(
                      'flex items-center gap-2 mt-1',
                      message.direction === 'outbound' && 'justify-end'
                    )}>
                      {message.direction === 'outbound' && message.isAiResponse && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </Badge>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.direction === 'outbound' && (
                        <CheckCheck className={cn(
                          'w-3.5 h-3.5',
                          message.status === 'delivered' ? 'text-green-400' : 'text-slate-500'
                        )} />
                      )}
                    </div>
                  </div>
                  {message.direction === 'outbound' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-green-500/20">
                        <Bot className="w-4 h-4 text-green-400" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-end">
                <div className="bg-green-600/20 rounded-2xl rounded-br-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-green-500/20">
                    <Bot className="w-4 h-4 text-green-400" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={cn(
            "shrink-0 p-4 border-t",
            darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" />
                Inbound
              </Button>
              <span className={cn("text-xs", darkMode ? "text-slate-500" : "text-slate-400")}>
                Simulating message from {selectedContact.name} → {selectedBusinessNumber || 'No number selected'}
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInbound();
              }}
              className="flex items-center gap-3"
            >
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message to simulate inbound SMS..."
                className={cn(
                  "flex-1 min-h-[44px] max-h-32 resize-none",
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
                )}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                className="w-11 h-11 bg-green-600 hover:bg-green-700"
                disabled={!messageInput.trim() || isSending || !selectedBusinessNumber}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
