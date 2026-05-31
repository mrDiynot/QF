'use client';

/**
 * Webhooks Section Component
 * 
 * Manages webhook configuration for real-time event notifications.
 * Extracted from APIWebhooksSection for better code organization and lazy loading.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Webhook,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { webhooksService, WebhookStatus } from '@/services/api/webhooks.service';

const AVAILABLE_EVENTS = [
  { value: 'lead.created', label: 'Lead Created', description: 'When a new lead is captured' },
  { value: 'lead.qualified', label: 'Lead Qualified', description: 'When a lead passes qualification' },
  { value: 'lead.updated', label: 'Lead Updated', description: 'When lead data changes' },
  { value: 'conversation.started', label: 'Conversation Started', description: 'When a new conversation begins' },
  { value: 'conversation.message_received', label: 'Message Received', description: 'When a message is received' },
  { value: 'conversation.message_sent', label: 'Message Sent', description: 'When a message is sent' },
  { value: 'form.submitted', label: 'Form Submitted', description: 'When a form is submitted' },
];

export function WebhooksSection() {
  const queryClient = useQueryClient();
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookDescription, setNewWebhookDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);

  // Fetch webhooks with optimized caching
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: webhooksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      resetForm();
      toast.success('Webhook created successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to create webhook');
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: webhooksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to delete webhook');
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: webhooksService.test,
    onSuccess: (data) => {
      if (data.status === 1) {
        toast.success('Webhook test successful!', {
          description: data.durationMs ? `Response received in ${data.durationMs}ms` : undefined,
        });
      } else {
        toast.error(data.errorMessage || 'Webhook test failed');
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to test webhook');
    },
  });

  const resetForm = () => {
    setNewWebhookUrl('');
    setNewWebhookDescription('');
    setSelectedEvents([]);
    setIsAddingWebhook(false);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }
    
    // Validate URL format
    try {
      new URL(newWebhookUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    createWebhookMutation.mutate({
      url: newWebhookUrl,
      events: selectedEvents,
      description: newWebhookDescription || undefined,
    });
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteWebhookMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: WebhookStatus) => {
    switch (status) {
      case WebhookStatus.Active:
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            Active
          </Badge>
        );
      case WebhookStatus.Inactive:
        return (
          <Badge variant="secondary">
            <XCircle className="size-3 mr-1" />
            Inactive
          </Badge>
        );
      case WebhookStatus.Disabled:
        return (
          <Badge variant="destructive">
            <AlertTriangle className="size-3 mr-1" />
            Disabled
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3 mt-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Webhook className="size-5 text-purple-600" />
            Webhooks
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Receive real-time notifications when events occur in your account
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('/docs/webhooks', '_blank')}
          >
            <ExternalLink className="size-4" />
            Documentation
          </Button>
          {!isAddingWebhook && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setIsAddingWebhook(true)}
            >
              <Plus className="size-4" />
              Add Webhook
            </Button>
          )}
        </div>
      </div>

      {/* Add New Webhook Form */}
      {isAddingWebhook && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-base">Add New Webhook</CardTitle>
            <CardDescription>Configure a new webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-domain.com/webhooks/qualiflow"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  disabled={createWebhookMutation.isPending}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="webhookDescription">Description (optional)</Label>
                <Input
                  id="webhookDescription"
                  placeholder="e.g., CRM sync webhook"
                  value={newWebhookDescription}
                  onChange={(e) => setNewWebhookDescription(e.target.value)}
                  disabled={createWebhookMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Events to Subscribe *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEvents.includes(event.value)
                        ? 'border-purple-300 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents([...selectedEvents, event.value]);
                        } else {
                          setSelectedEvents(selectedEvents.filter((ev) => ev !== event.value));
                        }
                      }}
                      className="mt-1 rounded"
                      disabled={createWebhookMutation.isPending}
                    />
                    <div>
                      <span className="text-sm font-medium">{event.label}</span>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateWebhook}
                disabled={createWebhookMutation.isPending}
                className="gap-2"
              >
                {createWebhookMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Create Webhook
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Webhooks */}
      {webhooks.length === 0 && !isAddingWebhook ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="size-12 text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900">No webhooks configured</h4>
            <p className="text-sm text-gray-500 mt-1 text-center max-w-sm">
              Create a webhook to receive real-time notifications when leads are captured,
              qualified, or when conversations happen.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setIsAddingWebhook(true)}>
              <Plus className="size-4" />
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-md">
                        {webhook.url}
                      </code>
                      {getStatusBadge(webhook.status)}
                    </div>
                    {webhook.description && (
                      <p className="text-sm text-gray-600">{webhook.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      {webhook.lastSuccessAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="size-3" />
                          Last success: {new Date(webhook.lastSuccessAt).toLocaleString()}
                        </span>
                      )}
                      {webhook.consecutiveFailures > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="size-3" />
                          {webhook.consecutiveFailures} consecutive failures
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => testWebhookMutation.mutate(webhook.id)}
                      disabled={testWebhookMutation.isPending}
                    >
                      {testWebhookMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      disabled={deleteWebhookMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 h-fit">
              <Webhook className="size-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Webhook Security</h4>
              <p className="text-sm text-blue-700 mt-1">
                All webhook payloads include a signature header (<code className="bg-blue-100 px-1 rounded">X-QualiFlow-Signature</code>)
                that you can use to verify the request originated from QualiFlow AI.
                Check our documentation for verification examples.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

