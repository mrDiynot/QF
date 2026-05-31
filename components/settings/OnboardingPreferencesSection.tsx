'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Target,
  MessageSquare,
  Phone,
  Bot,
  Clock,
  CheckCircle2,
  Loader2,
  Zap,
  Database,
} from 'lucide-react';
import { onboardingService } from '@/services/api/onboarding.service';
import { aiTrainingService } from '@/services/api/ai-training.service';
import { cn } from '@/lib/utils';

const industryLabels: Record<string, string> = {
  'real_estate': 'Real Estate',
  'real-estate': 'Real Estate',
  'realEstate': 'Real Estate',
  'RealEstate': 'Real Estate',
  'healthcare': 'Healthcare',
  'Healthcare': 'Healthcare',
  'saas': 'SaaS / Technology',
  'saas-technology': 'SaaS / Technology',
  'SaaS': 'SaaS / Technology',
  'technology': 'Technology',
  'consulting': 'Consulting',
  'Consulting': 'Consulting',
  'ecommerce': 'E-commerce',
  'Ecommerce': 'E-commerce',
  'e-commerce': 'E-commerce',
  'retail': 'Retail',
  'Retail': 'Retail',
  'finance': 'Finance',
  'Finance': 'Finance',
  'education': 'Education',
  'Education': 'Education',
  'other': 'Other',
  'Other': 'Other',
};

const teamSizeLabels: Record<string, string> = {
  'just_me': 'Just Me',
  'just-me': 'Just Me',
  'justMe': 'Just Me',
  'solo': 'Just Me',
  '1': 'Just Me',
  '2-5': '2-5 people',
  '2_5': '2-5 people',
  'small': '2-5 people',
  '6-20': '6-20 people',
  '6_20': '6-20 people',
  'medium': '6-20 people',
  '21-50': '21-50 people',
  '21_50': '21-50 people',
  'large': '21-50 people',
  '50+': '50+ people',
  '51+': '50+ people',
  'enterprise': '50+ people',
};

const leadTypeLabels: Record<string, string> = {
  'b2b': 'B2B (Business)',
  'b2c': 'B2C (Consumer)',
  'both': 'Both B2B & B2C',
};

const objectiveLabels: Record<string, string> = {
  'sales': 'Close More Sales',
  'closeSales': 'Close More Sales',
  'close_sales': 'Close More Sales',
  'automation': 'Automate Lead Qualification',
  'automate': 'Automate Lead Qualification',
  'lead_qualification': 'Automate Lead Qualification',
  'communication': 'Improve Communication',
  'improve_communication': 'Improve Communication',
  'meetings': 'Book More Meetings',
  'book_meetings': 'Book More Meetings',
  'bookMeetings': 'Book More Meetings',
  'proposals': 'Send Proposals Faster',
  'send_proposals': 'Send Proposals Faster',
  'organize': 'Organize Leads Better',
  'organization': 'Organize Leads Better',
  'organize_leads': 'Organize Leads Better',
};

const channelLabels: Record<string, string> = {
  'sms': 'SMS Messaging',
  'SMS': 'SMS Messaging',
  'phone': 'Voice Calls',
  'Phone': 'Voice Calls',
  'voice': 'Voice Calls',
  'Voice': 'Voice Calls',
  'email': 'Email',
  'Email': 'Email',
  'web_chat': 'Web Chat Widget',
  'webChat': 'Web Chat Widget',
  'chat': 'Web Chat Widget',
  'web_forms': 'Web Forms',
  'webForms': 'Web Forms',
  'forms': 'Web Forms',
  'social': 'Social Messaging',
  'Social': 'Social Messaging',
  'whatsapp': 'WhatsApp',
  'WhatsApp': 'WhatsApp',
  'facebook': 'Facebook Messenger',
  'Facebook': 'Facebook Messenger',
  'instagram': 'Instagram',
  'Instagram': 'Instagram',
};

const automationLabels: Record<string, string> = {
  'lead_qualification': 'AI Lead Qualification',
  'missed_call': 'Missed Call Recovery',
  'no_show_recovery': 'No-Show Recovery',
  'review_survey': 'Review & Survey Requests',
  'cold_lead_revival': 'Cold Lead Revival',
  'retention_reengagement': 'Retention & Re-Engagement',
  'proposal_creation': 'Proposal Creation',
  'proposal_sending': 'Proposal Automation',
  'abandoned_form': 'Abandoned Form Recovery',
  'post_purchase': 'Post-Purchase Flow',
  // Legacy alias
  'proposal': 'Proposal Generation',
};

const aiToneLabels: Record<string, string> = {
  'professional': 'Professional',
  'Professional': 'Professional',
  'friendly': 'Friendly',
  'Friendly': 'Friendly',
  'casual': 'Casual',
  'Casual': 'Casual',
  'enthusiastic': 'Enthusiastic',
  'Enthusiastic': 'Enthusiastic',
  'formal': 'Formal',
  'Formal': 'Formal',
  'warm': 'Warm & Welcoming',
  'Warm': 'Warm & Welcoming',
};

