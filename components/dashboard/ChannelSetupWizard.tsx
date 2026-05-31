'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Phone,
  MessageSquare,
  Mail,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Radio,
  PhoneCall,
  Instagram,
  Facebook,
  Loader2,
  AlertCircle,
  Lock,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { channelsService, type ActivateChannelRequest } from '@/services/api/channels.service';
import { toast } from 'sonner';
import { PhoneNumberProvisioningDialog } from '@/components/channels/PhoneNumberProvisioningDialog';

interface ChannelSetupWizardProps {
  open: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

// Map icon names from backend to Lucide icons
// Aligned with product documentation - 7 core channels (no QR Code as separate channel)
const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  PhoneCall,
};

// Get icon component from icon name
const getIcon = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || MessageSquare;
};

export function ChannelSetupWizard({ open, onComplete, onSkip }: ChannelSetupWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneProvisioning, setShowPhoneProvisioning] = useState(false);
  const [activatingChannels, setActivatingChannels] = useState(false);
  const [activatedCount, setActivatedCount] = useState(0);

  // Fetch pending channels from backend
  const { data: pendingChannels = [], isLoading: isLoadingChannels, error: channelsError } = useQuery({
    queryKey: ['channels', 'pending'],
    queryFn: channelsService.getPendingChannels,
    enabled: open,
  });

  // Filter to only show channels that are not yet activated and available on current plan
  const availableChannels = pendingChannels.filter(
    (channel) => !channel.isActivated && channel.isAvailableOnCurrentPlan
  );

  // Channels that require upgrade
  const lockedChannels = pendingChannels.filter(
    (channel) => !channel.isActivated && !channel.isAvailableOnCurrentPlan
  );

  // Check which selected channels require phone
  const needsPhone = selectedChannels.some(channelType => 
    pendingChannels.find(c => c.channelType === channelType)?.requiresPhoneNumber
  );

  const totalSteps = needsPhone ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  const activateMutation = useMutation({
    mutationFn: (data: ActivateChannelRequest) => channelsService.activateChannel(data),
    onSuccess: () => {
      setActivatedCount(prev => prev + 1);
    },
    onError: (error) => {
      console.error('Failed to activate channel:', error);
    },
  });

  const handleChannelToggle = (channelType: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelType)
        ? prev.filter(type => type !== channelType)
        : [...prev, channelType]
    );
  };

  const handlePhoneProvisioned = (phone: string) => {
    setPhoneNumber(phone);
    setShowPhoneProvisioning(false);
    toast.success(`Phone number ${phone} selected!`);
  };

  const handleNext = () => {
    if (step === 1 && selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    if (step === 2 && needsPhone && !phoneNumber) {
      toast.error('Please select a phone number for SMS/Voice channels');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleActivateChannels = async () => {
    setActivatingChannels(true);
    setActivatedCount(0);

    try {
      for (const channelType of selectedChannels) {
        const channel = pendingChannels.find(c => c.channelType === channelType);
        if (!channel) continue;

        const request: ActivateChannelRequest = {
          channelType: channel.channelType,
          displayName: channel.displayName,
          ...(channel.requiresPhoneNumber && phoneNumber ? {
            phoneNumberOption: 'existing' as const,
            existingPhoneNumber: phoneNumber,
          } : {}),
        };

        const response = await activateMutation.mutateAsync(request);

        // Handle OAuth-required channels (Social Messaging)
        if (response.requiresOAuth && response.oAuthUrl) {
          toast.info(`${channel.displayName} requires Meta connection. Opening authorization in new tab...`);
          // Open Meta OAuth flow in a new tab
          window.open(response.oAuthUrl, '_blank', 'noopener,noreferrer');
          return; // Stop processing - user will complete OAuth in new tab
        }
      }

      // Invalidate all relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['channels'] });
      await queryClient.invalidateQueries({ queryKey: ['channels', 'pending'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      // Invalidate AI readiness query to update percentage in real-time
      await queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });

      // Mark channel setup as complete in sessionStorage
      sessionStorage.setItem('channelSetupComplete', 'true');

      toast.success('All channels activated successfully!');
      onComplete();
    } catch {
      toast.error('Some channels failed to activate. Please try again.');
    } finally {
      setActivatingChannels(false);
    }
  };


  const handleSkip = () => {
    // Mark as skipped in sessionStorage so wizard doesn't reappear immediately
    sessionStorage.setItem('channelSetupDismissed', 'true');
    sessionStorage.setItem('channelSetupDismissedAt', new Date().toISOString());
    onSkip?.();
  };

  return (
    <>
      <Modal open={open} onOpenChange={(isOpen: boolean) => !isOpen && handleSkip()}>
        <ModalContent
          size="lg"
          className="w-[95vw] sm:w-[90vw] overflow-y-auto bg-white border-0 shadow-2xl p-0 rounded-3xl"
        >
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 rounded-t-3xl">
            <div className="relative text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Radio className="w-8 h-8 text-white" />
                </div>
              </div>
              <ModalTitle className="text-3xl font-bold text-white mb-2">
                Activate Your Channels
              </ModalTitle>
              <ModalDescription className="text-white/90 text-base">
                Activate the channels you selected during onboarding
              </ModalDescription>
              
              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-white/80 mb-3">
                  <span>Step {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2.5 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Loading State */}
            {isLoadingChannels && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading available channels...</p>
              </div>
            )}

            {/* Error State */}
            {channelsError && (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <p className="text-foreground font-medium mb-2">Failed to load channels</p>
                <p className="text-muted-foreground text-sm">Please try again later</p>
              </div>
            )}

            {/* Step 1: Select Channels */}
            {!isLoadingChannels && !channelsError && step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">
                      Which channels do you want to use?
                    </h3>
                  </div>
                  <p className="text-base text-muted-foreground">
                    Select the communication channels you&apos;d like to activate. You can always add more later.
                  </p>
                </div>

                {/* Available Channels */}
                {availableChannels.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableChannels.map((channel) => {
                      const isSelected = selectedChannels.includes(channel.channelType);
                      const Icon = getIcon(channel.iconName);

                      return (
                        <button
                          key={channel.channelType}
                          onClick={() => handleChannelToggle(channel.channelType)}
                          className={cn(
                            'relative p-5 rounded-2xl border-2 text-left transition-all duration-200',
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-purple-200'
                              : 'border-border bg-white hover:border-purple-300 hover:shadow-md'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'p-3 rounded-xl',
                              isSelected ? 'bg-primary' : 'bg-muted/40'
                            )}>
                              <Icon className={cn(
                                'w-6 h-6',
                                isSelected ? 'text-white' : 'text-muted-foreground'
                              )} />
                            </div>
                            <div className="flex-1">
                              <h4 className={cn(
                                'font-semibold text-base mb-1',
                                isSelected ? 'text-foreground' : 'text-foreground'
                              )}>
                                {channel.displayName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {channel.description}
                              </p>
                              {channel.requiresPhoneNumber && (
                                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-muted/50 text-info text-xs font-medium">
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  Requires phone number
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Locked Channels (require upgrade) */}
                {lockedChannels.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Upgrade to unlock
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lockedChannels.map((channel) => {
                        return (
                          <div
                            key={channel.channelType}
                            className="relative p-4 rounded-xl border-2 border-border bg-muted/20 opacity-60"
                          >
                            <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg z-10">
                              <Crown className="w-3 h-3 text-amber-300" />
                              <span className="text-[10px] font-bold text-white tracking-wide">
                                {channel.minimumPlan}
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-lg bg-muted">
                                <Lock className="w-5 h-5 text-muted-foreground/60" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-muted-foreground">
                                  {channel.displayName}
                                </h4>
                                <p className="text-xs text-muted-foreground/60 mt-0.5">
                                  {channel.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No channels available */}
                {availableChannels.length === 0 && lockedChannels.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium">All channels are already set up!</p>
                    <p className="text-muted-foreground text-sm mt-1">You can manage them in Settings → Channels</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Phone Number Setup (only if needed) */}
            {!isLoadingChannels && !channelsError && step === 2 && needsPhone && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Set Up Your Phone Number
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Your SMS and Voice channels will use this phone number to communicate with leads.
                </p>

                {phoneNumber ? (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">{phoneNumber}</p>
                          <p className="text-xs text-green-700">Phone number selected</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPhoneProvisioning(true)}
                        className="text-green-700 hover:bg-green-100"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowPhoneProvisioning(true)}
                    className="w-full py-8 border-2 border-dashed border-purple-300 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="w-8 h-8 text-primary" />
                      <span className="font-semibold text-primary">Search & Select Phone Number</span>
                      <span className="text-xs text-muted-foreground">Find a number in your area</span>
                    </div>
                  </Button>
                )}
              </div>
            )}

            {/* Final Step: Confirmation */}
            {!isLoadingChannels && !channelsError && ((step === 2 && !needsPhone) || (step === 3 && needsPhone)) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Ready to Activate!
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Review your selections and activate your channels.
                </p>

                <div className="space-y-3">
                  {selectedChannels.map(channelType => {
                    const channel = pendingChannels.find(c => c.channelType === channelType);
                    if (!channel) return null;
                    const ChannelIcon = getIcon(channel.iconName);

                    return (
                      <div
                        key={channelType}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ChannelIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{channel.displayName}</p>
                          {channel.requiresPhoneNumber && phoneNumber && (
                            <p className="text-xs text-muted-foreground">Using: {phoneNumber}</p>
                          )}
                        </div>
                        {activatingChannels && activatedCount > selectedChannels.indexOf(channelType) && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {activatingChannels && (
                  <div className="mt-4">
                    <Progress 
                      value={(activatedCount / selectedChannels.length) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Activating channels... {activatedCount} of {selectedChannels.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {!isLoadingChannels && !channelsError && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  {step > 1 ? (
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={activatingChannels}
                    >
                      Back
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={activatingChannels}
                      className="text-muted-foreground hover:text-foreground/80"
                    >
                      Skip for now
                    </Button>
                  )}
                </div>

                {((step === 2 && !needsPhone) || (step === 3 && needsPhone)) ? (
                  <Button
                    onClick={handleActivateChannels}
                    disabled={activatingChannels}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg"
                  >
                    {activatingChannels ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        Activate Channels
                        <Zap className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={step === 1 && selectedChannels.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* Phone Number Provisioning Dialog */}
      <PhoneNumberProvisioningDialog
        open={showPhoneProvisioning}
        onOpenChange={setShowPhoneProvisioning}
        onProvision={handlePhoneProvisioned}
        channelType="SMS"
      />
    </>
  );
}
