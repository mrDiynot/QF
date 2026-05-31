'use client';

/**
 * Integrations Dashboard Component
 * Displays actual business integrations from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plug,
  Search,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  AlertTriangle,
  Database,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Phone,
  Mail,
  Share2,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useChannels } from '@/hooks/api/useChannels';
import { integrationsService, CRMIntegrationStatus } from '@/services/api/integrations.service';
import { Channel } from '@/types/api';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'communication' | 'payment' | 'calendar' | 'analytics' | 'storage';
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  lastSync?: Date;
  config?: Record<string, unknown>;
  sourceType: 'channel' | 'crm' | 'calendar';
  sourceId?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  crm: { label: 'CRM', icon: <Users className="size-4" /> },
  communication: { label: 'Comms', icon: <MessageSquare className="size-4" /> },
  payment: { label: 'Payment', icon: <CreditCard className="size-4" /> },
  calendar: { label: 'Calendar', icon: <Calendar className="size-4" /> },
  analytics: { label: 'Analytics', icon: <BarChart3 className="size-4" /> },
  storage: { label: 'Storage', icon: <Database className="size-4" /> },
};

// Map channel types to integration display
const CHANNEL_TO_INTEGRATION: Record<string, { name: string; description: string; icon: React.ReactNode; category: 'communication' }> = {
  SMS: { name: 'SMS Messaging', description: 'Text messaging via Twilio', icon: <Phone className="size-5 text-info" />, category: 'communication' },
  Voice: { name: 'Voice Calls', description: 'Voice calling via Twilio', icon: <Phone className="size-5 text-success" />, category: 'communication' },
  WhatsApp: { name: 'WhatsApp', description: 'WhatsApp Business messaging', icon: <MessageSquare className="size-5 text-green-500" />, category: 'communication' },
  Email: { name: 'Email', description: 'Email communication channel', icon: <Mail className="size-5 text-blue-500" />, category: 'communication' },
  ChatWidget: { name: 'Web Chat', description: 'Website chat widget', icon: <MessageSquare className="size-5 text-purple-500" />, category: 'communication' },
  Facebook: { name: 'Facebook Messenger', description: 'Meta Messenger integration', icon: <Share2 className="size-5 text-blue-600" />, category: 'communication' },
  Instagram: { name: 'Instagram DMs', description: 'Instagram Direct Messages', icon: <Share2 className="size-5 text-pink-500" />, category: 'communication' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  connected: { label: 'Connected', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" /> },
  disconnected: { label: 'Not Connected', color: 'bg-muted/40 text-muted-foreground', icon: <XCircle className="size-3" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="size-3" /> },
};

interface IntegrationsDashboardProps {
  className?: string;
}

export function IntegrationsDashboard({ className }: IntegrationsDashboardProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [crmIntegrations, setCrmIntegrations] = useState<CRMIntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Fetch channels (communication integrations)
  const { data: channels, isLoading: channelsLoading } = useChannels();

  // Convert channels to integrations format
  const mapChannelToIntegration = useCallback((channel: Channel): Integration | null => {
    const channelType = channel.type?.toString() || '';
    const mapping = CHANNEL_TO_INTEGRATION[channelType];

    if (!mapping) return null;

    const hasError = channel.verificationStatus === 'Failed';
    const isConnected = channel.isActive && channel.verificationStatus !== 'Failed';

    return {
      id: `channel-${channel.id}`,
      name: channel.name || mapping.name,
      description: mapping.description,
      category: mapping.category,
      icon: mapping.icon,
      status: hasError ? 'error' : isConnected ? 'connected' : 'disconnected',
      enabled: channel.isActive,
      lastSync: channel.lastVerifiedAt ? new Date(channel.lastVerifiedAt) : undefined,
      sourceType: 'channel',
      sourceId: channel.id,
    };
  }, []);

  // Fetch CRM integrations from API
  const fetchCrmIntegrations = useCallback(async () => {
    try {
      const data = await integrationsService.getIntegrations();
      setCrmIntegrations(data);
    } catch {
      // CRM integrations endpoint might not exist yet - silently handle
      setCrmIntegrations([]);
    }
  }, []);

  // Build integrations list from real data
  useEffect(() => {
    if (channelsLoading) return;

    const channelIntegrations: Integration[] = [];

    // Add channel-based integrations
    if (channels && channels.length > 0) {
      channels.forEach((channel: Channel) => {
        const integration = mapChannelToIntegration(channel);
        if (integration) {
          channelIntegrations.push(integration);
        }
      });
    }

    // Add CRM integrations
    const crmIntegrationsList: Integration[] = crmIntegrations.map(crm => ({
      id: `crm-${crm.id}`,
      name: crm.providerType,
      description: `${crm.providerType} CRM integration`,
      category: 'crm' as const,
      icon: <Users className="size-5 text-orange-500" />,
      status: crm.isConnected ? 'connected' : 'disconnected',
      enabled: crm.isConnected,
      lastSync: crm.lastSyncAt ? new Date(crm.lastSyncAt) : undefined,
      sourceType: 'crm' as const,
      sourceId: crm.id,
    }));

    setIntegrations([...channelIntegrations, ...crmIntegrationsList]);
    setIsLoading(false);
  }, [channels, channelsLoading, crmIntegrations, mapChannelToIntegration]);

  // Initial fetch
  useEffect(() => {
    fetchCrmIntegrations();
  }, [fetchCrmIntegrations]);

  // Filter integrations
  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || int.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  // Sync integration
  const syncIntegration = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.sourceType === 'crm' && integration.sourceId) {
      try {
        await integrationsService.syncIntegration(integration.sourceId);
        toast.success('Sync started');
        // Refresh CRM integrations
        fetchCrmIntegrations();
      } catch {
        toast.error('Failed to sync');
      }
    } else {
      toast.info('Manual sync not available for this integration');
    }
  };

  // Open config
  const openConfig = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect your favorite tools and services
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Globe className="size-4" />
          Request Integration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plug className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{errorCount}</p>
              <p className="text-xs text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="crm" className="text-xs">CRM</TabsTrigger>
              <TabsTrigger value="communication" className="text-xs">Comms</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs hidden sm:flex">Calendar</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs hidden sm:flex">Analytics</TabsTrigger>
              <TabsTrigger value="storage" className="text-xs hidden sm:flex">Storage</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="size-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      )}

      {/* Integrations Grid */}
      {!isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const statusConfig = STATUS_CONFIG[integration.status];
            const categoryConfig = CATEGORY_CONFIG[integration.category];

            return (
              <Card key={integration.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/40">
                      {integration.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{integration.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {categoryConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="secondary" className={cn("gap-1", statusConfig.color)}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                <div className="flex items-center justify-between">
                  {integration.lastSync && integration.status === 'connected' && (
                    <p className="text-xs text-muted-foreground/60">
                      Last synced {formatDistanceToNow(integration.lastSync, { addSuffix: true })}
                    </p>
                  )}

                  {integration.status === 'connected' && (
                    <div className="flex gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => syncIntegration(integration.id)}
                        title="Sync now"
                      >
                        <RefreshCw className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openConfig(integration)}
                        title="Configure"
                      >
                        <Settings className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredIntegrations.length === 0 && (
        <Card className="p-12 text-center">
          <Plug className="size-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {integrations.length === 0
              ? "No integrations configured. Set up your first channel to get started."
              : "No integrations found matching your search."
            }
          </p>
        </Card>
      )}

      {/* Config Dialog */}
      <Modal open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <ModalContent size="md">
          {selectedIntegration && (
            <>
              <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedIntegration.icon}</span>
                  {selectedIntegration.name} Settings
                </ModalTitle>
                <ModalDescription>
                  Configure your {selectedIntegration.name} integration
                </ModalDescription>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <Badge className={STATUS_CONFIG[selectedIntegration.status].color}>
                      {STATUS_CONFIG[selectedIntegration.status].label}
                    </Badge>
                  </div>
                  {selectedIntegration.lastSync && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last synced {formatDistanceToNow(selectedIntegration.lastSync, { addSuffix: true })}
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="size-4" />
                  Sync Now
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="size-4" />
                  View Documentation
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" className="text-red-600">
                  Disconnect
                </Button>
                <Button onClick={() => setConfigDialogOpen(false)}>
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
