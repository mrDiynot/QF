'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Phone, Mail, Instagram, Facebook, PhoneCall } from 'lucide-react';
import { channelsService, type ActivateChannelRequest } from '@/services/api/channels.service';
import { toast } from 'sonner';
import { PhoneNumberProvisioningDialog } from './PhoneNumberProvisioningDialog';

// Non-Twilio channels that can be activated individually
// Type values must match backend ChannelType enum (PascalCase)
const STANDALONE_CHANNELS = [
  { type: 'ChatWidget', name: 'Chat Widget', icon: MessageSquare, description: 'Embed on your website' },
  { type: 'WebForm', name: 'Web Forms', icon: Mail, description: 'Capture leads via forms (includes QR code feature)' },
  { type: 'Instagram', name: 'Instagram', icon: Instagram, description: 'Instagram DMs via Meta API' },
  { type: 'Facebook', name: 'Facebook', icon: Facebook, description: 'Messenger via Meta API' },
];

// Twilio channels that share a phone number
// Type values must match backend ChannelType enum (PascalCase)
const TWILIO_CHANNELS = [
  { type: 'SMS', name: 'SMS Messaging', description: 'Send and receive text messages' },
  { type: 'Voice', name: 'Voice Calls', description: 'AI-powered phone calls' },
  { type: 'WhatsApp', name: 'WhatsApp', description: 'WhatsApp Business messaging' },
];

interface ChannelSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelType?: string | null;
  onComplete: () => void;
}

