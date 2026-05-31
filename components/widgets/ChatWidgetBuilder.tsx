'use client';

/**
 * Chat Widget Builder Component
 * Allows users to customize and configure their embedded chat widget
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Palette,
  MessageSquare,
  Settings,
  Code,
  Eye,
  Save,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface WidgetConfig {
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  buttonSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  
  // Branding
  title: string;
  subtitle: string;
  welcomeMessage: string;
  placeholder: string;
  logoUrl?: string;
  
  // Behavior
  autoOpen: boolean;
  autoOpenDelay: number;
  showBranding: boolean;
  enableSounds: boolean;
  enableTypingIndicator: boolean;
  
  // AI Settings
  aiEnabled: boolean;
  aiGreeting: string;
  aiPersona: 'professional' | 'friendly' | 'casual';
}

const DEFAULT_CONFIG: WidgetConfig = {
  primaryColor: '#7C3AED',
  secondaryColor: '#EC4899',
  position: 'bottom-right',
  buttonSize: 'medium',
  borderRadius: 16,
  title: 'Chat with us',
  subtitle: 'We typically reply within minutes',
  welcomeMessage: 'Hi there! 👋 How can we help you today?',
  placeholder: 'Type your message...',
  autoOpen: false,
  autoOpenDelay: 5,
  showBranding: true,
  enableSounds: true,
  enableTypingIndicator: true,
  aiEnabled: true,
  aiGreeting: "Hello! I&apos;m your AI assistant. How can I help you today?",
  aiPersona: 'professional',
};

interface ChatWidgetBuilderProps {
  initialConfig?: Partial<WidgetConfig>;
  onSave?: (config: WidgetConfig) => void;
  className?: string;
}

export function ChatWidgetBuilder({ 
  initialConfig, 
  onSave, 
  className 
}: ChatWidgetBuilderProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [activeTab, setActiveTab] = useState('appearance');
  const [copied, setCopied] = useState(false);

  const updateConfig = useCallback(<K extends keyof WidgetConfig>(
    key: K,
    value: WidgetConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    onSave?.(config);
    toast.success('Widget configuration saved');
  };

  const generateEmbedCode = () => {
    const configJson = JSON.stringify(config, null, 2);
    return `<!-- Qualiflow AI Chat Widget -->
<script>
  window.qualiflowConfig = ${configJson};
</script>
<script src="https://cdn.qualiflow.ai/widget.js" async></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("grid lg:grid-cols-2 gap-6", className)}>
      {/* Configuration Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Widget Builder</h2>
              <p className="text-sm text-muted-foreground">Customize your chat widget</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-purple-700">
            <Save className="size-4" />
            Save
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="appearance" className="gap-1">
              <Palette className="size-4" />
              <span className="hidden sm:inline">Style</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1">
              <MessageSquare className="size-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-1">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-1">
              <Code className="size-4" />
              <span className="hidden sm:inline">Embed</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={config.position}
                  onValueChange={(v) => updateConfig('position', v as WidgetConfig['position'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Button Size</Label>
                <Select
                  value={config.buttonSize}
                  onValueChange={(v) => updateConfig('buttonSize', v as WidgetConfig['buttonSize'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Border Radius: {config.borderRadius}px</Label>
              <input
                type="range"
                min="0"
                max="32"
                value={config.borderRadius}
                onChange={(e) => updateConfig('borderRadius', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Widget Title</Label>
              <Input
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Chat with us"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={config.subtitle}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                placeholder="We typically reply within minutes"
              />
            </div>

            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea
                value={config.welcomeMessage}
                onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                placeholder="Hi there! How can we help you?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Input Placeholder</Label>
              <Input
                value={config.placeholder}
                onChange={(e) => updateConfig('placeholder', e.target.value)}
                placeholder="Type your message..."
              />
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 text-primary" />
                <span className="font-medium text-foreground">AI Settings</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable AI Assistant</Label>
                  <Switch
                    checked={config.aiEnabled}
                    onCheckedChange={(v) => updateConfig('aiEnabled', v)}
                  />
                </div>
                {config.aiEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>AI Greeting</Label>
                      <Textarea
                        value={config.aiGreeting}
                        onChange={(e) => updateConfig('aiGreeting', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>AI Persona</Label>
                      <Select
                        value={config.aiPersona}
                        onValueChange={(v) => updateConfig('aiPersona', v as WidgetConfig['aiPersona'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-open Widget</Label>
                  <p className="text-xs text-muted-foreground">Automatically open chat after delay</p>
                </div>
                <Switch
                  checked={config.autoOpen}
                  onCheckedChange={(v) => updateConfig('autoOpen', v)}
                />
              </div>

              {config.autoOpen && (
                <div className="space-y-2">
                  <Label>Delay (seconds): {config.autoOpenDelay}s</Label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={config.autoOpenDelay}
                    onChange={(e) => updateConfig('autoOpenDelay', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Qualiflow AI Branding</Label>
                  <p className="text-xs text-muted-foreground">Display &quot;Powered by Qualiflow AI&quot;</p>
                </div>
                <Switch
                  checked={config.showBranding}
                  onCheckedChange={(v) => updateConfig('showBranding', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Sounds</Label>
                  <p className="text-xs text-muted-foreground">Play notification sounds</p>
                </div>
                <Switch
                  checked={config.enableSounds}
                  onCheckedChange={(v) => updateConfig('enableSounds', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Typing Indicator</Label>
                  <p className="text-xs text-muted-foreground">Show when agent is typing</p>
                </div>
                <Switch
                  checked={config.enableTypingIndicator}
                  onCheckedChange={(v) => updateConfig('enableTypingIndicator', v)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Embed Code</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="gap-2"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-x-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
              <p className="text-sm text-muted-foreground">
                Add this code to your website&apos;s HTML, just before the closing <code className="bg-muted/40 px-1 rounded">&lt;/body&gt;</code> tag.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Preview Panel */}
      <Card className="p-6 bg-muted/20">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Live Preview</h3>
        </div>
        <WidgetPreview config={config} />
      </Card>
    </div>
  );
}

