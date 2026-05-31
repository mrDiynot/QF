'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Target,
  Users,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Building2,
  ShoppingBag,
  Home,
  Briefcase
} from 'lucide-react';
import { channelsService, type ActivateChannelRequest } from '@/services/api/channels.service';
import { onboardingService, type OnboardingPreferences } from '@/services/api/onboarding.service';
import { toast } from 'sonner';
import { PhoneNumberProvisioningDialog } from './PhoneNumberProvisioningDialog';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';
import type { Channel } from '@/types/api';

// Business goals that drive channel selection
const BUSINESS_GOALS = [
  {
    id: 'lead-generation',
    title: 'Generate More Leads',
    description: 'Capture leads from multiple touchpoints',
    icon: Target,
    recommendedChannels: ['WebForm', 'ChatWidget', 'SMS'],
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  },
  {
    id: 'customer-support',
    title: 'Improve Customer Support',
    description: 'Provide instant help across channels',
    icon: Users,
    recommendedChannels: ['ChatWidget', 'WhatsApp', 'SMS', 'Voice'],
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  },
  {
    id: 'sales-conversion',
    title: 'Increase Sales Conversions',
    description: 'Follow up and close more deals',
    icon: TrendingUp,
    recommendedChannels: ['Voice', 'SMS', 'WhatsApp'],
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  },
  {
    id: 'engagement',
    title: 'Boost Engagement',
    description: 'Stay connected with your audience',
    icon: Zap,
    recommendedChannels: ['WhatsApp', 'Instagram', 'Facebook', 'SMS'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

// Industry-specific recommendations
const INDUSTRIES = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: Home,
    topChannels: ['SMS', 'Voice', 'WhatsApp', 'WebForm'],
    description: 'Quick responses to property inquiries',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingBag,
    topChannels: ['ChatWidget', 'WhatsApp', 'SMS', 'Instagram'],
    description: 'Instant customer support and order updates',
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: Briefcase,
    topChannels: ['Voice', 'SMS', 'WebForm', 'ChatWidget'],
    description: 'Appointment booking and consultations',
  },
  {
    id: 'saas',
    name: 'SaaS',
    icon: Globe,
    topChannels: ['ChatWidget', 'WebForm', 'SMS'],
    description: 'Product demos and support',
  },
  {
    id: 'other',
    name: 'Other',
    icon: Building2,
    topChannels: ['SMS', 'ChatWidget', 'WebForm', 'Voice'],
    description: 'General business communication',
  },
];

// Enhanced channel definitions with business context
const CHANNEL_CATALOG: ChannelDefinition[] = [
  {
    type: 'SMS',
    name: 'SMS Messaging',
    icon: MessageSquare,
    color: 'text-info',
    bgColor: 'bg-muted/30',
    category: 'Twilio',
    description: 'Text messaging for instant communication',
    benefits: ['98% open rate', 'Instant delivery', 'High engagement'],
    useCases: ['Appointment reminders', 'Lead follow-ups', 'Quick updates'],
    setupTime: '5 minutes',
    requiresPhone: true,
    popularity: 95,
  },
  {
    type: 'Voice',
    name: 'AI Voice Calls',
    icon: Phone,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Twilio',
    description: 'Automated and live phone calls',
    benefits: ['Personal touch', 'Complex conversations', 'High conversion'],
    useCases: ['Sales calls', 'Appointment booking', 'Customer support'],
    setupTime: '5 minutes',
    requiresPhone: true,
    popularity: 85,
  },
  {
    type: 'WhatsApp',
    name: 'WhatsApp Business',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'Twilio',
    description: 'Rich messaging with 2B+ users',
    benefits: ['Global reach', 'Rich media', 'High engagement'],
    useCases: ['International customers', 'Order updates', 'Support'],
    setupTime: '10 minutes',
    requiresPhone: true,
    popularity: 90,
  },
  {
    type: 'ChatWidget',
    name: 'Website Chat',
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    category: 'Standalone',
    description: 'Live chat on your website',
    benefits: ['Instant engagement', 'Capture visitors', 'AI-powered'],
    useCases: ['Website visitors', 'Product questions', 'Lead capture'],
    setupTime: '2 minutes',
    requiresPhone: false,
    popularity: 88,
  },
  {
    type: 'WebForm',
    name: 'Web Forms',
    icon: Mail,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'Standalone',
    description: 'Customizable lead capture forms',
    benefits: ['Easy setup', 'Customizable', 'Embed anywhere'],
    useCases: ['Contact forms', 'Lead magnets', 'Surveys'],
    setupTime: '3 minutes',
    requiresPhone: false,
    popularity: 80,
  },
  {
    type: 'Email',
    name: 'Email',
    icon: Mail,
    color: 'text-primary',
    bgColor: 'bg-muted/30',
    category: 'Standalone',
    description: 'Email communication channel',
    benefits: ['Professional', 'Detailed messages', 'Attachments'],
    useCases: ['Newsletters', 'Proposals', 'Detailed communication'],
    setupTime: '5 minutes',
    requiresPhone: false,
    popularity: 85,
  },
  {
    type: 'SocialMessaging',
    name: 'Social Messaging',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    category: 'Social',
    description: 'Instagram & Facebook Messenger via Meta API',
    benefits: ['Social engagement', 'Visual content', 'Brand building'],
    useCases: ['Social selling', 'DM inquiries', 'Community engagement'],
    setupTime: '15 minutes',
    requiresPhone: false,
    requiresOAuth: true,
    comingSoon: false,
    popularity: 80,
  },
];

// Channel interface type definition
interface ChannelDefinition {
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  category: string;
  description: string;
  benefits: string[];
  useCases: string[];
  setupTime: string;
  requiresPhone: boolean;
  requiresOAuth?: boolean;
  comingSoon?: boolean;
  popularity: number;
}

interface ImprovedChannelSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  /** Pre-selected channel type from the channels page (when user clicks "Complete Setup") */
  preSelectedChannel?: string | null;
}

