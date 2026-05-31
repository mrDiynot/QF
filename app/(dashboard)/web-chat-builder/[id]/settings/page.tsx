'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { WidgetAppearanceSettings } from '@/components/chat-widgets/WidgetAppearanceSettings';
import { WidgetBehaviorSettings } from '@/components/chat-widgets/WidgetBehaviorSettings';
import { WidgetPreview } from '@/components/chat-widgets/WidgetPreview';
import { 
  WidgetConfig,
  DEFAULT_APPEARANCE,
  DEFAULT_BEHAVIOR,
  DEFAULT_AI_SETTINGS,
  DEFAULT_BUSINESS_HOURS,
} from '@/types/widget-builder';
import { useChannel } from '@/hooks/api/useChannels';
import { channelsService } from '@/services/api/channels.service';
import { toast } from 'sonner';
import { EmbedCodeDialog } from '@/components/forms/EmbedCodeDialog';

export default function WidgetSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const widgetId = params.id as string;
  const queryClient = useQueryClient();

  const [showPreview, setShowPreview] = useState(true);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Use standardized hook for consistent data fetching
  const { data: existingWidget, isLoading } = useChannel(widgetId);

  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    name: 'Chat Widget',
    appearance: DEFAULT_APPEARANCE,
    behavior: DEFAULT_BEHAVIOR,
    aiSettings: DEFAULT_AI_SETTINGS,
    businessHours: DEFAULT_BUSINESS_HOURS,
    isActive: false,
  });

  // Update state when widget loads
  useEffect(() => {
    if (existingWidget) {
      const config = existingWidget.configuration as Record<string, unknown> | undefined;
      setWidgetConfig({
        id: existingWidget.id,
        businessId: existingWidget.businessId,
        name: existingWidget.name,
        appearance: { ...DEFAULT_APPEARANCE, ...(config?.appearance as object || {}) },
        behavior: { ...DEFAULT_BEHAVIOR, ...(config?.behavior as object || {}) },
        aiSettings: { ...DEFAULT_AI_SETTINGS, ...(config?.aiSettings as object || {}) },
        businessHours: { ...DEFAULT_BUSINESS_HOURS, ...(config?.businessHours as object || {}) },
        isActive: existingWidget.isActive,
        widgetKey: existingWidget.channelIdentifier,
      });
    }
  }, [existingWidget]);

  // Save widget mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const configurationData: Record<string, unknown> = {
        appearance: widgetConfig.appearance,
        behavior: widgetConfig.behavior,
        aiSettings: widgetConfig.aiSettings,
        businessHours: widgetConfig.businessHours,
      };

      if (widgetId && widgetId !== 'new') {
        return await channelsService.updateChannel(widgetId, {
          name: widgetConfig.name,
          isActive: widgetConfig.isActive,
          configuration: configurationData,
        });
      } else {
        return await channelsService.createChannel({
          name: widgetConfig.name,
          type: 'ChatWidget',
          channelIdentifier: `widget-${Date.now()}`,
          configuration: configurationData,
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['chat-widget', widgetId] });
      toast.success('Widget saved successfully');
      if (widgetId === 'new') {
        router.push(`/web-chat-builder/${data.id}/settings`);
      }
    },
    onError: () => {
      toast.error('Failed to save widget');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/web-chat-builder')}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Input
                value={widgetConfig.name}
                onChange={(e) => setWidgetConfig(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 w-64"
                placeholder="Widget Name"
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="active-toggle" className="text-sm text-text-secondary">
                  Active
                </Label>
                <Switch
                  id="active-toggle"
                  checked={widgetConfig.isActive}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="size-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmbedCode(true)}
              className="gap-2"
              disabled={!widgetConfig.widgetKey}
            >
              <Code className="size-4" />
              Get Code
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2 gradient-primary text-white"
            >
              <Save className="size-4" />
              Save Widget
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left - Settings */}
        <div className="flex-1 p-8 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="ai">AI Settings</TabsTrigger>
                <TabsTrigger value="hours">Business Hours</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="mt-6">
                <WidgetAppearanceSettings
                  appearance={widgetConfig.appearance}
                  onUpdate={(appearance) => setWidgetConfig(prev => ({ ...prev, appearance }))}
                />
              </TabsContent>

              <TabsContent value="behavior" className="mt-6">
                <WidgetBehaviorSettings
                  behavior={widgetConfig.behavior}
                  onUpdate={(behavior) => setWidgetConfig(prev => ({ ...prev, behavior }))}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-6 space-y-6">
                <h3 className="text-lg font-semibold text-text-navy">AI Settings</h3>
                
                <div className="space-y-2">
                  <Label>AI Personality</Label>
                  <select
                    value={widgetConfig.aiSettings.personality}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      aiSettings: { 
                        ...prev.aiSettings, 
                        personality: e.target.value as 'friendly' | 'professional' | 'casual' | 'formal'
                      },
                    }))}
                    className="w-full rounded-lg border border-border px-3 py-2"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use Emojis</Label>
                    <p className="text-xs text-text-secondary mt-1">
                      Allow AI to use emojis in responses
                    </p>
                  </div>
                  <Switch
                    checked={widgetConfig.aiSettings.useEmojis}
                    onCheckedChange={(checked) => setWidgetConfig(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, useEmojis: checked },
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lead Qualification</Label>
                    <p className="text-xs text-text-secondary mt-1">
                      Enable AI-powered lead qualification
                    </p>
                  </div>
                  <Switch
                    checked={widgetConfig.aiSettings.qualificationEnabled}
                    onCheckedChange={(checked) => setWidgetConfig(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, qualificationEnabled: checked },
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Human Handoff</Label>
                    <p className="text-xs text-text-secondary mt-1">
                      Allow transfer to human agents
                    </p>
                  </div>
                  <Switch
                    checked={widgetConfig.aiSettings.handoffEnabled}
                    onCheckedChange={(checked) => setWidgetConfig(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, handoffEnabled: checked },
                    }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="hours" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-navy">Business Hours</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Set when your team is available to chat
                    </p>
                  </div>
                  <Switch
                    checked={widgetConfig.businessHours.enabled}
                    onCheckedChange={(checked) => setWidgetConfig(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, enabled: checked },
                    }))}
                  />
                </div>

                {widgetConfig.businessHours.enabled && (
                  <div className="space-y-4">
                    {Object.entries(widgetConfig.businessHours.schedule).map(([day, schedule]) => (
                      <div key={day} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => setWidgetConfig(prev => ({
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              schedule: {
                                ...prev.businessHours.schedule,
                                [day]: { ...schedule, enabled: checked },
                              },
                            },
                          }))}
                        />
                        <div className="flex-1">
                          <Label className="capitalize">{day}</Label>
                        </div>
                        {schedule.enabled && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => setWidgetConfig(prev => ({
                                ...prev,
                                businessHours: {
                                  ...prev.businessHours,
                                  schedule: {
                                    ...prev.businessHours.schedule,
                                    [day]: { ...schedule, start: e.target.value },
                                  },
                                },
                              }))}
                              className="w-32"
                            />
                            <span className="text-text-secondary">to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => setWidgetConfig(prev => ({
                                ...prev,
                                businessHours: {
                                  ...prev.businessHours,
                                  schedule: {
                                    ...prev.businessHours.schedule,
                                    [day]: { ...schedule, end: e.target.value },
                                  },
                                },
                              }))}
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right - Preview */}
        {showPreview && (
          <div className="w-[600px] border-l border-border bg-gray-50 p-8 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
            <h3 className="text-lg font-semibold text-text-navy mb-6">Live Preview</h3>
            <WidgetPreview
              appearance={widgetConfig.appearance}
              behavior={widgetConfig.behavior}
            />
          </div>
        )}
      </div>

      {/* Embed Code Dialog */}
      {widgetConfig.widgetKey && (
        <EmbedCodeDialog
          open={showEmbedCode}
          onOpenChange={setShowEmbedCode}
          formId={widgetConfig.id || ''}
          formSlug={widgetConfig.widgetKey}
        />
      )}
    </div>
  );
}
