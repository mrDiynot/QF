'use client';

/**
 * Chat Widget Tester Page
 * Comprehensive testing for chat widget functionality
 *
 * Uses dynamic imports for heavy components to reduce initial bundle size.
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MessageSquare,
  Palette,
  Activity,
  RotateCcw,
  Copy,
  Check,
  Code,
  Smartphone,
  Monitor,
  Zap,
  Bot,
  Clock,
} from 'lucide-react';
import { chatWidgetsService, ChatWidget } from '@/services/api/chat-widgets.service';
import { useSimulatorTheme } from '../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SimulatorLoadingSkeleton } from '@/components/simulator';

// Lazy load heavy ChatWidgetEmbed component
const ChatWidgetEmbed = dynamic(
  () => import('@/components/simulator/ChatWidgetEmbed').then(mod => ({ default: mod.ChatWidgetEmbed })),
  {
    loading: () => <SimulatorLoadingSkeleton message="Loading chat widget..." height="h-[600px]" />,
    ssr: false,
  }
);

const colorPresets = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Slate', value: '#64748b' },
];

const testScenarios = [
  { id: 'greeting', name: 'Initial Greeting', description: 'Test welcome message display' },
  { id: 'conversation', name: 'Full Conversation', description: 'Complete conversation flow' },
  { id: 'handoff', name: 'Agent Handoff', description: 'Transfer to human agent' },
  { id: 'offline', name: 'Offline Mode', description: 'Widget when agents unavailable' },
  { id: 'error', name: 'Error Handling', description: 'Network error scenarios' },
];

export default function ChatWidgetTesterPage() {
  useSimulatorTheme();
  const [, setWidgets] = useState<ChatWidget[]>([]);
  const [, setSelectedWidget] = useState<ChatWidget | null>(null);
  const [, setIsLoadingWidgets] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! 👋 How can we help you today?");
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [showBranding, setShowBranding] = useState(true);
  const [autoOpen, setAutoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Fetch widgets on mount
  useEffect(() => {
    const fetchWidgets = async () => {
      setIsLoadingWidgets(true);
      try {
        const data = await chatWidgetsService.getChatWidgets();
        setWidgets(data);
        if (data.length > 0) {
          setSelectedWidget(data[0]);
          setPrimaryColor(data[0].primaryColor || '#8b5cf6');
          setPosition(data[0].position || 'bottom-right');
          setWelcomeMessage(data[0].welcomeMessage || "Hi! 👋 How can we help you today?");
          setShowBranding(data[0].showBranding ?? true);
        }
      } catch (error) {
        console.error('Error fetching chat widgets:', error);
      } finally {
        setIsLoadingWidgets(false);
      }
    };
    fetchWidgets();
  }, []);

  // Widget selection handler - reserved for dropdown selector
  const handleWidgetSelect = (widget: ChatWidget) => {
    setSelectedWidget(widget);
    setPrimaryColor(widget.primaryColor || '#8b5cf6');
    setPosition(widget.position || 'bottom-right');
    setWelcomeMessage(widget.welcomeMessage || "Hi! 👋 How can we help you today?");
    setShowBranding(widget.showBranding ?? true);
  };
  // Suppress unused warning - will be used when widget selector is added
  void handleWidgetSelect;

  const embedCode = `<script src="https://cdn.qualiflow.ai/widget.js"></script>
<script>
  Qualiflow AIAI.init({
    widgetKey: 'your-widget-key',
    primaryColor: '${primaryColor}',
    position: '${position}',
    welcomeMessage: '${welcomeMessage}',
    showBranding: ${showBranding}
  });
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Chat Widget Tester</h1>
                <p className="text-xs text-slate-400">Test and customize your chat widget</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Widget Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <Tabs defaultValue="customize" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-slate-800 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="customize"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4 py-3"
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize
              </TabsTrigger>
              <TabsTrigger
                value="scenarios"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4 py-3"
              >
                <Zap className="w-4 h-4 mr-2" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4 py-3"
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="flex-1 p-4 space-y-6 m-0">
              {/* Color */}
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                  Primary Color
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all',
                        primaryColor === color.value && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-700"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-slate-800 border-slate-700 font-mono text-sm"
                  />
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Position */}
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                  Position
                </Label>
                <Select value={position} onValueChange={(v) => setPosition(v as typeof position)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-slate-800" />

              {/* Welcome Message */}
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                  Welcome Message
                </Label>
                <Input
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Hi! How can we help?"
                />
              </div>

              <Separator className="bg-slate-800" />

              {/* Theme */}
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                  Preview Theme
                </Label>
                <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
                  <Button
                    variant={previewTheme === 'light' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewTheme('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={previewTheme === 'dark' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewTheme('dark')}
                  >
                    Dark
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Options */}
              <div className="space-y-4">
                <Label className="text-xs text-slate-400 uppercase tracking-wider block">
                  Options
                </Label>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Branding</Label>
                  <Switch checked={showBranding} onCheckedChange={setShowBranding} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto Open (3s delay)</Label>
                  <Switch checked={autoOpen} onCheckedChange={setAutoOpen} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="flex-1 p-4 space-y-4 m-0">
              <p className="text-sm text-slate-400 mb-4">
                Run predefined test scenarios to verify widget behavior.
              </p>
              {testScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenario(scenario.id)}
                  className={cn(
                    'w-full p-4 rounded-lg text-left transition-all border',
                    activeScenario === scenario.id
                      ? 'bg-violet-500/20 border-violet-500/50'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    {activeScenario === scenario.id && (
                      <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">Running</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{scenario.description}</p>
                </button>
              ))}
              <Button
                variant="outline"
                className="w-full border-slate-700"
                onClick={() => setActiveScenario(null)}
                disabled={!activeScenario}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Scenario
              </Button>
            </TabsContent>

            <TabsContent value="code" className="flex-1 p-4 m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">
                    Embed Code
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-7"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {embedCode}
                </pre>
                <p className="text-xs text-slate-500">
                  Add this code to your website&apos;s HTML, just before the closing &lt;/body&gt; tag.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Preview Header */}
          <div className="shrink-0 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-700"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Activity className="w-3 h-3" />
                3 Active Sessions
              </Badge>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background Pattern */}
            <div
              className={cn(
                'absolute inset-0',
                previewTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
              )}
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Simulated Page Content */}
            <div className="absolute inset-0 p-8 overflow-auto">
              <div className={cn(
                'max-w-2xl mx-auto rounded-xl p-8',
                previewTheme === 'dark' ? 'bg-slate-800/50 text-white' : 'bg-white text-slate-900 shadow-lg'
              )}>
                <h1 className="text-2xl font-bold mb-4">Sample Website Content</h1>
                <p className={previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  This simulates how your chat widget will appear on a customer&apos;s website.
                  The widget will float in the corner and visitors can click to start a conversation.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className={cn(
                    'p-4 rounded-lg',
                    previewTheme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Bot className="w-8 h-8 mb-2" style={{ color: primaryColor }} />
                    <h3 className="font-medium mb-1">AI-Powered</h3>
                    <p className={cn('text-sm', previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      Instant responses powered by AI
                    </p>
                  </div>
                  <div className={cn(
                    'p-4 rounded-lg',
                    previewTheme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Clock className="w-8 h-8 mb-2" style={{ color: primaryColor }} />
                    <h3 className="font-medium mb-1">24/7 Available</h3>
                    <p className={cn('text-sm', previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      Always ready to help
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Widget */}
            <ChatWidgetEmbed
              theme={previewTheme}
              position={position}
              primaryColor={primaryColor}
              welcomeMessage={welcomeMessage}
            />
          </div>

          {/* Stats Bar */}
          <div className="shrink-0 px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400">Widget loaded in 45ms</span>
              </div>
              <div className="text-xs text-slate-500">
                Session: <span className="font-mono text-slate-400">sess_abc123</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                <span className="font-medium text-emerald-400">12</span> messages
              </span>
              <span className="text-slate-400">
                <span className="font-medium text-blue-400">1.2s</span> avg response
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
