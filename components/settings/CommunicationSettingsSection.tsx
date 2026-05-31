'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Clock, Save, Loader2 } from 'lucide-react';
import { communicationSettingsService } from '@/services/api/communication-settings.service';
import type { EmailSettings, SmsSettings, VoiceSettings } from '@/services/api/communication-settings.service';
import { toast } from 'sonner';

export function CommunicationSettingsSection() {
  const queryClient = useQueryClient();

  // Fetch communication settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['communication-settings'],
    queryFn: communicationSettingsService.get,
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    senderName: '',
    replyToEmail: '',
    signature: '',
  });

  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
    defaultSender: '',
    optOutMessage: 'Reply STOP to unsubscribe',
    enableAutoReply: true,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    businessHours: '9:00 AM - 5:00 PM',
    voicemailEnabled: true,
    callForwardingNumber: '',
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.email) {
        setEmailSettings(settings.email);
      }
      if (settings.sms) {
        setSmsSettings(settings.sms);
      }
      if (settings.voice) {
        setVoiceSettings(settings.voice);
      }
    }
  }, [settings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: communicationSettingsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-settings'] });
      toast.success('Communication settings updated successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Failed to update settings');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      email: emailSettings,
      sms: smsSettings,
      voice: voiceSettings,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-brand-purple" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how emails are sent from your Qualiflow AI account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Name</Label>
            <Input
              id="senderName"
              placeholder="Your Company Name"
              value={emailSettings.senderName}
              onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replyToEmail">Reply-To Email</Label>
            <Input
              id="replyToEmail"
              type="email"
              placeholder="support@yourcompany.com"
              value={emailSettings.replyToEmail}
              onChange={(e) => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              placeholder="Best regards,&#10;Your Team"
              rows={4}
              value={emailSettings.signature}
              onChange={(e) => setEmailSettings({ ...emailSettings, signature: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-brand-purple" />
            <CardTitle>SMS Settings</CardTitle>
          </div>
          <CardDescription>
            Configure SMS messaging preferences and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSender">Default Sender ID</Label>
            <Input
              id="defaultSender"
              placeholder="+1234567890"
              value={smsSettings.defaultSender}
              onChange={(e) => setSmsSettings({ ...smsSettings, defaultSender: e.target.value })}
            />
            <p className="text-xs text-text-secondary">
              The phone number that will appear as the sender for SMS messages
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="optOutMessage">Opt-Out Message</Label>
            <Input
              id="optOutMessage"
              placeholder="Reply STOP to unsubscribe"
              value={smsSettings.optOutMessage}
              onChange={(e) => setSmsSettings({ ...smsSettings, optOutMessage: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Reply</Label>
              <p className="text-sm text-text-secondary">
                Automatically send confirmation when receiving SMS
              </p>
            </div>
            <Switch
              checked={smsSettings.enableAutoReply}
              onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, enableAutoReply: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="size-5 text-brand-purple" />
            <CardTitle>Voice Call Settings</CardTitle>
          </div>
          <CardDescription>
            Configure phone call handling and voicemail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessHours">
              <Clock className="size-4 inline mr-1" />
              Business Hours
            </Label>
            <Input
              id="businessHours"
              placeholder="9:00 AM - 5:00 PM"
              value={voiceSettings.businessHours}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, businessHours: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Voicemail</Label>
              <p className="text-sm text-text-secondary">
                Enable voicemail for missed calls
              </p>
            </div>
            <Switch
              checked={voiceSettings.voicemailEnabled}
              onCheckedChange={(checked) => setVoiceSettings({ ...voiceSettings, voicemailEnabled: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callForwarding">Call Forwarding Number (Optional)</Label>
            <Input
              id="callForwarding"
              placeholder="+1234567890"
              value={voiceSettings.callForwardingNumber}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, callForwardingNumber: e.target.value })}
            />
            <p className="text-xs text-text-secondary">
              Forward calls to this number when unavailable
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Communication Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

