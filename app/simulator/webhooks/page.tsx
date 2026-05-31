'use client';

/**
 * Webhook Inspector Page
 * Monitor and test webhook payloads
 */

import { useState, useEffect } from 'react';
import {
  Webhook,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Play,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { webhooksService } from '@/services/api/webhooks.service';
import { useSimulatorTheme } from '../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WebhookEvent {
  id: string;
  direction: 'inbound' | 'outbound';
  type: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: number;
  duration: number;
  timestamp: Date;
  headers: Record<string, string>;
  payload: object;
  response?: object;
}

const mockEvents: WebhookEvent[] = [
  {
    id: '1',
    direction: 'inbound',
    type: 'form.submitted',
    url: '/api/v1/webhooks/forms',
    method: 'POST',
    status: 200,
    duration: 45,
    timestamp: new Date(Date.now() - 60000),
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=abc123...' },
    payload: { event: 'form.submitted', formId: 'form_123', submissionId: 'sub_456', data: { name: 'John', email: 'john@example.com' } },
    response: { success: true, leadId: 'lead_789' },
  },
  {
    id: '2',
    direction: 'outbound',
    type: 'lead.qualified',
    url: 'https://crm.example.com/webhooks/leads',
    method: 'POST',
    status: 201,
    duration: 234,
    timestamp: new Date(Date.now() - 120000),
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token...' },
    payload: { event: 'lead.qualified', leadId: 'lead_789', score: 85, qualifiedAt: '2024-12-16T12:00:00Z' },
    response: { received: true, crmId: 'crm_001' },
  },
  {
    id: '3',
    direction: 'inbound',
    type: 'twilio.sms',
    url: '/api/v1/webhooks/twilio/sms',
    method: 'POST',
    status: 200,
    duration: 67,
    timestamp: new Date(Date.now() - 180000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload: { From: '+15551234567', To: '+18005550199', Body: 'Hello!' },
    response: { success: true, messageId: 'msg_abc' },
  },
  {
    id: '4',
    direction: 'outbound',
    type: 'slack.notification',
    url: 'https://hooks.slack.com/services/T00/B00/xxx',
    method: 'POST',
    status: 500,
    duration: 1234,
    timestamp: new Date(Date.now() - 240000),
    headers: { 'Content-Type': 'application/json' },
    payload: { text: 'New lead: John Doe', channel: '#leads' },
    response: { error: 'channel_not_found' },
  },
];

const webhookTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'form.submitted', label: 'Form Submitted' },
  { value: 'lead.created', label: 'Lead Created' },
  { value: 'lead.qualified', label: 'Lead Qualified' },
  { value: 'message.received', label: 'Message Received' },
  { value: 'twilio.sms', label: 'Twilio SMS' },
];

interface ConfiguredWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export default function WebhookInspectorPage() {
  useSimulatorTheme();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [filter, setFilter] = useState('all');
  const [testUrl, setTestUrl] = useState('https://');
  const [testPayload, setTestPayload] = useState('{\n  "event": "test",\n  "data": {}\n}');
  const [, setConfiguredWebhooks] = useState<ConfiguredWebhook[]>([]);
  const [, setIsLoadingWebhooks] = useState(true);
  const [, setIsLoadingEvents] = useState(true);

