'use client';

/**
 * Voice Agent Configuration Component
 * Configure AI voice agent settings, personality, and behavior
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Mic,
  Volume2,
  Settings,
  Save,
  Play,
  Sparkles,
  Zap,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceAgentSettings {
  // Basic
  name: string;
  description: string;
  voiceId: string;
  language: string;
  
  // Personality
  persona: 'professional' | 'friendly' | 'casual' | 'formal';
  speakingRate: number;
  pitch: number;
  
  // Behavior
  greeting: string;
  fallbackMessage: string;
  maxCallDuration: number;
  silenceTimeout: number;
  
  // Capabilities
  canScheduleAppointments: boolean;
  canTransferToHuman: boolean;
  canTakeMessages: boolean;
  canProvideQuotes: boolean;
  
  // Advanced
  interruptionSensitivity: number;
  confidenceThreshold: number;
  enableSentimentAnalysis: boolean;
}

const DEFAULT_SETTINGS: VoiceAgentSettings = {
  name: 'AI Assistant',
  description: 'Friendly AI assistant for customer inquiries',
  voiceId: 'alloy',
  language: 'en-US',
  persona: 'professional',
  speakingRate: 1.0,
  pitch: 1.0,
  greeting: 'Hello! Thank you for calling. How may I assist you today?',
  fallbackMessage: "I apologize, but I didn&apos;t quite catch that. Could you please repeat?",
  maxCallDuration: 15,
  silenceTimeout: 10,
  canScheduleAppointments: true,
  canTransferToHuman: true,
  canTakeMessages: true,
  canProvideQuotes: false,
  interruptionSensitivity: 50,
  confidenceThreshold: 70,
  enableSentimentAnalysis: true,
};

const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
  { id: 'fable', name: 'Fable', description: 'Expressive and dynamic' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft and soothing' },
];

const LANGUAGE_OPTIONS = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
];

interface VoiceAgentConfigProps {
  initialSettings?: Partial<VoiceAgentSettings>;
  onSave?: (settings: VoiceAgentSettings) => void;
  className?: string;
}

export function VoiceAgentConfig({ initialSettings, onSave, className }: VoiceAgentConfigProps) {
  const [settings, setSettings] = useState<VoiceAgentSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [activeTab, setActiveTab] = useState('general');
  const [isTesting, setIsTesting] = useState(false);

  const updateSettings = useCallback(<K extends keyof VoiceAgentSettings>(
    key: K,
    value: VoiceAgentSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    onSave?.(settings);
    toast.success('Voice agent settings saved');
  };

  const testVoice = () => {
    setIsTesting(true);
    toast.info('Playing voice sample...');
    setTimeout(() => setIsTesting(false), 3000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Bot className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Voice Agent Configuration</h2>
              <p className="text-sm text-muted-foreground">Customize your AI voice assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={testVoice} disabled={isTesting} className="gap-2">
              <Play className="size-4" />
              {isTesting ? 'Playing...' : 'Test Voice'}
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-purple-700">
              <Save className="size-4" />
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="general" className="gap-1">
                  <Settings className="size-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-1">
                  <Mic className="size-4" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="behavior" className="gap-1">
                  <Zap className="size-4" />
                  Behavior
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-1">
                  <Shield className="size-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input
                      value={settings.name}
                      onChange={(e) => updateSettings('name', e.target.value)}
                      placeholder="AI Assistant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(v) => updateSettings('language', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={settings.description}
                    onChange={(e) => updateSettings('description', e.target.value)}
                    placeholder="Describe what your AI agent does..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Greeting Message</Label>
                  <Textarea
                    value={settings.greeting}
                    onChange={(e) => updateSettings('greeting', e.target.value)}
                    placeholder="Hello! How may I assist you today?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fallback Message</Label>
                  <Textarea
                    value={settings.fallbackMessage}
                    onChange={(e) => updateSettings('fallbackMessage', e.target.value)}
                    placeholder="I didn&apos;t understand. Could you repeat?"
                    rows={2}
                  />
                </div>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {VOICE_OPTIONS.map((voice) => (
                      <div
                        key={voice.id}
                        onClick={() => updateSettings('voiceId', voice.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          settings.voiceId === voice.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{voice.name}</span>
                          <Button variant="ghost" size="sm" className="size-8 p-0">
                            <Volume2 className="size-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Persona</Label>
                  <Select
                    value={settings.persona}
                    onValueChange={(v) => updateSettings('persona', v as VoiceAgentSettings['persona'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Speaking Rate</Label>
                      <span className="text-sm text-muted-foreground">{settings.speakingRate.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[settings.speakingRate]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueChange={([v]) => updateSettings('speakingRate', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Pitch</Label>
                      <span className="text-sm text-muted-foreground">{settings.pitch.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[settings.pitch]}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      onValueChange={([v]) => updateSettings('pitch', v)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Behavior Tab */}
              <TabsContent value="behavior" className="space-y-6 mt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Call Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.maxCallDuration}
                      onChange={(e) => updateSettings('maxCallDuration', parseInt(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Silence Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.silenceTimeout}
                      onChange={(e) => updateSettings('silenceTimeout', parseInt(e.target.value))}
                      min={3}
                      max={30}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-foreground">Capabilities</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Schedule Appointments</Label>
                        <p className="text-xs text-muted-foreground">Allow agent to book appointments</p>
                      </div>
                      <Switch
                        checked={settings.canScheduleAppointments}
                        onCheckedChange={(v) => updateSettings('canScheduleAppointments', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Transfer to Human</Label>
                        <p className="text-xs text-muted-foreground">Allow agent to transfer calls</p>
                      </div>
                      <Switch
                        checked={settings.canTransferToHuman}
                        onCheckedChange={(v) => updateSettings('canTransferToHuman', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Take Messages</Label>
                        <p className="text-xs text-muted-foreground">Allow agent to take voicemail</p>
                      </div>
                      <Switch
                        checked={settings.canTakeMessages}
                        onCheckedChange={(v) => updateSettings('canTakeMessages', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Provide Quotes</Label>
                        <p className="text-xs text-muted-foreground">Allow agent to give pricing</p>
                      </div>
                      <Switch
                        checked={settings.canProvideQuotes}
                        onCheckedChange={(v) => updateSettings('canProvideQuotes', v)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Interruption Sensitivity</Label>
                      <span className="text-sm text-muted-foreground">{settings.interruptionSensitivity}%</span>
                    </div>
                    <Slider
                      value={[settings.interruptionSensitivity]}
                      min={0}
                      max={100}
                      onValueChange={([v]) => updateSettings('interruptionSensitivity', v)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher = more sensitive to being interrupted
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Confidence Threshold</Label>
                      <span className="text-sm text-muted-foreground">{settings.confidenceThreshold}%</span>
                    </div>
                    <Slider
                      value={[settings.confidenceThreshold]}
                      min={50}
                      max={95}
                      onValueChange={([v]) => updateSettings('confidenceThreshold', v)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum confidence to process response
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <Label>Sentiment Analysis</Label>
                      <p className="text-xs text-muted-foreground">Analyze caller emotions in real-time</p>
                    </div>
                    <Switch
                      checked={settings.enableSentimentAnalysis}
                      onCheckedChange={(v) => updateSettings('enableSentimentAnalysis', v)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Advanced Settings</p>
                      <p className="text-xs text-amber-700 mt-1">
                        These settings can significantly impact agent performance. 
                        Test thoroughly after making changes.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <Card className="p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="size-5 text-primary" />
            <h3 className="font-semibold text-foreground">Agent Preview</h3>
          </div>

          <div className="space-y-4">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white mx-auto mb-3">
                <Bot className="size-8" />
              </div>
              <h4 className="font-semibold text-foreground">{settings.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{settings.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Voice</span>
                <Badge variant="secondary">
                  {VOICE_OPTIONS.find(v => v.id === settings.voiceId)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <Badge variant="secondary">
                  {LANGUAGE_OPTIONS.find(l => l.code === settings.language)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Persona</span>
                <Badge variant="secondary" className="capitalize">
                  {settings.persona}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Sample Greeting:</p>
              <div className="p-3 rounded-lg bg-muted/20 text-sm text-foreground/80 italic">
                &quot;{settings.greeting}&quot;
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={testVoice}>
              <Play className="size-4" />
              Preview Voice
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
