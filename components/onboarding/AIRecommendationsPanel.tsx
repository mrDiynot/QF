'use client';

/**
 * AI Recommendations Panel
 * Displays AI-generated onboarding recommendations with apply/skip options
 */

import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, MessageSquare, Zap, FileText, Bot, Loader2, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import aiService from '@/services/api/ai.service';
import type {
  OnboardingRecommendationResult,
  ChannelRecommendation,
  WorkflowRecommendation,
  AutomationRecommendation,
} from '@/types/ai-onboarding';

interface AIRecommendationsPanelProps {
  industry: string;
  companySize?: string;
  goals?: string[];
  leadType?: string;
  mainObjective?: string;
  leadSources?: string[];
  onApplyChannels?: (channels: string[]) => void;
  onApplyAutomations?: (automations: string[]) => void;
  onSkip?: () => void;
  className?: string;
}

export function AIRecommendationsPanel({
  industry,
  companySize,
  goals,
  leadType,
  mainObjective,
  leadSources,
  onApplyChannels,
  onApplyAutomations,
  onSkip,
  className,
}: AIRecommendationsPanelProps) {
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [selectedAutomations, setSelectedAutomations] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<OnboardingRecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedRef = useRef(false);

  // Use local state for the data instead of mutation state
  const data = recommendations;
  const isPending = isLoading;
  const isError = hasError;

  // Log render state every time component renders
  console.log('[AIRecommendationsPanel] RENDER - isLoading:', isLoading, 'hasError:', hasError, 'hasData:', !!recommendations, 'success:', recommendations?.success);

  // Fetch recommendations once when component mounts with valid industry
  useEffect(() => {
    // Ensure industry is a non-empty string before making API call
    const trimmedIndustry = industry?.trim();
    console.log('[AIRecommendationsPanel] Industry check - industry:', JSON.stringify(industry));
    console.log('[AIRecommendationsPanel] Industry check - trimmedIndustry:', JSON.stringify(trimmedIndustry));
    console.log('[AIRecommendationsPanel] Industry check - hasLoaded:', hasLoadedRef.current);
    console.log('[AIRecommendationsPanel] Industry check - willCall:', !!(trimmedIndustry && trimmedIndustry.length > 0 && !hasLoadedRef.current));

    if (trimmedIndustry && trimmedIndustry.length > 0 && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setIsLoading(true);
      setHasError(false);
      const payload = {
        industry: trimmedIndustry,
        companySize,
        goals,
        leadType,
        mainObjective,
        leadSources,
      };
      console.log('[AIRecommendationsPanel] Making DIRECT API call with payload:', JSON.stringify(payload, null, 2));

      // Call service directly instead of using mutation hook
      aiService.getOnboardingRecommendations(payload)
        .then((result) => {
          console.log('[AIRecommendationsPanel] DIRECT API success - result:', result?.success);
          setRecommendations(result);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('[AIRecommendationsPanel] DIRECT API error:', error);
          setHasError(true);
          setIsLoading(false);
        });
    }
  }, [industry, companySize, goals, leadType, mainObjective, leadSources]);

  // Log when data changes
  useEffect(() => {
    console.log('[AIRecommendationsPanel] Data changed - isPending:', isPending, 'isError:', isError, 'data?.success:', data?.success);
    if (data) {
      console.log('[AIRecommendationsPanel] Data received:', JSON.stringify({
        success: data.success,
        channelsCount: data.recommendedChannels?.length,
        errorMessage: data.errorMessage
      }));
    }
  }, [data, isPending, isError]);

  // Pre-select highly recommended items
  useEffect(() => {
    if (data?.success) {
      console.log('[AIRecommendationsPanel] Pre-selecting items from successful response');
      const highlyRecommendedChannels = data.recommendedChannels
        .filter(c => c.isHighlyRecommended)
        .map(c => c.channelType);
      setSelectedChannels(new Set(highlyRecommendedChannels));

      const quickWinAutomations = data.recommendedAutomations
        .filter(a => a.isQuickWin)
        .map(a => a.name);
      setSelectedAutomations(new Set(quickWinAutomations));
    }
  }, [data]);

  const toggleChannel = (channelType: string) => {
    setSelectedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelType)) {
        next.delete(channelType);
      } else {
        next.add(channelType);
      }
      return next;
    });
  };

  const toggleAutomation = (name: string) => {
    setSelectedAutomations(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleApply = () => {
    onApplyChannels?.(Array.from(selectedChannels));
    onApplyAutomations?.(Array.from(selectedAutomations));
  };

  // Early return if no industry provided - show skip option
  if (!industry?.trim()) {
    return (
      <Card className={cn('border-border', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Please select your business type first to get personalized recommendations.
            </p>
            <Button variant="outline" size="sm" onClick={onSkip}>
              Skip recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className={cn('border-primary/20 bg-gradient-to-br from-purple-50 to-white', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your business profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.success) {
    return (
      <Card className={cn('border-border', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {data?.errorMessage || 'Unable to load AI recommendations'}
            </p>
            <Button variant="outline" size="sm" onClick={onSkip}>
              Continue without recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-primary/20 bg-gradient-to-br from-purple-50 to-white', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
            <X className="size-4 mr-1" />
            Skip
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your {industry} business profile, we recommend the following setup.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
            <TabsTrigger value="automations" className="text-xs">Automations</TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs">Workflows</TabsTrigger>
            <TabsTrigger value="ai-config" className="text-xs">AI Config</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[280px]">
            <TabsContent value="channels" className="mt-0 space-y-2">
              {data.recommendedChannels.map((channel) => (
                <ChannelCard
                  key={channel.channelType}
                  channel={channel}
                  isSelected={selectedChannels.has(channel.channelType)}
                  onToggle={() => toggleChannel(channel.channelType)}
                />
              ))}
            </TabsContent>

            <TabsContent value="automations" className="mt-0 space-y-2">
              {data.recommendedAutomations.map((automation) => (
                <AutomationCard
                  key={automation.name}
                  automation={automation}
                  isSelected={selectedAutomations.has(automation.name)}
                  onToggle={() => toggleAutomation(automation.name)}
                />
              ))}
            </TabsContent>

            <TabsContent value="workflows" className="mt-0 space-y-2">
              {data.recommendedWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.name} workflow={workflow} />
              ))}
            </TabsContent>

            <TabsContent value="ai-config" className="mt-0">
              {data.aiConfiguration && (
                <AIConfigCard config={data.aiConfiguration} />
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          <Button
            onClick={handleApply}
          >
            Apply Recommendations
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-components for each recommendation type
function ChannelCard({
  channel,
  isSelected,
  onToggle
}: {
  channel: ChannelRecommendation;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    sms: <MessageSquare className="size-4" />,
    voice: <MessageSquare className="size-4" />,
    whatsapp: <MessageSquare className="size-4" />,
    webchat: <MessageSquare className="size-4" />,
    email: <MessageSquare className="size-4" />,
    instagram: <MessageSquare className="size-4" />,
    facebook: <MessageSquare className="size-4" />,
  };

  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected
          ? 'border-purple-400 bg-primary/5'
          : 'border-border hover:border-border'
      )}
    >
      <div className={cn(
        'mt-0.5 size-5 rounded-full flex items-center justify-center',
        isSelected ? 'bg-primary text-white' : 'bg-muted/40'
      )}>
        {isSelected ? <CheckCircle2 className="size-3" /> : iconMap[channel.channelType] || <MessageSquare className="size-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">{channel.channelType}</span>
          {channel.isHighlyRecommended && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              Recommended
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            Priority: {channel.priority}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{channel.rationale}</p>
      </div>
    </div>
  );
}

function AutomationCard({
  automation,
  isSelected,
  onToggle
}: {
  automation: AutomationRecommendation;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected
          ? 'border-purple-400 bg-primary/5'
          : 'border-border hover:border-border'
      )}
    >
      <div className={cn(
        'mt-0.5 size-5 rounded-full flex items-center justify-center',
        isSelected ? 'bg-primary text-white' : 'bg-muted/40'
      )}>
        {isSelected ? <CheckCircle2 className="size-3" /> : <Zap className="size-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{automation.name}</span>
          {automation.isQuickWin && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Quick Win
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{automation.description}</p>
      </div>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowRecommendation }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
      <div className="mt-0.5 size-5 rounded-full bg-muted/50 flex items-center justify-center">
        <FileText className="size-3 text-info" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{workflow.name}</span>
          <Badge variant="outline" className="text-xs">{workflow.category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{workflow.description}</p>
        <p className="text-xs text-info mt-1">Trigger: {workflow.triggerType.replace(/_/g, ' ')}</p>
      </div>
    </div>
  );
}

function AIConfigCard({ config }: { config: OnboardingRecommendationResult['aiConfiguration'] }) {
  if (!config) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
        <Bot className="size-5 text-primary" />
        <div>
          <p className="font-medium text-sm">Conversation Tone</p>
          <p className="text-xs text-muted-foreground capitalize">{config.recommendedTone}</p>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border">
        <p className="font-medium text-sm mb-2">BANT Scoring Weights</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Budget:</span>
            <span className="font-medium">{config.scoringWeights.budget}%</span>
          </div>
          <div className="flex justify-between">
            <span>Authority:</span>
            <span className="font-medium">{config.scoringWeights.authority}%</span>
          </div>
          <div className="flex justify-between">
            <span>Need:</span>
            <span className="font-medium">{config.scoringWeights.need}%</span>
          </div>
          <div className="flex justify-between">
            <span>Timeline:</span>
            <span className="font-medium">{config.scoringWeights.timeline}%</span>
          </div>
        </div>
      </div>

      {config.greetingMessage && (
        <div className="p-3 rounded-lg border border-border">
          <p className="font-medium text-sm mb-1">Suggested Greeting</p>
          <p className="text-xs text-muted-foreground italic">&quot;{config.greetingMessage}&quot;</p>
        </div>
      )}

      {config.rationale && (
        <p className="text-xs text-muted-foreground">{config.rationale}</p>
      )}
    </div>
  );
}