const crmLabels: Record<string, string> = {
  'hubspot': 'HubSpot',
  'salesforce': 'Salesforce',
  'pipedrive': 'Pipedrive',
  'zoho': 'Zoho CRM',
  'qualiflow': 'Qualiflow AI Built-in',
  'builtin': 'Qualiflow AI Built-in',
  'gohighlevel': 'GoHighLevel',
  'freshsales': 'Freshsales',
  'monday': 'Monday.com',
  'activecampaign': 'ActiveCampaign',
  'close': 'Close CRM',
  'copper': 'Copper',
  'other': 'Other',
};

function PreferenceItem({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg bg-muted/20", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value || 'Not set'}</div>
      </div>
    </div>
  );
}

function TagList({ items, labelMap }: { items: string[]; labelMap: Record<string, string> }) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground/60">None selected</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item) => (
        <Badge 
          key={item} 
          variant="secondary" 
          className="text-xs bg-primary/10 text-primary border-0"
        >
          {labelMap[item] || item}
        </Badge>
      ))}
    </div>
  );
}

export function OnboardingPreferencesSection() {
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['onboarding', 'preferences'],
    queryFn: onboardingService.getPreferences,
  });

  // Also fetch current AI training config to get the actual AI tone setting
  const { data: aiConfig } = useQuery({
    queryKey: ['ai-training', 'config'],
    queryFn: aiTrainingService.getConfig,
    // Only fetch if we have preferences (user has completed onboarding)
    enabled: !!preferences,
  });

  // Get the current AI tone - prefer AI training config, fallback to onboarding preferences
  const currentAiTone = aiConfig?.toneSettings?.tone || preferences?.aiTone;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground/60" />
        </div>
      </Card>
    );
  }

  if (error || !preferences) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <p>No onboarding preferences found.</p>
          <p className="text-sm mt-1">Complete the onboarding wizard to see your preferences here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Onboarding Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your business configuration from the onboarding wizard
          </p>
        </div>
        {preferences.isComplete && (
          <Badge className="bg-green-100 text-green-700 border-0 gap-1">
            <CheckCircle2 className="size-3" />
            Completed
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Business Profile Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
            <Building2 className="size-4" />
            Business Profile
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PreferenceItem 
              icon={Building2} 
              label="Industry" 
              value={industryLabels[preferences.industry || ''] || preferences.industry} 
            />
            <PreferenceItem 
              icon={Users} 
              label="Team Size" 
              value={teamSizeLabels[preferences.teamSize || ''] || preferences.teamSize} 
            />
            <PreferenceItem 
              icon={Target} 
              label="Lead Type" 
              value={leadTypeLabels[preferences.leadType || ''] || preferences.leadType} 
            />
            <PreferenceItem 
              icon={Target} 
              label="Main Objective" 
              value={objectiveLabels[preferences.mainObjective || ''] || preferences.mainObjective} 
            />
            <PreferenceItem 
              icon={Database} 
              label="CRM Platform" 
              value={crmLabels[preferences.crmProvider || ''] || preferences.crmProvider} 
            />
          </div>
        </div>

        {/* Channels & Automations Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
            <MessageSquare className="size-4" />
            Channels & Automations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Selected Channels
              </p>
              <TagList items={preferences.selectedChannels} labelMap={channelLabels} />
            </div>
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Enabled Automations
              </p>
              <TagList items={preferences.selectedAutomations} labelMap={automationLabels} />
            </div>
          </div>
        </div>

        {/* Phone & AI Configuration Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
            <Phone className="size-4" />
            Phone & AI Configuration
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PreferenceItem 
              icon={Phone} 
              label="Phone Setup" 
              value={preferences.phoneNumberOption === 'existing' ? 'Using Existing Number' : 'New AI Number'} 
            />
            {preferences.existingPhoneNumber && (
              <PreferenceItem 
                icon={Phone} 
                label="Existing Number" 
                value={preferences.existingPhoneNumber} 
              />
            )}
            {preferences.aiPhoneNumber && (
              <PreferenceItem 
                icon={Phone} 
                label="AI Phone Number" 
                value={preferences.aiPhoneNumber} 
              />
            )}
            <PreferenceItem
              icon={Bot}
              label="AI Tone"
              value={aiToneLabels[currentAiTone || ''] || currentAiTone}
            />
            <PreferenceItem 
              icon={Zap} 
              label="Missed Call SMS" 
              value={preferences.missedCallSmsEnabled ? 'Enabled' : 'Disabled'} 
            />
            <PreferenceItem 
              icon={Bot} 
              label="Outbound AI Calling" 
              value={preferences.outboundAiCallingEnabled ? 'Enabled' : 'Disabled'} 
            />
            {preferences.callForwardTo && (
              <PreferenceItem 
                icon={Phone} 
                label="Call Forwarding" 
                value={preferences.callForwardTo} 
              />
            )}
            {preferences.businessHours && (
              <PreferenceItem 
                icon={Clock} 
                label="Business Hours" 
                value={preferences.businessHours} 
              />
            )}
          </div>
        </div>

        {/* Completion Info */}
        {preferences.completedAt && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground/60">
              Onboarding completed on {new Date(preferences.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
