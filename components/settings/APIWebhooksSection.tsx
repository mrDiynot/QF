'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Key,
  Webhook,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { webhooksService, WebhookStatus } from '@/services/api/webhooks.service';
import { apiKeysService } from '@/services/api/api-keys.service';
import type { GenerateApiKeyResponse } from '@/services/api/api-keys.service';

export function APIWebhooksSection() {
  const queryClient = useQueryClient();
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [generatedApiKey, setGeneratedApiKey] = useState<GenerateApiKeyResponse | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Fetch API keys from API
  const { data: apiKeys = [], isLoading: isLoadingApiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysService.getAll,
  });

  // Fetch webhooks from API
  const { data: webhooks = [], isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksService.getAll,
  });

  // Generate API key mutation
  const generateApiKeyMutation = useMutation({
    mutationFn: apiKeysService.generate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setGeneratedApiKey(data);
      setNewApiKeyName('');
      setShowGenerateDialog(false);
      toast.success('API key generated successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to generate API key');
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: apiKeysService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to delete API key');
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: webhooksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setNewWebhookUrl('');
      setSelectedEvents([]);
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
      if (data.status === 1) { // Success
        toast.success('Webhook test successful');
      } else {
        toast.error(data.errorMessage || 'Webhook test failed');
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to test webhook');
    },
  });

  const availableEvents = [
    { value: 'lead.created', label: 'Lead Created' },
    { value: 'lead.qualified', label: 'Lead Qualified' },
    { value: 'lead.updated', label: 'Lead Updated' },
    { value: 'conversation.started', label: 'Conversation Started' },
    { value: 'conversation.message_received', label: 'Message Received' },
    { value: 'conversation.message_sent', label: 'Message Sent' },
    { value: 'form.submitted', label: 'Form Submitted' },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleGenerateApiKey = () => {
    if (!newApiKeyName) {
      toast.error('Please enter a name for the API key');
      return;
    }
    generateApiKeyMutation.mutate({ name: newApiKeyName });
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      deleteApiKeyMutation.mutate(id);
    }
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
    createWebhookMutation.mutate({
      url: newWebhookUrl,
      events: selectedEvents,
    });
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteWebhookMutation.mutate(id);
    }
  };

  const handleTestWebhook = (id: string) => {
    testWebhookMutation.mutate(id);
  };

  const getWebhookStatusBadge = (status: WebhookStatus) => {
    switch (status) {
      case WebhookStatus.Active:
        return (
          <Badge variant="default" className="bg-green-500">
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
            <XCircle className="size-3 mr-1" />
            Disabled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Generated API Key Dialog */}
      {generatedApiKey && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-900">API Key Generated Successfully!</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedApiKey(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white border border-green-200 rounded-lg">
              <Label className="text-sm font-medium text-green-900">Your API Key</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 p-2 bg-muted/20 border rounded text-sm font-mono break-all">
                  {generatedApiKey.apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedApiKey.apiKey, 'API key')}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">
                <strong>⚠️ Important:</strong> This is the only time you&apos;ll see this API key.
                Copy it now and store it securely. You won&apos;t be able to retrieve it again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate API Key Dialog */}
      {showGenerateDialog && (
        <Card className="border-brand-purple">
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
            <CardDescription>
              Create a new API key for programmatic access to Qualiflow AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKeyName">API Key Name</Label>
              <Input
                id="apiKeyName"
                placeholder="e.g., Production API Key"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateApiKey}
                disabled={generateApiKeyMutation.isPending}
                className="gap-2"
              >
                {generateApiKeyMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="size-4" />
                    Generate Key
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerateDialog(false);
                  setNewApiKeyName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Key className="size-5 text-brand-purple" />
                <CardTitle>API Keys</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Manage API keys for programmatic access to Qualiflow AI
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowGenerateDialog(true)}
            >
              <Plus className="size-4" />
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingApiKeys ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-brand-purple" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Key className="size-12 mx-auto mb-3 opacity-50" />
              <p>No API keys yet. Generate your first key to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apiKey.name}</span>
                      <Badge variant={apiKey.isActive ? 'default' : 'secondary'} className="text-xs">
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-text-secondary">
                        {apiKey.maskedKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.maskedKey, 'Masked API key')}
                        className="size-6 p-0"
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Last used: {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    disabled={deleteApiKeyMutation.isPending}
                  >
                    {deleteApiKeyMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 bg-muted/30 border border-border rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> Keep your API keys secure. Never share them publicly or commit them to version control.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Webhooks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Webhook className="size-5 text-brand-purple" />
                <CardTitle>Webhooks</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Configure webhooks to receive real-time notifications
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open('/docs/webhooks', '_blank')}
            >
              <ExternalLink className="size-4" />
              View Documentation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Webhooks */}
          {isLoadingWebhooks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-brand-purple" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Webhook className="size-12 mx-auto mb-2 opacity-50" />
              <p>No webhooks configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{webhook.url}</code>
                        {getWebhookStatusBadge(webhook.status)}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      {webhook.description && (
                        <p className="text-sm text-text-secondary">{webhook.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-text-secondary">
                        {webhook.lastSuccessAt && (
                          <span className="text-green-600">
                            Last success: {new Date(webhook.lastSuccessAt).toLocaleString()}
                          </span>
                        )}
                        {webhook.lastFailureAt && (
                          <span className="text-red-600">
                            Last failure: {new Date(webhook.lastFailureAt).toLocaleString()}
                          </span>
                        )}
                        {webhook.consecutiveFailures > 0 && (
                          <span className="text-orange-600">
                            {webhook.consecutiveFailures} consecutive failures
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.id)}
                        disabled={testWebhookMutation.isPending}
                      >
                        {testWebhookMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
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
                </div>
              ))}
            </div>
          )}

          {/* Add New Webhook */}
          <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
            <h4 className="font-semibold">Add New Webhook</h4>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://your-domain.com/webhooks/qualiflow"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                disabled={createWebhookMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableEvents.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/20"
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
                      className="rounded"
                      disabled={createWebhookMutation.isPending}
                    />
                    <span className="text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleCreateWebhook}
              disabled={createWebhookMutation.isPending}
            >
              {createWebhookMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Webhook
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

