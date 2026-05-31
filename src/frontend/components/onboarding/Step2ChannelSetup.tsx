'use client';

/**
 * Step 2: Channel Setup
 */

import { useState } from 'react';
import { Loader2, MessageSquare, Phone, MessageCircle, Instagram, Facebook, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalBody, ModalTitle, ModalFooter } from '@/components/modals';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChannelSetup } from '@/hooks/onboarding/useOnboarding';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { ChannelType } from '@/types/onboarding';
import { toast } from 'sonner';

const ICONS = {
  sms: MessageSquare,
  voice: Phone,
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  chat_widget: MessageSquareText,
};

const CHANNELS = [
  { type: 'chat_widget' as ChannelType, name: 'Chat Widget', description: 'Embed on your website', requiresSetup: false },
  { type: 'sms' as ChannelType, name: 'SMS', description: 'Text messaging via Twilio', requiresSetup: true },
  { type: 'whatsapp' as ChannelType, name: 'WhatsApp', description: 'WhatsApp Business', requiresSetup: true },
  { type: 'voice' as ChannelType, name: 'Voice', description: 'Phone calls via Twilio', requiresSetup: true },
  { type: 'instagram' as ChannelType, name: 'Instagram', description: 'Instagram DMs via Meta API', requiresSetup: true },
  { type: 'facebook' as ChannelType, name: 'Facebook', description: 'Messenger via Meta API', requiresSetup: true },
];

export function Step2ChannelSetup() {
  const { setChannelSetup, setCurrentStep } = useOnboardingStore();
  const { mutate: saveChannels, isPending } = useChannelSetup();
  const [selectedChannels, setSelectedChannels] = useState<Set<ChannelType>>(new Set(['chat_widget']));
  const [showTwilioDialog, setShowTwilioDialog] = useState(false);
  const [twilioCredentials, setTwilioCredentials] = useState({ accountSid: '', authToken: '' });

  const handleChannelToggle = (channelType: ChannelType, requiresSetup: boolean) => {
    const newSelected = new Set(selectedChannels);
    if (newSelected.has(channelType)) {
      newSelected.delete(channelType);
    } else {
      if (requiresSetup && (channelType === 'sms' || channelType === 'voice' || channelType === 'whatsapp')) {
        setShowTwilioDialog(true);
      }
      newSelected.add(channelType);
    }
    setSelectedChannels(newSelected);
  };

  const handleContinue = () => {
    if (selectedChannels.size === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    const data = {
      channels: Array.from(selectedChannels).map(type => ({
        type,
        enabled: true,
        credentials: (type === 'sms' || type === 'voice' || type === 'whatsapp') && twilioCredentials.accountSid
          ? { twilioAccountSid: twilioCredentials.accountSid, twilioAuthToken: twilioCredentials.authToken }
          : undefined,
      })),
    };

    saveChannels(data, {
      onSuccess: () => {
        // Map form data to store data format
        setChannelSetup({
          selectedChannels: data.channels.filter(c => c.enabled).map(c => c.type),
          selectedAutomations: [],
        });
        setCurrentStep(3);
      },
    });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHANNELS.map((channel) => {
          const Icon = ICONS[channel.type];
          const isSelected = selectedChannels.has(channel.type);
          
          return (
            <Card
              key={channel.type}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleChannelToggle(channel.type, channel.requiresSetup)}
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <Checkbox checked={isSelected} />
                <Icon className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <CardTitle className="text-base">{channel.name}</CardTitle>
                  <CardDescription className="text-sm">{channel.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Modal open={showTwilioDialog} onOpenChange={setShowTwilioDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Twilio Configuration</ModalTitle>
            <ModalDescription>
              Enter your Twilio credentials to enable SMS, Voice, and WhatsApp channels
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={twilioCredentials.accountSid}
                onChange={(e) => setTwilioCredentials(prev => ({ ...prev, accountSid: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="authToken">Auth Token</Label>
              <Input
                id="authToken"
                type="password"
                placeholder="Your Twilio Auth Token"
                value={twilioCredentials.authToken}
                onChange={(e) => setTwilioCredentials(prev => ({ ...prev, authToken: e.target.value }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setShowTwilioDialog(false)} className="w-full">
              Save Credentials
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}