// Widget Preview Component
function WidgetPreview({ config }: { config: WidgetConfig }) {
  const [isOpen, setIsOpen] = useState(true);

  const buttonSizeClass = {
    small: 'size-12',
    medium: 'size-14',
    large: 'size-16',
  }[config.buttonSize];

  return (
    <div className="relative h-[500px] bg-white rounded-xl border overflow-hidden">
      {/* Mock website content */}
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-full bg-muted/40 rounded" />
        <div className="h-4 w-3/4 bg-muted/40 rounded" />
        <div className="h-4 w-5/6 bg-muted/40 rounded" />
        <div className="h-32 w-full bg-muted/40 rounded-lg" />
      </div>

      {/* Widget */}
      <div className={cn(
        "absolute bottom-4",
        config.position === 'bottom-right' ? 'right-4' : 'left-4'
      )}>
        {isOpen ? (
          <div 
            className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border"
            style={{ borderRadius: config.borderRadius }}
          >
            {/* Header */}
            <div 
              className="p-4 text-white"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{config.title}</h4>
                  <p className="text-xs text-white/80">{config.subtitle}</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 p-4 space-y-3 overflow-y-auto bg-muted/20">
              {/* AI Welcome */}
              {config.aiEnabled && (
                <div className="flex gap-2">
                  <div 
                    className="size-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Bot className="size-4" />
                  </div>
                  <div 
                    className="px-3 py-2 rounded-2xl rounded-bl-md bg-white border text-sm max-w-[80%]"
                  >
                    {config.aiGreeting}
                  </div>
                </div>
              )}

              {/* Welcome message */}
              <div className="flex gap-2">
                <div 
                  className="size-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <User className="size-4" />
                </div>
                <div 
                  className="px-3 py-2 rounded-2xl rounded-bl-md bg-white border text-sm max-w-[80%]"
                >
                  {config.welcomeMessage}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={config.placeholder}
                  className="flex-1 px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': config.primaryColor } as React.CSSProperties}
                />
                <button
                  className="size-9 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <MessageSquare className="size-4" />
                </button>
              </div>
              {config.showBranding && (
                <p className="text-[10px] text-center text-muted-foreground/60 mt-2">
                  Powered by Qualiflow AI
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110",
              buttonSizeClass
            )}
            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
          >
            <MessageSquare className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
