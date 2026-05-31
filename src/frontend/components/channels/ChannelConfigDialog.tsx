'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle, ModalFooter } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Phone, Instagram, Facebook, Save, X, Loader2 } from 'lucide-react';
import { channelsService } from '@/services/api/channels.service';
import { toast } from 'sonner';
import type { Channel } from '@/types/api';

interface ChannelConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelType: 'SMS' | 'Voice' | 'WhatsApp' | 'Instagram' | 'Facebook';
  channelId?: string;
  initialChannel?: Channel;
}

const getDefaultConfig = () => ({
  phoneNumber: '',
  accountSid: '',
  authToken: '',
  apiKey: '',
  apiSecret: '',
  accessToken: '',
  pageId: '',
  appId: '',
  appSecret: '',
  webhookUrl: '',
  isActive: true,
  autoReply: false,
  autoReplyMessage: '',
  businessHours: {
    enabled: false,
    start: '09:00',
    end: '17:00',
  },
});

export function ChannelConfigDialog({
  open,
  onOpenChange,
  channelType,
  channelId,
  initialChannel,
}: ChannelConfigDialogProps) {
  const [config, setConfig] = useState(getDefaultConfig());
  const queryClient = useQueryClient();

  // Fetch channel data when dialog opens (if channelId is provided)
  const { data: channelData, isLoading } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: () => channelId ? channelsService.getChannelById(channelId) : null,
    enabled: open && !!channelId,
  });

  // Update config when channel data is loaded
  useEffect(() => {
    const channel = channelData || initialChannel;
    if (channel) {
      // Parse configuration JSON string if it exists
      let channelConfig: Record<string, unknown> = {};
      if (channel.configuration) {
        try {
          channelConfig = typeof channel.configuration === 'string'
            ? JSON.parse(channel.configuration)
            : channel.configuration;
        } catch {
          console.warn('Failed to parse channel configuration:', channel.configuration);
        }
      }

      // Parse metadata JSON string if it exists
      let metadata: Record<string, unknown> = {};
      if (channel.metadata) {
        try {
          metadata = typeof channel.metadata === 'string'
            ? JSON.parse(channel.metadata)
            : channel.metadata;
        } catch {
          console.warn('Failed to parse channel metadata:', channel.metadata);
        }
      }

      setConfig({
        phoneNumber: channel.phoneNumber || (channelConfig.phoneNumber as string) || '',
        accountSid: (channelConfig.accountSid as string) || channel.externalAccountId || '',
        authToken: '', // Don't show auth tokens for security
        apiKey: (channelConfig.apiKey as string) || '',
        apiSecret: '', // Don't show secrets for security
        accessToken: '', // Don't show tokens for security (but show masked indicator)
        pageId: channel.externalId || (channelConfig.pageId as string) || (channelConfig.facebookPageId as string) || '',
        appId: (channelConfig.appId as string) || (metadata.appId as string) || '',
        appSecret: '', // Don't show secrets for security
        webhookUrl: channel.webhookUrl || (channelConfig.webhookUrl as string) || '',
        isActive: channel.isActive,
        autoReply: (channelConfig.autoReply as boolean) || false,
        autoReplyMessage: (channelConfig.autoReplyMessage as string) || '',
        businessHours: (channelConfig.businessHours as typeof config.businessHours) || {
          enabled: false,
          start: '09:00',
          end: '17:00',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelData, initialChannel]);

  // Reset config when dialog closes
  useEffect(() => {
    if (!open) {
      setConfig(getDefaultConfig());
    }
  }, [open]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: typeof config) => {
      if (channelId) {
        return channelsService.updateChannel(channelId, data);
      }
      return channelsService.createChannel({
        name: `${channelType} Channel`,
        type: channelType,
        configuration: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel configured successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to configure channel');
    },
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const getChannelIcon = () => {
    switch (channelType) {
      case 'SMS':
      case 'WhatsApp':
        return <MessageSquare className="size-5" />;
      case 'Voice':
        return <Phone className="size-5" />;
      case 'Instagram':
        return <Instagram className="size-5" />;
      case 'Facebook':
        return <Facebook className="size-5" />;
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            {getChannelIcon()}
            <ModalTitle>Configure {channelType} Channel</ModalTitle>
          </div>
        </ModalHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <>
        <ModalBody>
        <Tabs defaultValue="connection" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-4">
            {(channelType === 'SMS' || channelType === 'Voice' || channelType === 'WhatsApp') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={config.phoneNumber}
                    onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountSid">Twilio Account SID</Label>
                  <Input
                    id="accountSid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={config.accountSid}
                    onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authToken">Twilio Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={config.authToken}
                    onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                  />
                </div>
              </>
            )}

            {channelType === 'Instagram' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Instagram Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appId">Instagram App ID</Label>
                  <Input
                    id="appId"
                    placeholder="1234567890"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appSecret">Instagram App Secret</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={config.appSecret}
                    onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                  />
                </div>
              </>
            )}

            {channelType === 'Facebook' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pageId">Facebook Page ID</Label>
                  <Input
                    id="pageId"
                    placeholder="1234567890"
                    value={config.pageId}
                    onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Page Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (Read-only)</Label>
              <Input
                id="webhookUrl"
                value={`https://api.qualiflow.ai/webhooks/${channelType.toLowerCase()}`}
                readOnly
                className="bg-muted/20"
              />
              <p className="text-xs text-text-secondary">
                Use this URL in your {channelType} webhook configuration
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Channel Active</Label>
                <p className="text-sm text-text-secondary">
                  Enable or disable this channel
                </p>
              </div>
              <Switch
                checked={config.isActive}
                onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Business Hours</Label>
                <p className="text-sm text-text-secondary">
                  Only respond during business hours
                </p>
              </div>
              <Switch
                checked={config.businessHours.enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    businessHours: { ...config.businessHours, enabled: checked },
                  })
                }
              />
            </div>

            {config.businessHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={config.businessHours.start}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        businessHours: { ...config.businessHours, start: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={config.businessHours.end}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        businessHours: { ...config.businessHours, end: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Reply</Label>
                <p className="text-sm text-text-secondary">
                  Automatically respond to new messages
                </p>
              </div>
              <Switch
                checked={config.autoReply}
                onCheckedChange={(checked) => setConfig({ ...config, autoReply: checked })}
              />
            </div>

            {config.autoReply && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label htmlFor="autoReplyMessage">Auto-Reply Message</Label>
                <Textarea
                  id="autoReplyMessage"
                  placeholder="Thanks for reaching out! We'll get back to you shortly."
                  value={config.autoReplyMessage}
                  onChange={(e) => setConfig({ ...config, autoReplyMessage: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Pro Tip:</strong> Enable AI-powered responses in your workflow settings for
                intelligent, context-aware replies.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveConfigMutation.isPending}>
            <Save className="size-4 mr-2" />
            {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </ModalFooter>
        </>
        )}
      </ModalContent>
    </Modal>
  );
}
