'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
  RefreshCw,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { integrationsService, CRMProviderType } from '@/services/api/integrations.service';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  status?: 'active' | 'error' | 'syncing';
  lastSync?: string;
  features: string[];
}

export function IntegrationsSection() {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // HubSpot OAuth mutation
  const hubSpotOAuthMutation = useMutation({
    mutationFn: async () => {
      setConnectingProvider('hubspot');
      const initiateResponse = await integrationsService.initiateHubSpot(window.location.href);
      const callbackData = await integrationsService.openOAuthPopup(
        initiateResponse.authorizationUrl,
        CRMProviderType.HubSpot
      );
      return await integrationsService.handleHubSpotCallback(callbackData);
    },
    onSuccess: (data) => {
      setConnectingProvider(null);
      if (data.success) {
        toast.success('HubSpot connected successfully!');
        // TODO: Refresh integrations list
      } else {
        toast.error(data.errorMessage || 'Failed to connect HubSpot');
      }
    },
    onError: (error: unknown) => {
      setConnectingProvider(null);
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to connect HubSpot');
    },
  });

  // Salesforce OAuth mutation
  const salesforceOAuthMutation = useMutation({
    mutationFn: async () => {
      setConnectingProvider('salesforce');
      const initiateResponse = await integrationsService.initiateSalesforce(window.location.href);
      const callbackData = await integrationsService.openOAuthPopup(
        initiateResponse.authorizationUrl,
        CRMProviderType.Salesforce
      );
      return await integrationsService.handleSalesforceCallback(callbackData);
    },
    onSuccess: (data) => {
      setConnectingProvider(null);
      if (data.success) {
        toast.success('Salesforce connected successfully!');
        // TODO: Refresh integrations list
      } else {
        toast.error(data.errorMessage || 'Failed to connect Salesforce');
      }
    },
    onError: (error: unknown) => {
      setConnectingProvider(null);
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to connect Salesforce');
    },
  });

  // All integrations start as disconnected - status is fetched from API
  const integrations: Integration[] = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync leads and contacts with HubSpot CRM',
      icon: (
        <div className="size-12 rounded-lg bg-orange-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-orange-600">H</span>
        </div>
      ),
      isConnected: false,
      features: ['Lead Sync', 'Contact Sync', 'Deal Sync', 'Two-way Sync'],
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Integrate with Salesforce CRM for lead management',
      icon: (
        <div className="size-12 rounded-lg bg-muted/50 flex items-center justify-center">
          <span className="text-2xl font-bold text-info">S</span>
        </div>
      ),
      isConnected: false,
      features: ['Lead Sync', 'Opportunity Sync', 'Account Sync', 'Custom Objects'],
    },
    {
      id: 'cal-com',
      name: 'Cal.com',
      description: 'Schedule meetings with Google Calendar sync built-in',
      icon: (
        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calendar className="size-6 text-primary" />
        </div>
      ),
      isConnected: false,
      features: ['Meeting Scheduling', 'Google Calendar Sync', 'Automated Booking', 'Video Links'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments and manage subscriptions',
      icon: (
        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <CreditCard className="size-6 text-primary" />
        </div>
      ),
      isConnected: false,
      features: ['Payment Processing', 'Subscription Management', 'Invoicing', 'Webhooks'],
    },
  ];

  const handleConnect = (integrationId: string) => {
    switch (integrationId) {
      case 'hubspot':
        hubSpotOAuthMutation.mutate();
        break;
      case 'salesforce':
        salesforceOAuthMutation.mutate();
        break;
      case 'cal-com':
        // Navigate to calendar settings page for Cal.com setup
        window.location.href = '/settings/calendar';
        break;
      case 'stripe':
        toast.info('Stripe integration coming soon');
        break;
      default:
        toast.error('Unknown integration');
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (confirm(`Are you sure you want to disconnect ${integrationId}?`)) {
      try {
        await integrationsService.disconnectIntegration(integrationId);
        toast.success(`${integrationId} disconnected successfully`);
        // Refresh integrations list
        window.location.reload();
      } catch {
        toast.error(`Failed to disconnect ${integrationId}`);
      }
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      toast.info(`Syncing ${integrationId}...`);
      const result = await integrationsService.syncIntegration(integrationId);
      if (result.success) {
        toast.success(`Synced ${result.syncedLeads} leads and ${result.syncedContacts} contacts`);
      } else {
        toast.error(`Sync completed with errors: ${result.errors?.join(', ')}`);
      }
    } catch {
      toast.error(`Failed to sync ${integrationId}`);
    }
  };

  const handleConfigure = (integrationId: string) => {
    // Navigate to integration-specific settings
    window.location.href = `/settings/integrations/${integrationId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Connected Integrations</h3>
          <p className="text-sm text-text-secondary">
            Manage your third-party integrations and data sync
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className={cn(
            "transition-all",
            integration.isConnected && "border-green-200 bg-green-50/50"
          )}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                {integration.isConnected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="size-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="size-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Status & Last Sync */}
              {integration.isConnected && integration.lastSync && (
                <div className="text-xs text-text-secondary">
                  {integration.status === 'syncing' && (
                    <div className="flex items-center gap-1 text-info">
                      <RefreshCw className="size-3 animate-spin" />
                      Syncing...
                    </div>
                  )}
                  {integration.status === 'active' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="size-3" />
                      Last synced: {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  )}
                  {integration.status === 'error' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="size-3" />
                      Sync failed - check configuration
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                {integration.isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      className="flex-1 gap-2"
                    >
                      <RefreshCw className="size-4" />
                      Sync Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigure(integration.id)}
                      className="gap-2"
                    >
                      <Settings className="size-4" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    disabled={connectingProvider === integration.id}
                    className="w-full gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
                  >
                    {connectingProvider === integration.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="size-4" />
                        Connect {integration.name}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="size-5 text-info" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Need Help with Integrations?</h4>
              <p className="text-sm text-info mt-1">
                Check our integration guides for step-by-step setup instructions and troubleshooting tips.
              </p>
              <Button variant="link" className="text-info p-0 h-auto mt-2">
                View Integration Guides →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

