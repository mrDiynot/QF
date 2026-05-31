'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Facebook,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Unlink,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { channelsService, type MetaPage } from '@/services/api/channels.service';
import { useChannels } from '@/hooks/api/useChannels';

// Channel name for cross-tab communication (must match callback page)
const META_OAUTH_CHANNEL = 'meta-oauth-result';

export default function SocialChannelsPage() {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch channels and derive Meta connection status from them
  // This uses the same data source as the Channel Wizard for consistency
  const { data: channels, isLoading, refetch } = useChannels();

  // Derive Meta connection status from channels
  const connectionStatus = useMemo(() => {
    if (!channels) {
      return { isConnected: false, connectedPages: [] as MetaPage[] };
    }

    // Find Facebook and Instagram channels
    const metaChannels = channels.filter(c => {
      const type = c.type as string;
      return type === 'Facebook' || type === 'Instagram' ||
             type === 'facebook' || type === 'instagram';
    });

    const connectedPages: MetaPage[] = metaChannels.map(c => ({
      id: c.id,
      name: c.name,
      category: (c.type as string) === 'Instagram' || (c.type as string) === 'instagram'
        ? 'Instagram'
        : 'Facebook Page',
      isConnected: c.isActive,
      channelId: c.id,
      instagramBusinessAccountId: (c.type as string) === 'Instagram' || (c.type as string) === 'instagram'
        ? c.id
        : undefined,
      instagramUsername: (c.type as string) === 'Instagram' || (c.type as string) === 'instagram'
        ? c.name.replace(' (Instagram)', '')
        : undefined,
    }));

    const isConnected = connectedPages.some(p => p.isConnected);

    return { isConnected, connectedPages };
  }, [channels]);

  // Listen for OAuth completion from the callback tab
  useEffect(() => {
    // Handler for BroadcastChannel messages
    const handleOAuthResult = (event: MessageEvent) => {
      if (event.data?.success) {
        toast.success('Facebook account connected successfully!');
        refetch();
        queryClient.invalidateQueries({ queryKey: ['channels'] });
      } else if (event.data?.error) {
        toast.error(`Connection failed: ${event.data.error}`);
      }
    };

    // Handler for localStorage changes (fallback)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === META_OAUTH_CHANNEL && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.success) {
            toast.success('Facebook account connected successfully!');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['channels'] });
          } else if (data.error) {
            toast.error(`Connection failed: ${data.error}`);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    // Set up BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(META_OAUTH_CHANNEL);
      channel.addEventListener('message', handleOAuthResult);
    }

    // Set up localStorage listener (fallback)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleOAuthResult);
        channel.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refetch, queryClient]);

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: (channelId: string) => channelsService.disconnectMetaChannel(channelId),
    onSuccess: () => {
      toast.success('Channel disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['meta-connection-status'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: () => {
      toast.error('Failed to disconnect channel');
    },
  });

  // Handle connect button click
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { authorizationUrl } = await channelsService.getMetaAuthUrl();
      // Open Meta OAuth in a new browser tab
      window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
      setIsConnecting(false);
    } catch {
      toast.error('Failed to start connection. Please try again.');
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = (page: MetaPage) => {
    if (page.channelId) {
      disconnectMutation.mutate(page.channelId);
    }
  };

  const isConnected = connectionStatus?.isConnected ?? false;
  const connectedPages = connectionStatus?.connectedPages ?? [];

  return (
    <div className="animate-fade-in pt-4 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
            <Share2 className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-navy">Social Media Channels</h1>
            <p className="text-sm text-text-secondary mt-1">
              Instagram & Facebook Messenger integration
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className={isConnected
        ? "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
        : "border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
      }>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                  <Instagram className="size-5 text-white" />
                </div>
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Facebook className="size-5 text-white" />
                </div>
              </div>
              <div>
                <CardTitle>Meta Connection</CardTitle>
                <p className="text-sm text-text-secondary">
                  {isConnected ? 'Your Facebook and Instagram accounts are connected' : 'Connect your Facebook Page to get started'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {isConnected ? (
                <Badge className="bg-green-100 text-green-700 border-0">
                  <CheckCircle2 className="size-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  <AlertTriangle className="size-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-purple-600" />
            </div>
          ) : isConnected && connectedPages.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-text-navy">Connected Pages</h3>
              <div className="grid gap-3">
                {connectedPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Facebook className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-text-navy">{page.name}</p>
                        <p className="text-sm text-text-secondary">
                          {page.instagramUsername ? `@${page.instagramUsername}` : page.category || 'Facebook Page'}
                        </p>
                      </div>
                      {page.instagramBusinessAccountId && (
                        <Badge variant="outline" className="ml-2">
                          <Instagram className="size-3 mr-1" />
                          Instagram Connected
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(page)}
                      disabled={disconnectMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Unlink className="size-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-8">
              <p className="text-text-secondary mb-6 max-w-md">
                Connect your Facebook Page to receive and respond to Instagram DMs and
                Facebook Messenger messages directly from QualiFlow AI.
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isConnecting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="size-4 mr-2" />
                )}
                Connect with Facebook
              </Button>
              <p className="text-xs text-text-secondary mt-3">
                You&apos;ll be redirected to Facebook to authorize QualiFlow AI
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Instagram className="size-5 text-pink-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Instagram DMs</p>
                <p className="text-xs text-text-secondary">Receive and respond to Direct Messages</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Facebook className="size-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Messenger</p>
                <p className="text-xs text-text-secondary">Handle Facebook Page messages</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Share2 className="size-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Responses</p>
                <p className="text-xs text-text-secondary">Automatic AI-powered replies</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle2 className="size-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Lead Capture</p>
                <p className="text-xs text-text-secondary">Auto-create leads from conversations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
