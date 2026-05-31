'use client';

/**
 * Website Simulator
 * Simulates customer websites with embedded widgets and forms
 *
 * Uses dynamic imports for heavy components to reduce initial bundle size.
 */

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  RefreshCw,
  Code,
  Maximize2,
  Copy,
  Check,
  Globe,
  Layout,
  ShoppingCart,
  FileText,
  Home,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SimulatorLoadingSkeleton } from '@/components/simulator';
import { DeviceFrame } from '@/components/simulator/DeviceFrame';

// Lazy load heavy components
const WebsiteTemplate = dynamic(
  () => import('@/components/simulator/WebsiteTemplate').then(mod => ({ default: mod.WebsiteTemplate })),
  {
    loading: () => <SimulatorLoadingSkeleton message="Loading website template..." height="h-[500px]" />,
    ssr: false,
  }
);

const NetworkInspector = dynamic(
  () => import('@/components/simulator/NetworkInspector').then(mod => ({ default: mod.NetworkInspector })),
  {
    loading: () => <SimulatorLoadingSkeleton message="Loading network inspector..." height="h-64" />,
    ssr: false,
  }
);

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeMode = 'light' | 'dark';

const websiteTemplates = [
  { id: 'landing', name: 'Landing Page', icon: Home, description: 'Modern SaaS landing page' },
  { id: 'corporate', name: 'Corporate', icon: Building2, description: 'Professional business site' },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingCart, description: 'Product showcase page' },
  { id: 'contact', name: 'Contact Page', icon: FileText, description: 'Contact & support page' },
  { id: 'services', name: 'Services', icon: Briefcase, description: 'Service offerings page' },
  { id: 'blog', name: 'Blog Article', icon: Layout, description: 'Blog post layout' },
];

export default function WebsiteSimulatorPage() {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [template, setTemplate] = useState('landing');
  const [url, setUrl] = useState('https://customer-site.com');
  const [widgetEnabled] = useState(true);
  const [formEnabled] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const handleRefresh = useCallback(() => {
    // Trigger refresh of the preview
    setTemplate((t) => t);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold">Website Simulator</h1>
                  <p className="text-xs text-slate-400">Test widgets on simulated websites</p>
                </div>
              </div>
            </div>

            {/* Device Controls */}
            <div className="flex items-center gap-2">
              {/* URL Bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                <Globe className="w-4 h-4 text-slate-400" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-64 h-7 bg-transparent border-0 p-0 text-sm focus-visible:ring-0"
                  placeholder="https://customer-site.com"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 bg-slate-700" />

              {/* Device Selector */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1">
                <Button
                  variant={device === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={device === 'tablet' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setDevice('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-700"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Actions */}
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-700"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-700"
                onClick={() => setShowInspector(!showInspector)}
              >
                <Code className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-700"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Template Selector */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Page Template
              </Label>
              <div className="space-y-2">
                {websiteTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                      template === t.id
                        ? 'bg-violet-500/20 border border-violet-500/50'
                        : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      template === t.id ? 'bg-violet-500/30' : 'bg-slate-700/50'
                    )}>
                      <t.icon className={cn(
                        'w-4 h-4',
                        template === t.id ? 'text-violet-400' : 'text-slate-400'
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        'font-medium text-sm',
                        template === t.id ? 'text-violet-300' : 'text-slate-300'
                      )}>
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Embed Settings */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Embedded Components
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">Chat Widget</span>
                  </div>
                  <Badge variant={widgetEnabled ? 'default' : 'secondary'} className="text-xs">
                    {widgetEnabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Lead Form</span>
                  </div>
                  <Badge variant={formEnabled ? 'default' : 'secondary'} className="text-xs">
                    {formEnabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Widget Config */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Widget Configuration
              </Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Widget Key</Label>
                  <Select defaultValue="main-widget">
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-widget">Main Website Widget</SelectItem>
                      <SelectItem value="support-widget">Support Widget</SelectItem>
                      <SelectItem value="sales-widget">Sales Widget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Position</Label>
                  <Select defaultValue="bottom-right">
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Preview */}
          <div className={cn(
            'flex-1 flex items-center justify-center p-6 overflow-auto',
            !isFullscreen && showInspector && 'pb-0'
          )}>
            <DeviceFrame device={device} theme={theme}>
              <WebsiteTemplate
                template={template}
                theme={theme}
                widgetEnabled={widgetEnabled}
                formEnabled={formEnabled}
              />
            </DeviceFrame>
          </div>

          {/* Network Inspector */}
          {showInspector && !isFullscreen && (
            <div className="h-64 border-t border-slate-800">
              <NetworkInspector />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
