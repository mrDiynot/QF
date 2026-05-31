/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * QR Code Tester Page
 * Generate and test QR codes for forms and chat widgets
 * Note: Uses <img> for dynamically generated QR code images
 */

import { useState } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Smartphone,
  Link2,
  FileText,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const qrTargets = [
  { id: 'form-contact', type: 'form', name: 'Contact Us Form', slug: 'contact-us' },
  { id: 'form-demo', type: 'form', name: 'Demo Request Form', slug: 'demo-request' },
  { id: 'chat-main', type: 'chat', name: 'Main Chat Widget', key: 'main-widget' },
  { id: 'chat-support', type: 'chat', name: 'Support Widget', key: 'support-widget' },
];

const colorPresets = [
  { name: 'Black', fg: '#000000', bg: '#ffffff' },
  { name: 'Violet', fg: '#8b5cf6', bg: '#ffffff' },
  { name: 'Blue', fg: '#3b82f6', bg: '#ffffff' },
  { name: 'Green', fg: '#10b981', bg: '#ffffff' },
  { name: 'Dark', fg: '#ffffff', bg: '#1e293b' },
  { name: 'Brand', fg: '#8b5cf6', bg: '#faf5ff' },
];

export default function QRCodeTesterPage() {
  const [selectedTarget, setSelectedTarget] = useState(qrTargets[0]);
  const [qrSize, setQrSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [utmSource, setUtmSource] = useState('qr_code');
  const [utmMedium, setUtmMedium] = useState('offline');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const baseUrl = 'https://app.qualiflow.ai';
  const targetPath = selectedTarget.type === 'form' 
    ? `/forms/${selectedTarget.slug}`
    : `/chat/${selectedTarget.key}`;
  
  const utmParams = new URLSearchParams();
  if (utmSource) utmParams.set('utm_source', utmSource);
  if (utmMedium) utmParams.set('utm_medium', utmMedium);
  if (utmCampaign) utmParams.set('utm_campaign', utmCampaign);
  
  const fullUrl = `${baseUrl}${targetPath}${utmParams.toString() ? '?' + utmParams.toString() : ''}`;

  // Generate QR code URL using a QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(fullUrl)}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${selectedTarget.id}-${qrSize}px.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">QR Code Generator</h1>
                <p className="text-xs text-slate-400">Generate and test QR codes for forms and widgets</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Target Selection */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                QR Code Target
              </Label>
              <div className="space-y-2">
                {qrTargets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all border flex items-center gap-3',
                      selectedTarget.id === target.id
                        ? 'bg-orange-500/20 border-orange-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    {target.type === 'form' ? (
                      <FileText className={cn(
                        'w-5 h-5',
                        selectedTarget.id === target.id ? 'text-orange-400' : 'text-slate-400'
                      )} />
                    ) : (
                      <MessageSquare className={cn(
                        'w-5 h-5',
                        selectedTarget.id === target.id ? 'text-orange-400' : 'text-slate-400'
                      )} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{target.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{target.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Appearance */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Appearance
              </Label>
              
              {/* Color Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all',
                      fgColor === preset.fg && bgColor === preset.bg
                        ? 'border-orange-500'
                        : 'border-transparent hover:border-slate-600'
                    )}
                    style={{ 
                      background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)` 
                    }}
                    title={preset.name}
                  />
                ))}
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Foreground</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-700"
                      style={{ backgroundColor: fgColor }}
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="bg-slate-800 border-slate-700 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Background</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-700"
                      style={{ backgroundColor: bgColor }}
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="bg-slate-800 border-slate-700 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-500">Size</Label>
                  <span className="text-xs text-slate-400">{qrSize}px</span>
                </div>
                <Slider
                  value={[qrSize]}
                  onValueChange={([v]) => setQrSize(v)}
                  min={128}
                  max={512}
                  step={32}
                  className="w-full"
                />
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* UTM Parameters */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                UTM Tracking
              </Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Source</Label>
                  <Input
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="qr_code"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Medium</Label>
                  <Input
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="offline"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Campaign</Label>
                  <Input
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="summer_promo"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* QR Code Preview */}
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              {/* QR Code */}
              <div
                className="inline-block rounded-2xl p-6 shadow-2xl"
                style={{ backgroundColor: bgColor }}
              >
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={qrSize}
                  height={qrSize}
                  className="rounded-lg"
                />
              </div>

              {/* URL */}
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-300 truncate font-mono">
                    {fullUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 shrink-0"
                    onClick={handleCopyUrl}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  className="border-slate-700"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700"
                  onClick={() => setShowMobilePreview(true)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Test Scan
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700"
                  onClick={() => window.open(fullUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open URL
                </Button>
              </div>

              {/* Info */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-2xl font-bold text-orange-400">{qrSize}</p>
                  <p className="text-xs text-slate-500">Pixels</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-2xl font-bold text-blue-400">{fullUrl.length}</p>
                  <p className="text-xs text-slate-500">Characters</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-2xl font-bold text-emerald-400">L</p>
                  <p className="text-xs text-slate-500">Error Correction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview Modal */}
          {showMobilePreview && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-slate-900 rounded-2xl p-6 max-w-sm text-center">
                <div className="w-64 h-[500px] mx-auto rounded-[2rem] border-4 border-slate-700 bg-slate-800 overflow-hidden relative">
                  <div className="absolute inset-0 flex flex-col">
                    {/* Phone Status Bar */}
                    <div className="h-6 bg-slate-900 flex items-center justify-center">
                      <div className="w-20 h-4 bg-slate-800 rounded-full" />
                    </div>
                    {/* Camera View Simulation */}
                    <div className="flex-1 bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center relative">
                      <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
                      <div className="w-32 h-32 border-4 border-orange-500 rounded-xl animate-pulse" />
                      <p className="absolute bottom-8 text-white text-sm">Point camera at QR code</p>
                    </div>
                  </div>
                </div>
                <Button
                  className="mt-6"
                  onClick={() => setShowMobilePreview(false)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
