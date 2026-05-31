'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ConfirmModal,
} from '@/components/modals';
import {
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  Unlink,
  Link2,
  CalendarCheck,
  Clock,
  Key,
  Video,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { calcomService, type CalComIntegrationDto, type CalComEventTypeDto } from '@/services/api/calcom.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CalendarIntegrationPage() {
  const [integration, setIntegration] = useState<CalComIntegrationDto | null>(null);
  const [eventTypes, setEventTypes] = useState<CalComEventTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    defaultEventTypeId: '',
  });

  useEffect(() => {
    loadIntegration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIntegration = async () => {
    try {
      setIsLoading(true);
      const data = await calcomService.getIntegration();
      setIntegration(data);
      
      if (data?.isConnected) {
        setSettings({
          defaultEventTypeId: data.defaultEventTypeId || '',
        });
        await loadEventTypes();
      }
    } catch (error) {
      console.error('Failed to load integration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const data = await calcomService.getEventTypes();
      setEventTypes(data);
    } catch (error) {
      console.error('Failed to load event types:', error);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Cal.com API key');
      return;
    }
    
    try {
      setIsConnecting(true);
      const response = await calcomService.connect(apiKey.trim());
      
      if (response.success && response.integration) {
        setIntegration(response.integration);
        if (response.eventTypes) {
          setEventTypes(response.eventTypes);
        }
        setShowApiKeyDialog(false);
        setApiKey('');
        toast.success('Cal.com connected successfully!');
      } else {
        toast.error(response.errorMessage || 'Failed to connect Cal.com');
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error('Failed to connect Cal.com. Please check your API key.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await calcomService.disconnect();
      setIntegration(null);
      setEventTypes([]);
      setShowDisconnectDialog(false);
      toast.success('Cal.com disconnected');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const updated = await calcomService.updateSettings({
        defaultEventTypeId: settings.defaultEventTypeId || undefined,
      });
      setIntegration(updated);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="heading-1 text-text-navy">Calendar & Booking</h1>
          <p className="body-text mt-2 text-text-secondary">
            Connect Cal.com to manage bookings with automatic Google Calendar sync
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex size-14 items-center justify-center rounded-xl ${
                integration?.isConnected ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <Calendar className={`size-7 ${integration?.isConnected ? 'text-green-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Cal.com</h3>
                  {integration?.isConnected && (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="mr-1 size-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                {integration?.isConnected ? (
                  <p className="mt-1 text-sm text-gray-500">
                    Connected as <span className="font-medium">{integration.email || integration.username}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Connect Cal.com for scheduling with built-in Google Calendar sync
                  </p>
                )}
              </div>
            </div>
            
            {integration?.isConnected ? (
              <Button 
                variant="outline" 
                onClick={() => setShowDisconnectDialog(true)}
                className="text-red-600 hover:bg-red-50"
              >
                <Unlink className="mr-2 size-4" />
                Disconnect
              </Button>
            ) : (
              <Button 
                onClick={() => setShowApiKeyDialog(true)}
                className="gradient-primary text-white"
              >
                <Link2 className="mr-2 size-4" />
                Connect Cal.com
              </Button>
            )}
          </div>

          {integration?.lastSyncAt && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 border-t pt-4">
              <CheckCircle2 className="size-4 text-green-500" />
              Last synced: {format(new Date(integration.lastSyncAt), 'MMM d, yyyy h:mm a')}
            </div>
          )}
        </Card>

        {/* Settings (only show when connected) */}
        {integration?.isConnected && (
          <>
            {/* Event Type Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Event Type</Label>
                  <Select 
                    value={settings.defaultEventTypeId} 
                    onValueChange={(v) => setSettings({ ...settings, defaultEventTypeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(et => (
                        <SelectItem key={et.id} value={et.id}>
                          <div className="flex items-center gap-2">
                            {et.title} ({et.length} min)
                            {et.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    This event type will be used when AI books appointments with leads
                  </p>
                </div>

                {eventTypes.length > 0 && (
                  <div className="space-y-3">
                    <Label>Your Event Types</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {eventTypes.map(et => (
                        <div key={et.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Clock className="size-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{et.title}</p>
                            <p className="text-xs text-gray-500">{et.length} minutes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="gradient-primary text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </Card>

            {/* Features Info */}
            <Card className="p-6 bg-purple-50 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Cal.com Features</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-200">
                    <CalendarCheck className="size-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Google Calendar Sync</p>
                    <p className="text-sm text-purple-700">
                      Automatically syncs with your Google Calendar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-200">
                    <Clock className="size-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Smart Availability</p>
                    <p className="text-sm text-purple-700">
                      Shows only available times based on your calendar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-200">
                    <Video className="size-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Video Conferencing</p>
                    <p className="text-sm text-purple-700">
                      Auto-generates Google Meet or Zoom links
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-200">
                    <Globe className="size-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Timezone Support</p>
                    <p className="text-sm text-purple-700">
                      Handles timezone differences automatically
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cal.com Dashboard Link */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100">
                    <ExternalLink className="size-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Event Types</h3>
                    <p className="text-sm text-gray-500">
                      Create and customize event types in Cal.com
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a href="https://app.cal.com/event-types" target="_blank" rel="noopener noreferrer">
                    Open Cal.com
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Not Connected Info */}
        {!integration?.isConnected && (
          <Card className="p-8 text-center">
            <Calendar className="mx-auto size-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Connect Cal.com
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Cal.com is an open-source scheduling platform that syncs with Google Calendar,
              handles availability, and provides booking links for your leads.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <Button 
                size="lg"
                onClick={() => setShowApiKeyDialog(true)}
                className="gradient-primary text-white"
              >
                <Key className="mr-2 size-5" />
                Connect with API Key
              </Button>
              <p className="text-xs text-gray-400">
                Get your API key from{' '}
                <a 
                  href="https://app.cal.com/settings/developer/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Cal.com Settings → API Keys
                </a>
              </p>
            </div>

            {/* Why Cal.com */}
            <div className="mt-8 pt-8 border-t text-left">
              <h4 className="font-semibold text-gray-900 mb-4">Why Cal.com?</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Google Calendar Sync</p>
                    <p className="text-xs text-gray-500">Built-in two-way calendar sync</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Video Conferencing</p>
                    <p className="text-xs text-gray-500">Auto-generate Meet/Zoom links</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Custom Booking Pages</p>
                    <p className="text-xs text-gray-500">Branded scheduling experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Free Tier Available</p>
                    <p className="text-xs text-gray-500">Open-source with generous free plan</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* API Key Dialog */}
      <Modal open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Connect Cal.com</ModalTitle>
            <ModalDescription>
              Enter your Cal.com API key to connect your account. You can find this in{' '}
              <a
                href="https://app.cal.com/settings/developer/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Cal.com Settings → Developer → API Keys
              </a>
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="cal_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored securely and used only for booking operations.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => { setApiKey(''); setShowApiKeyDialog(false); }}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !apiKey.trim()}
              className="gradient-primary text-white"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmModal
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
        title="Disconnect Cal.com?"
        description="This will remove your Cal.com integration. Existing bookings will not be affected, but new AI-scheduled appointments will no longer sync."
        variant="danger"
        confirmLabel="Disconnect"
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnectDialog(false)}
      />
    </div>
  );
}
