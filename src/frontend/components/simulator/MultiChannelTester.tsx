'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Mail, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TestMessage {
  id: string;
  channel: 'sms' | 'whatsapp' | 'voice' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: Date;
}

export function MultiChannelTester() {
  const [activeChannel, setActiveChannel] = useState<'sms' | 'whatsapp' | 'voice' | 'email'>('sms');
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');

  const sendTestMessage = () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const newMessage: TestMessage = {
      id: Date.now().toString(),
      channel: activeChannel,
      direction: 'outbound',
      content: messageContent,
      status: 'pending',
      timestamp: new Date(),
    };

    setTestMessages([newMessage, ...testMessages]);
    setMessageContent('');

    // Simulate message delivery
    setTimeout(() => {
      setTestMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setTestMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 2000);

    toast.success(`Test ${activeChannel.toUpperCase()} message sent`);
  };

  const simulateInbound = () => {
    const inboundMessage: TestMessage = {
      id: Date.now().toString(),
      channel: activeChannel,
      direction: 'inbound',
      content: 'This is a simulated inbound message from a test customer.',
      status: 'delivered',
      timestamp: new Date(),
    };

    setTestMessages([inboundMessage, ...testMessages]);
    toast.success('Inbound message simulated');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'sent':
        return <CheckCircle2 className="size-4 text-info" />;
      case 'failed':
        return <XCircle className="size-4 text-red-600" />;
      default:
        return <Clock className="size-4 text-yellow-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
      case 'whatsapp':
        return <MessageSquare className="size-4" />;
      case 'voice':
        return <Phone className="size-4" />;
      case 'email':
        return <Mail className="size-4" />;
      default:
        return <MessageSquare className="size-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Channel Message Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as 'sms' | 'whatsapp' | 'voice' | 'email')}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value={activeChannel} className="space-y-4 mt-6">
            {/* Test Configuration */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Phone Number</label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <Select defaultValue="text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Enter test ${activeChannel} message...`}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={sendTestMessage} className="flex-1">
                  <Send className="size-4 mr-2" />
                  Send Test Message
                </Button>
                <Button onClick={simulateInbound} variant="outline">
                  Simulate Inbound
                </Button>
              </div>
            </div>

            {/* Message History */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Message History</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {testMessages.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    No test messages yet. Send a test message to get started.
                  </div>
                ) : (
                  testMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 border rounded-lg ${
                        msg.direction === 'inbound' ? 'bg-muted/30' : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(msg.channel)}
                          <Badge variant={msg.direction === 'inbound' ? 'default' : 'secondary'}>
                            {msg.direction}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {getStatusIcon(msg.status)}
                            {msg.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-text-secondary">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