export function ChannelSetupDialog({ open, onOpenChange, channelType, onComplete }: ChannelSetupDialogProps) {
  const queryClient = useQueryClient();

  // If channelType is pre-set, skip to step 2 (configuration)
  const isPreselected = !!channelType;
  const [selectedType, setSelectedType] = useState(channelType || '');
  const [displayName, setDisplayName] = useState('');
  const [existingPhone, setExistingPhone] = useState('');
  const [provisionedPhone, setProvisionedPhone] = useState('');
  const [step, setStep] = useState(isPreselected ? 2 : 1);
  const [showPhoneProvisioning, setShowPhoneProvisioning] = useState(false);
  // Twilio channel selections (for grouped Twilio option)
  const [twilioChannels, setTwilioChannels] = useState<string[]>([]);

  const isTwilioSelected = selectedType === 'twilio';
  const isStandaloneChannel = STANDALONE_CHANNELS.find(c => c.type === selectedType);
  const requiresPhone = isTwilioSelected;

  const activateMutation = useMutation({
    mutationFn: (data: ActivateChannelRequest) => channelsService.activateChannel(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Channel activated successfully!');
        // Invalidate AI readiness query to update percentage in real-time
        queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });
        queryClient.invalidateQueries({ queryKey: ['channels'] });
        onComplete();
        resetForm();
      } else {
        toast.error(response.errorMessage || 'Failed to activate channel');
      }
    },
    onError: () => {
      toast.error('Failed to activate channel');
    },
  });

  const resetForm = () => {
    setSelectedType(channelType || '');
    setDisplayName('');
    setExistingPhone('');
    setProvisionedPhone('');
    setTwilioChannels([]);
    setStep(isPreselected ? 2 : 1);
  };

  const handlePhoneProvisioned = (phoneNumber: string) => {
    setProvisionedPhone(phoneNumber);
    setExistingPhone(''); // Clear manual entry when a number is provisioned
    toast.success(`Phone number ${phoneNumber} selected!`);
  };

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      toast.error('Please select a channel type');
      return;
    }
    if (step === 1 && isTwilioSelected && twilioChannels.length === 0) {
      toast.error('Please select at least one Twilio channel');
      return;
    }
    setStep(2);
  };

  const toggleTwilioChannel = (type: string) => {
    setTwilioChannels(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (isTwilioSelected) {
      // For Twilio, we need to activate each selected channel with the same phone number
      // Get the phone number - either from provisioning search or manual entry
      const phoneNumber = provisionedPhone || existingPhone;

      for (const channelType of twilioChannels) {
        const request: ActivateChannelRequest = {
          channelType,
          displayName: displayName || undefined,
          phoneNumberOption: 'existing', // Always use 'existing' since we have a selected number
          existingPhoneNumber: phoneNumber,
        };
        const response = await activateMutation.mutateAsync(request);

        // Handle OAuth-required channels (Social Messaging)
        if (response.requiresOAuth && response.oAuthUrl) {
          window.location.href = response.oAuthUrl;
          return;
        }
      }
    } else {
      // For standalone channels
      const request: ActivateChannelRequest = {
        channelType: selectedType,
        displayName: displayName || undefined,
      };
      const response = await activateMutation.mutateAsync(request);

      // Handle OAuth-required channels (Social Messaging)
      if (response.requiresOAuth && response.oAuthUrl) {
        window.location.href = response.oAuthUrl;
        return;
      }
    }
  };

  const canActivate = isTwilioSelected
    ? twilioChannels.length > 0 && (provisionedPhone || existingPhone)
    : !!selectedType;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle className="text-2xl font-bold text-text-navy">
            {isPreselected && isStandaloneChannel
              ? `Create ${isStandaloneChannel.name}`
              : 'Add Communication Channel'}
          </ModalTitle>
          <ModalDescription className="text-base text-text-secondary">
            {step === 1 ? 'Select a channel type to get started' : 'Configure your channel settings'}
          </ModalDescription>
        </ModalHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Twilio Channels - Grouped */}
            <div>
              <button
                onClick={() => setSelectedType('twilio')}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedType === 'twilio'
                    ? 'border-brand-purple bg-primary/5 shadow-md'
                    : 'border-border bg-white hover:border-brand-purple/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${selectedType === 'twilio' ? 'bg-brand-purple' : 'bg-primary/10'}`}>
                    <PhoneCall className={`size-6 ${selectedType === 'twilio' ? 'text-white' : 'text-brand-purple'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-navy text-lg">Twilio Channels</h3>
                    <p className="text-sm text-text-secondary mt-1">SMS, Voice calls, and WhatsApp - all from one phone number</p>
                  </div>
                </div>
              </button>

              {/* Twilio sub-options when selected */}
              {selectedType === 'twilio' && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/20 space-y-3">
                  <p className="text-sm font-medium text-text-navy">Select channels to enable:</p>
                  {TWILIO_CHANNELS.map((channel) => (
                    <label
                      key={channel.type}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={twilioChannels.includes(channel.type)}
                        onCheckedChange={() => toggleTwilioChannel(channel.type)}
                      />
                      <div>
                        <span className="font-medium text-text-navy">{channel.name}</span>
                        <p className="text-xs text-text-secondary">{channel.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Standalone Channels */}
            <div className="grid gap-3 md:grid-cols-2">
              {STANDALONE_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.type}
                    onClick={() => setSelectedType(channel.type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      selectedType === channel.type
                        ? 'border-brand-purple bg-primary/5 shadow-md'
                        : 'border-border bg-white hover:border-brand-purple/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${selectedType === channel.type ? 'bg-brand-purple' : 'bg-muted/40'}`}>
                        <Icon className={`size-5 ${selectedType === channel.type ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-navy">{channel.name}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">{channel.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedType || (isTwilioSelected && twilioChannels.length === 0)}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Channel Name (Optional)</Label>
              <Input
                id="displayName"
                placeholder={isTwilioSelected ? 'My Twilio Channels' : `My ${isStandaloneChannel?.name} Channel`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {requiresPhone && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border">
                <div>
                  <Label className="text-base font-semibold text-text-navy">Phone Number</Label>
                  <p className="text-sm text-text-secondary mt-1">
                    This number will be used for: {twilioChannels.map(t => TWILIO_CHANNELS.find(c => c.type === t)?.name).join(', ')}
                  </p>
                </div>

                {/* Show selected phone number if provisioned */}
                {provisionedPhone ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="size-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-green-900">{provisionedPhone}</span>
                        <p className="text-xs text-green-700">Ready to activate</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPhoneProvisioning(true)}
                      className="hover:bg-green-100"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPhoneProvisioning(true)}
                      className="w-full border-dashed border-2 border-border hover:border-brand-purple hover:bg-primary/5 transition-all py-6"
                    >
                      <Phone className="size-4 mr-2" />
                      Search & Select Phone Number
                    </Button>
                    <div className="text-center text-xs text-text-secondary">or enter manually</div>
                    <Input
                      placeholder="+1234567890"
                      value={existingPhone}
                      onChange={(e) => setExistingPhone(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={activateMutation.isPending || !canActivate}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activateMutation.isPending ? 'Activating...' : 'Activate Channel'}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>

      {/* Phone Number Provisioning Dialog */}
      <PhoneNumberProvisioningDialog
        open={showPhoneProvisioning}
        onOpenChange={setShowPhoneProvisioning}
        onProvision={handlePhoneProvisioned}
        channelType={selectedType as 'SMS' | 'Voice' | 'WhatsApp'}
      />
    </Modal>
  );
}