  // Fetch configured webhooks and recent deliveries on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingWebhooks(true);
      setIsLoadingEvents(true);
      try {
        // Fetch webhooks
        const webhooksData = await webhooksService.getAll();
        setConfiguredWebhooks(webhooksData as unknown as ConfiguredWebhook[]);

        // Fetch recent webhook deliveries
        try {
          const deliveries = await webhooksService.getRecentActivity(20);
          // Transform deliveries to WebhookEvent format
          const transformedEvents: WebhookEvent[] = deliveries.map((d) => ({
            id: d.id,
            direction: 'outbound' as const,
            type: d.eventType,
            url: webhooksData.find(w => w.id === d.webhookId)?.url || 'Unknown',
            method: 'POST' as const,
            status: d.responseCode || (d.status === 1 ? 200 : 500),
            duration: d.durationMs || 0,
            timestamp: new Date(d.createdAt),
            headers: { 'Content-Type': 'application/json' },
            payload: { event: d.eventType, webhookId: d.webhookId },
            response: d.errorMessage ? { error: d.errorMessage } : { success: true },
          }));
          
          // Combine with mock events if no real events
          if (transformedEvents.length > 0) {
            setEvents(transformedEvents);
          } else {
            setEvents(mockEvents);
          }
        } catch {
          // Fall back to mock events if API fails
          setEvents(mockEvents);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setEvents(mockEvents);
      } finally {
        setIsLoadingWebhooks(false);
        setIsLoadingEvents(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  const getStatusColor = (status: number) => {
    if (status < 300) return 'text-emerald-400';
    if (status < 400) return 'text-amber-400';
    return 'text-red-400';
  };

  const handleTestWebhook = () => {
    // Simulate sending a test webhook
    const newEvent: WebhookEvent = {
      id: Date.now().toString(),
      direction: 'outbound',
      type: 'test.webhook',
      url: testUrl,
      method: 'POST',
      status: Math.random() > 0.2 ? 200 : 500,
      duration: Math.floor(Math.random() * 500) + 50,
      timestamp: new Date(),
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.parse(testPayload),
      response: { success: true },
    };
    setEvents([newEvent, ...events]);
    setSelectedEvent(newEvent);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600">
                <Webhook className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Webhook Inspector</h1>
                <p className="text-xs text-slate-400">Monitor inbound and outbound webhooks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Listening
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Events List */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col">
          {/* Filters */}
          <div className="shrink-0 p-3 border-b border-slate-800 flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {webhookTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              onClick={() => setEvents([])}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Events */}
          <ScrollArea className="flex-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Webhook className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                <p>No webhook events captured</p>
                <p className="text-xs text-slate-600 mt-1">Events will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-slate-800/50 transition-colors',
                      selectedEvent?.id === event.id && 'bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {event.direction === 'inbound' ? (
                        <ArrowDownLeft className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-violet-400 shrink-0" />
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {event.type}
                      </Badge>
                      <span className={cn('text-xs font-mono', getStatusColor(event.status))}>
                        {event.status}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums ml-auto">
                        {event.duration}ms
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 truncate font-mono">{event.url}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Details Panel */}
        <div className="w-1/2 flex flex-col bg-slate-950">
          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-slate-800 bg-transparent p-0 h-12">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="test"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4"
              >
                Test Webhook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto m-0">
              {selectedEvent ? (
                <div className="p-4 space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {selectedEvent.status < 300 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={cn('text-lg font-mono', getStatusColor(selectedEvent.status))}>
                      {selectedEvent.status}
                    </span>
                    <Badge variant="secondary">
                      {selectedEvent.method}
                    </Badge>
                    <span className="text-sm text-slate-500">{selectedEvent.duration}ms</span>
                  </div>

                  {/* URL */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">URL</Label>
                    <code className="block p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-slate-300 break-all">
                      {selectedEvent.url}
                    </code>
                  </div>

                  {/* Headers */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">Headers</Label>
                    <pre className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.headers, null, 2)}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">Payload</Label>
                    <pre className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>

                  {/* Response */}
                  {selectedEvent.response && (
                    <div>
                      <Label className="text-xs text-slate-500 mb-1.5 block">Response</Label>
                      <pre className={cn(
                        'p-3 rounded-lg border text-xs font-mono overflow-x-auto',
                        selectedEvent.status < 300
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      )}>
                        {JSON.stringify(selectedEvent.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center text-slate-500">
                    <ChevronRight className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                    <p>Select an event to view details</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="flex-1 p-4 overflow-auto m-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Webhook URL</Label>
                  <Input
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://your-endpoint.com/webhook"
                    className="bg-slate-800 border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Payload (JSON)</Label>
                  <Textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="bg-slate-800 border-slate-700 font-mono min-h-[200px] resize-none"
                  />
                </div>
                <Button
                  onClick={handleTestWebhook}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Send Test Webhook
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