export function ImprovedChannelSetupWizard({ open, onOpenChange, onComplete, preSelectedChannel }: ImprovedChannelSetupWizardProps) {
  const queryClient = useQueryClient();

  // Fetch business onboarding data
  const { data: onboardingData } = useQuery<OnboardingPreferences>({
    queryKey: ['onboarding', 'preferences'],
    queryFn: onboardingService.getPreferences,
    enabled: open,
  });

  // Subscription enforcement
  const { canAddChannel, checkLimit, subscription } = useSubscriptionEnforcement();

  // State management
  const [step, setStep] = useState(1);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumberOption, setPhoneNumberOption] = useState<'new' | 'existing'>('new');
  const [existingPhone, setExistingPhone] = useState('');
  const [provisionedPhone, setProvisionedPhone] = useState('');
  const [showPhoneProvisioning, setShowPhoneProvisioning] = useState(false);

  // Fetch existing channels to show current state
  const { data: existingChannels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsService.getChannels,
  });

  // Update state when onboarding data loads or pre-selected channel is provided
  useEffect(() => {
    if (open) {
      // Set goal and industry from onboarding
      if (onboardingData?.mainObjective) {
        setSelectedGoal(onboardingData.mainObjective);
      }
      if (onboardingData?.industry) {
        setSelectedIndustry(onboardingData.industry);
      }
      
      // Handle pre-selected channel from "Complete Setup" button
      if (preSelectedChannel) {
        const normalizedChannel = normalizeChannelType(preSelectedChannel);
        // Pre-select the channel
        setSelectedChannels(prev => {
          if (!prev.includes(normalizedChannel)) {
            return [normalizedChannel];
          }
          return prev;
        });
        // Skip directly to channel selection step (step 2)
        setStep(2);
      } else {
        // Skip to step 2 if we have onboarding data
        const hasData = onboardingData?.industry || onboardingData?.mainObjective;
        if (hasData && step === 1) {
          setStep(2);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- step is intentionally excluded to prevent infinite re-renders
  }, [onboardingData, open, preSelectedChannel]);

  // Determine if we have onboarding data
  const hasOnboardingData = onboardingData?.industry || onboardingData?.mainObjective;

  const activateMutation = useMutation({
    mutationFn: (data: ActivateChannelRequest) => channelsService.activateChannel(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Channel activated successfully!');
        // Invalidate AI readiness query to update percentage in real-time
        queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });
        // Invalidate channels query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['channels'] });
        onComplete();
        resetWizard();
      } else {
        toast.error(response.errorMessage || 'Failed to activate channel');
      }
    },
    onError: () => {
      toast.error('Failed to activate channel');
    },
  });

  const resetWizard = () => {
    setStep(1);
    setSelectedGoal('');
    setSelectedIndustry('');
    setSelectedChannels([]);
    setDisplayName('');
    setPhoneNumberOption('new');
    setExistingPhone('');
    setProvisionedPhone('');
  };

  const getRecommendedChannels = () => {
    if (selectedIndustry) {
      const industry = INDUSTRIES.find(i => i.id === selectedIndustry);
      return industry?.topChannels || [];
    }
    if (selectedGoal) {
      const goal = BUSINESS_GOALS.find(g => g.id === selectedGoal);
      return goal?.recommendedChannels || [];
    }
    return [];
  };

  // Map backend channel types to frontend CHANNEL_CATALOG types
  // Backend uses various formats: PascalCase, snake_case, and lowercase
  // IMPORTANT: Facebook and Instagram channels from backend should map to SocialMessaging
  // since CHANNEL_CATALOG only has a single SocialMessaging entry for Meta channels
  const normalizeChannelType = (type: string): string => {
    const typeMap: Record<string, string> = {
      // Backend PascalCase (from /api/v1/channels)
      'SMS': 'SMS',
      'Voice': 'Voice',
      'WhatsApp': 'WhatsApp',
      'ChatWidget': 'ChatWidget',
      'WebForm': 'WebForm',
      // Map Facebook and Instagram to SocialMessaging (Meta channels)
      'Instagram': 'SocialMessaging',
      'Facebook': 'SocialMessaging',
      'SocialMessaging': 'SocialMessaging',
      'None': 'Email', // Fix for Email channel bug
      'Email': 'Email',

      // Backend snake_case (from /api/v1/channels/pending - these are the canonical backend types)
      'sms': 'SMS',
      'voice': 'Voice',           // Backend sends 'voice', not 'phone'
      'whatsapp': 'WhatsApp',
      'chat_widget': 'ChatWidget', // Backend sends 'chat_widget', not 'web_chat'
      'web_forms': 'WebForm',
      'social': 'SocialMessaging',
      'instagram': 'SocialMessaging',
      'facebook': 'SocialMessaging',
      'email': 'Email',

      // Onboarding format aliases (from Step 6 channel selection)
      'phone': 'Voice',           // Onboarding uses 'phone'
      'web_chat': 'ChatWidget',   // Onboarding uses 'web_chat'
    };
    return typeMap[type] || type;
  };

  const recommendedChannelTypes = getRecommendedChannels();

  // Memoize existingChannelTypes to prevent useMemo dependency warnings
  const existingChannelTypes = useMemo(() => new Set(
    existingChannels.map((c: Channel) => normalizeChannelType(c.type as string))
  ), [existingChannels]);

  // Get channels selected during onboarding (normalized to frontend format)
  const onboardingSelectedChannels = useMemo(() => {
    if (!onboardingData?.selectedChannels) return new Set<string>();
    return new Set(
      onboardingData.selectedChannels.map((ch: string) => normalizeChannelType(ch))
    );
  }, [onboardingData?.selectedChannels]);

  // Categorize available channels
  const { onboardingChannels, additionalChannels, activeChannels } = useMemo(() => {
    const onboarding: typeof CHANNEL_CATALOG = [];
    const additional: typeof CHANNEL_CATALOG = [];
    const active: typeof CHANNEL_CATALOG = [];

    CHANNEL_CATALOG.filter(ch => !ch.comingSoon).forEach(channel => {
      if (existingChannelTypes.has(channel.type)) {
        active.push(channel);
      } else if (onboardingSelectedChannels.has(channel.type)) {
        onboarding.push(channel);
      } else {
        additional.push(channel);
      }
    });

    return { onboardingChannels: onboarding, additionalChannels: additional, activeChannels: active };
  }, [existingChannelTypes, onboardingSelectedChannels]);

  const handleChannelToggle = (channelType: string) => {
    // Check if adding channel is allowed
    const channelCheck = canAddChannel(channelType);
    
    if (!channelCheck.allowed && !selectedChannels.includes(channelType)) {
      setUpgradeReason(channelCheck.reason || 'Upgrade required to add this channel');
      setShowUpgradeDialog(true);
      return;
    }

    setSelectedChannels(prev =>
      prev.includes(channelType)
        ? prev.filter(t => t !== channelType)
        : [...prev, channelType]
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedGoal && !selectedIndustry) {
      toast.error('Please select a goal or industry');
      return;
    }
    if (step === 2 && selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    // Step 3: Validate phone number is selected if required
    if (step === 3 && requiresPhoneNumber) {
      if (phoneNumberOption === 'new' && !provisionedPhone) {
        toast.error('Please search and select a phone number');
        return;
      }
      if (phoneNumberOption === 'existing' && !existingPhone) {
        toast.error('Please enter your existing phone number');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePhoneProvisioned = (phoneNumber: string) => {
    setProvisionedPhone(phoneNumber);
    setShowPhoneProvisioning(false);
    toast.success(`Phone number ${phoneNumber} selected!`);
  };

  // Map frontend channel types to backend format
  // Backend expects: sms, voice, whatsapp, chat_widget, web_forms, social, email
  const mapToBackendChannelType = (frontendType: string): string => {
    const mapping: Record<string, string> = {
      // Frontend wizard types (PascalCase)
      'SMS': 'sms',
      'Voice': 'voice',
      'WhatsApp': 'whatsapp',
      'ChatWidget': 'chat_widget',
      'WebForm': 'web_forms',
      'Instagram': 'social',
      'Facebook': 'social',
      'SocialMessaging': 'social',
      'Email': 'email',
      // Onboarding types (snake_case) - need to map these too
      'sms': 'sms',
      'phone': 'voice',  // Onboarding uses 'phone' but backend expects 'voice'
      'voice': 'voice',
      'whatsapp': 'whatsapp',
      'web_chat': 'chat_widget',  // Onboarding uses 'web_chat' but backend expects 'chat_widget'
      'chat_widget': 'chat_widget',
      'web_forms': 'web_forms',
      'social': 'social',
      'email': 'email',
    };
    const mapped = mapping[frontendType];
    if (!mapped) {
      console.error('Unknown channel type:', frontendType);
      return frontendType.toLowerCase();
    }
    return mapped;
  };

  const handleActivate = async () => {
    try {
      let successCount = 0;
      const failedChannels: string[] = [];

      for (const channelType of selectedChannels) {
        const channel = CHANNEL_CATALOG.find(c => c.type === channelType);
        if (!channel) continue;

        const mappedChannelType = mapToBackendChannelType(channelType);
        
        const request: ActivateChannelRequest = {
          channelType: mappedChannelType,
          displayName: displayName || channel.name,
          phoneNumberOption: channel.requiresPhone ? (phoneNumberOption || 'new') : undefined,
          existingPhoneNumber: channel.requiresPhone 
            ? (phoneNumberOption === 'existing' ? existingPhone : provisionedPhone)
            : undefined,
        };
        
        console.log('=== CHANNEL ACTIVATION DEBUG ===');
        console.log('Frontend channel type:', channelType);
        console.log('Mapped to backend type:', mappedChannelType);
        console.log('Full request object:', request);
        console.log('Request JSON:', JSON.stringify(request, null, 2));
        console.log('================================');

        try {
          const response = await activateMutation.mutateAsync(request);
          console.log('Activation response:', response);

          // Handle OAuth-required channels (Social Messaging)
          if (response.requiresOAuth && response.oAuthUrl) {
            console.log('OAuth required, opening in new tab:', response.oAuthUrl);
            toast.info(`${channel.name} requires Meta connection. Opening authorization in new tab...`);
            // Open Meta OAuth flow in a new tab
            window.open(response.oAuthUrl, '_blank', 'noopener,noreferrer');
            return; // Stop processing - user will complete OAuth in new tab
          }

          if (response.success) {
            successCount++;
          } else {
            console.error('Activation failed:', response.errorMessage);
            failedChannels.push(channel.name);
          }
        } catch (error: unknown) {
          const err = error as { message?: string; response?: { data?: unknown; status?: number } };
          console.error('Activation error for', channel.name, ':', err.message);
          console.error('Error response data:', JSON.stringify(err.response?.data, null, 2));
          console.error('Error status:', err.response?.status);
          console.error('Full error:', err);
          failedChannels.push(channel.name);
        }
      }

      // Show summary
      if (successCount > 0 && failedChannels.length === 0) {
        toast.success(`Successfully activated ${successCount} channel${successCount > 1 ? 's' : ''}!`);
        onComplete();
        resetWizard();
      } else if (successCount > 0 && failedChannels.length > 0) {
        toast.warning(`Activated ${successCount} channels. Failed: ${failedChannels.join(', ')}`);
        onComplete();
        resetWizard();
      } else {
        toast.error(`Failed to activate channels: ${failedChannels.join(', ')}`);
      }
    } catch (_error) {
      toast.error('An unexpected error occurred during activation');
    }
  };

  const requiresPhoneNumber = selectedChannels.some(type => {
    const channel = CHANNEL_CATALOG.find(c => c.type === type);
    return channel?.requiresPhone;
  });

  // Check if Next button should be disabled
  const isNextDisabled = () => {
    if (step === 1 && !selectedGoal && !selectedIndustry) return true;
    if (step === 2 && selectedChannels.length === 0) return true;
    if (step === 3 && requiresPhoneNumber) {
      if (phoneNumberOption === 'new' && !provisionedPhone) return true;
      if (phoneNumberOption === 'existing' && !existingPhone) return true;
    }
    return false;
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <>
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" />
            Add Communication Channels
          </ModalTitle>
          <ModalDescription>
            Set up the right channels for your business goals
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">Step {step} of 4</span>
              <span className="text-xs text-text-secondary">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>

          {/* Step 1: Goal or Industry Selection (Skip if already have onboarding data) */}
          {step === 1 && !hasOnboardingData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">What&apos;s your primary goal?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {BUSINESS_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => {
                          setSelectedGoal(goal.id);
                          setSelectedIndustry('');
                        }}
                        className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                          selectedGoal === goal.id
                            ? 'border-purple-600 bg-primary/5'
                            : 'border-border hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${goal.bgColor}`}>
                            <Icon className={`size-5 ${goal.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-navy">{goal.title}</h4>
                            <p className="text-sm text-text-secondary mt-1">{goal.description}</p>
                          </div>
                          {selectedGoal === goal.id && (
                            <CheckCircle2 className="size-5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-text-secondary">OR</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Select your industry</h3>
                <div className="grid grid-cols-2 gap-3">
                  {INDUSTRIES.map((industry) => {
                    const Icon = industry.icon;
                    return (
                      <button
                        key={industry.id}
                        onClick={() => {
                          setSelectedIndustry(industry.id);
                          setSelectedGoal('');
                        }}
                        className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-sm ${
                          selectedIndustry === industry.id
                            ? 'border-purple-600 bg-primary/5'
                            : 'border-border hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-5 text-muted-foreground" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{industry.name}</h4>
                            <p className="text-xs text-text-secondary">{industry.description}</p>
                          </div>
                          {selectedIndustry === industry.id && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Show business context if pre-populated */}
          {step === 1 && hasOnboardingData && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-border">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Using Your Business Profile
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  We&apos;ve pre-selected channels based on your onboarding preferences.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {onboardingData?.industry && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-xs text-text-secondary">Industry</span>
                      <p className="font-medium capitalize">{onboardingData.industry.replace('-', ' ')}</p>
                    </div>
                  )}
                  {onboardingData?.mainObjective && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-xs text-text-secondary">Main Goal</span>
                      <p className="font-medium capitalize">{onboardingData.mainObjective.replace('-', ' ')}</p>
                    </div>
                  )}
                  {onboardingData?.teamSize && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-xs text-text-secondary">Team Size</span>
                      <p className="font-medium">{onboardingData.teamSize}</p>
                    </div>
                  )}
                  {subscription && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-xs text-text-secondary">Current Plan</span>
                      <p className="font-medium">{subscription.planName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Channel Selection */}
          {(step === 2 || (step === 1 && hasOnboardingData)) && (
            <div className="space-y-6">
              {/* Subscription Status Banner */}
              {subscription && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Current Plan: {subscription.planName}</h4>
                      <p className="text-sm text-primary">
                        {checkLimit('maxChannels').current} channels used
                      </p>
                    </div>
                    {checkLimit('maxChannels').percentage > 80 && (
                      <Badge className="bg-orange-100 text-orange-700">Near Limit</Badge>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Recommended Channels</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Based on your selection, here are the best channels for your business
                </p>
              </div>

              <div className="space-y-6">
                {/* Onboarding Selected Channels Section */}
                {onboardingChannels.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="size-4 text-amber-500" />
                      <h4 className="text-sm font-semibold text-foreground/80">Your Onboarding Selections</h4>
                      <Badge className="bg-amber-100 text-amber-700 text-xs">{onboardingChannels.length} pending</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">
                      These channels were selected during your onboarding setup
                    </p>
                    <div className="space-y-2">
                      {onboardingChannels.map((channel) => {
                        const Icon = channel.icon;
                        const isSelected = selectedChannels.includes(channel.type);
                        const isPreSelected = preSelectedChannel && normalizeChannelType(preSelectedChannel) === channel.type;

                        return (
                          <button
                            key={channel.type}
                            onClick={() => handleChannelToggle(channel.type)}
                            className={`w-full p-3 border rounded-lg text-left transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-primary/5 shadow-sm'
                                : 'border-amber-300 bg-amber-50/30 hover:border-purple-400'
                            } ${isPreSelected ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channel.bgColor} flex-shrink-0`}>
                                <Icon className={`size-5 ${channel.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-medium text-sm text-text-navy">{channel.name}</h4>
                                  {isSelected && (
                                    <Badge className="bg-primary text-white text-[10px] px-1.5 py-0">Setting Up</Badge>
                                  )}
                                  <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">From Onboarding</Badge>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{channel.setupTime}</Badge>
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 truncate">{channel.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {channel.benefits.slice(0, 3).map((benefit, idx) => (
                                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-white border rounded-full text-muted-foreground">
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {isSelected ? (
                                <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                              ) : (
                                <div className="size-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Channels Section */}
                {additionalChannels.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground/80">Additional Channels</h4>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{additionalChannels.length} available</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      Other channels you can activate
                    </p>
                    <div className="space-y-2">
                      {additionalChannels.map((channel) => {
                        const Icon = channel.icon;
                        const isRecommended = recommendedChannelTypes.includes(channel.type);
                        const isSelected = selectedChannels.includes(channel.type);
                        const isPreSelected = preSelectedChannel && normalizeChannelType(preSelectedChannel) === channel.type;

                        return (
                          <button
                            key={channel.type}
                            onClick={() => handleChannelToggle(channel.type)}
                            className={`w-full p-3 border rounded-lg text-left transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-primary/5 shadow-sm'
                                : isRecommended
                                ? 'border-blue-200 bg-blue-50/30 hover:border-purple-400'
                                : 'border-border hover:border-muted-foreground/50'
                            } ${isPreSelected ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channel.bgColor} flex-shrink-0`}>
                                <Icon className={`size-5 ${channel.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-medium text-sm text-text-navy">{channel.name}</h4>
                                  {isSelected && (
                                    <Badge className="bg-primary text-white text-[10px] px-1.5 py-0">Setting Up</Badge>
                                  )}
                                  {isRecommended && !isSelected && (
                                    <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">Recommended</Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{channel.setupTime}</Badge>
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 truncate">{channel.description}</p>
                              </div>
                              {isSelected ? (
                                <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                              ) : (
                                <div className="size-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Already Active Channels Section */}
                {activeChannels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground/80 mb-2">Already Active</h4>
                    <div className="space-y-2">
                      {activeChannels.map((channel) => {
                        const Icon = channel.icon;

                        return (
                          <div
                            key={channel.type}
                            className="p-3 border rounded-lg bg-muted/20 opacity-60 cursor-not-allowed"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channel.bgColor} flex-shrink-0`}>
                                <Icon className={`size-5 ${channel.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-medium text-sm text-text-navy">{channel.name}</h4>
                                  <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">Active</Badge>
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 truncate">{channel.description}</p>
                              </div>
                              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Phone Number Setup (if needed) */}
          {step === 3 && requiresPhoneNumber && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Phone Number Setup</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Your selected channels require a phone number for SMS, Voice, and WhatsApp
                </p>
              </div>

              <RadioGroup value={phoneNumberOption} onValueChange={(value: string) => setPhoneNumberOption(value as 'new' | 'existing')}>
                <div className="space-y-3">
                  <div className={`p-4 border-2 rounded-lg cursor-pointer ${phoneNumberOption === 'new' ? 'border-purple-600 bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="new" id="new" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="new" className="font-semibold cursor-pointer">
                          Get a new phone number
                        </Label>
                        <p className="text-sm text-text-secondary mt-1">
                          We&apos;ll help you find and provision a local or toll-free number
                        </p>
                        {phoneNumberOption === 'new' && (
                          <Button
                            onClick={() => setShowPhoneProvisioning(true)}
                            className="mt-3"
                            variant="outline"
                          >
                            Search Available Numbers
                          </Button>
                        )}
                        {provisionedPhone && (
                          <div className="mt-2 text-sm font-medium text-green-600">
                            Selected: {provisionedPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-2 rounded-lg cursor-pointer ${phoneNumberOption === 'existing' ? 'border-purple-600 bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="existing" id="existing" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="existing" className="font-semibold cursor-pointer">
                          Use an existing number
                        </Label>
                        <p className="text-sm text-text-secondary mt-1">
                          Port your current business number (may take 2-3 business days)
                        </p>
                        {phoneNumberOption === 'existing' && (
                          <div className="mt-3">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={existingPhone}
                              onChange={(e) => setExistingPhone(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Review & Activate */}
          {step === (requiresPhoneNumber ? 4 : 3) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Activate</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Confirm your channel setup before activation
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-primary/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Channels to Activate ({selectedChannels.length})
                </h4>
                <div className="space-y-3">
                  {selectedChannels.map(type => {
                    const channel = CHANNEL_CATALOG.find(c => c.type === type);
                    if (!channel) return null;
                    const Icon = channel.icon;
                    return (
                      <div key={type} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <div className={`p-2 rounded-lg ${channel.bgColor}`}>
                          <Icon className={`size-5 ${channel.color}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{channel.name}</h5>
                          <p className="text-xs text-text-secondary">{channel.description}</p>
                        </div>
                        <Badge variant="outline">{channel.setupTime}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {requiresPhoneNumber && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Phone Number</h4>
                  <p className="text-sm">
                    {phoneNumberOption === 'new' && provisionedPhone && `New number: ${provisionedPhone}`}
                    {phoneNumberOption === 'existing' && existingPhone && `Existing number: ${existingPhone}`}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Main Business Line"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-text-secondary mt-1">
                  This name will help you identify the channel in your dashboard
                </p>
              </div>
            </div>
          )}

        </ModalBody>

        {/* Navigation Buttons */}
        <ModalFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step < (requiresPhoneNumber ? 4 : 3) ? (
              <Button onClick={handleNext} disabled={isNextDisabled()} className="gap-2">
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleActivate}
                disabled={activateMutation.isPending}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Zap className="size-4" />
                {activateMutation.isPending ? 'Activating...' : 'Activate Channels'}
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>

      {/* Phone Number Provisioning Dialog */}
      <PhoneNumberProvisioningDialog
        open={showPhoneProvisioning}
        onOpenChange={setShowPhoneProvisioning}
        onProvision={handlePhoneProvisioned}
        channelType="SMS"
      />

      {/* Upgrade Dialog */}
      <UpgradePrompt
        showDialog={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        reason={upgradeReason}
        currentPlan={subscription?.planName}
      />
    </>
  );
}
