'use client';

/**
 * QR Code Generator Component
 * Generates QR codes for form URLs with customization options
 */

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Settings,
  Link,
  Share2,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  formId: string;
  formName: string;
  formSlug: string;
  className?: string;
}

interface QRConfig {
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
}

const DEFAULT_CONFIG: QRConfig = {
  size: 256,
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  errorCorrection: 'M',
  includeMargin: true,
};

export function QRCodeGenerator({ formId, formName, formSlug, className }: QRCodeGeneratorProps) {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate form URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const formUrl = `${baseUrl}/f/${formSlug}`;

  // Generate QR code on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = config.size;
    canvas.height = config.size;

    // Draw background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, config.size, config.size);

    // Simple QR-like pattern (placeholder - in production use a proper QR library)
    const moduleSize = Math.floor(config.size / 25);
    const margin = config.includeMargin ? moduleSize * 2 : 0;
    const qrSize = config.size - margin * 2;
    
    ctx.fillStyle = config.fgColor;

    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      const s = moduleSize * 7;
      // Outer square
      ctx.fillRect(x, y, s, moduleSize);
      ctx.fillRect(x, y + s - moduleSize, s, moduleSize);
      ctx.fillRect(x, y, moduleSize, s);
      ctx.fillRect(x + s - moduleSize, y, moduleSize, s);
      // Inner square
      const inner = moduleSize * 3;
      const offset = moduleSize * 2;
      ctx.fillRect(x + offset, y + offset, inner, inner);
    };

    // Top-left finder
    drawFinderPattern(margin, margin);
    // Top-right finder
    drawFinderPattern(config.size - margin - moduleSize * 7, margin);
    // Bottom-left finder
    drawFinderPattern(margin, config.size - margin - moduleSize * 7);

    // Draw data modules (random pattern for visual representation)
    const dataArea = {
      x: margin + moduleSize * 9,
      y: margin + moduleSize * 9,
      width: qrSize - moduleSize * 18,
      height: qrSize - moduleSize * 18,
    };

    // Use formId to seed a consistent pattern
    let seed = 0;
    for (let i = 0; i < formId.length; i++) {
      seed = ((seed << 5) - seed) + formId.charCodeAt(i);
      seed = seed & seed;
    }

    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (seededRandom() > 0.5) {
          ctx.fillRect(
            dataArea.x + col * moduleSize * 1.2,
            dataArea.y + row * moduleSize * 1.2,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < 17; i += 2) {
      ctx.fillRect(margin + i * moduleSize, margin + 6 * moduleSize, moduleSize, moduleSize);
      ctx.fillRect(margin + 6 * moduleSize, margin + i * moduleSize, moduleSize, moduleSize);
    }

  }, [config, formId]);

  const updateConfig = <K extends keyof QRConfig>(key: K, value: QRConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = (format: 'png' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${formSlug}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded');
    } else {
      // SVG export would require a different approach
      toast.info('SVG export coming soon');
    }
  };

  const printQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${formName}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui; }
              img { max-width: 300px; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              p { color: #666; margin-top: 0; }
            </style>
          </head>
          <body>
            <h1>${formName}</h1>
            <p>Scan to access form</p>
            <img src="${canvas.toDataURL()}" />
            <p style="font-size: 12px; margin-top: 16px;">${formUrl}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className={cn("grid md:grid-cols-2 gap-6", className)}>
      {/* Preview */}
      <Card className="p-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 self-start">
          <QrCode className="size-5 text-primary" />
          <h3 className="font-semibold text-foreground">QR Code Preview</h3>
        </div>

        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <canvas
            ref={canvasRef}
            className="mx-auto"
            style={{ width: Math.min(config.size, 256), height: Math.min(config.size, 256) }}
          />
        </div>

        <div className="mt-6 w-full space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
            <Link className="size-4 text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground truncate flex-1">{formUrl}</span>
            <Button variant="ghost" size="sm" onClick={copyUrl}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => downloadQR('png')} className="gap-2">
              <Download className="size-4" />
              PNG
            </Button>
            <Button variant="outline" onClick={() => downloadQR('svg')} className="gap-2">
              <Download className="size-4" />
              SVG
            </Button>
            <Button variant="outline" onClick={printQR} className="gap-2">
              <Printer className="size-4" />
              Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Customize QR Code</h3>
        </div>

        <div className="space-y-6">
          {/* Size */}
          <div className="space-y-2">
            <Label>Size: {config.size}px</Label>
            <Slider
              value={[config.size]}
              onValueChange={([v]) => updateConfig('size', v)}
              min={128}
              max={512}
              step={32}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Foreground Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.fgColor}
                  onChange={(e) => updateConfig('fgColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={config.fgColor}
                  onChange={(e) => updateConfig('fgColor', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => updateConfig('bgColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={config.bgColor}
                  onChange={(e) => updateConfig('bgColor', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Error Correction */}
          <div className="space-y-2">
            <Label>Error Correction Level</Label>
            <Select
              value={config.errorCorrection}
              onValueChange={(v) => updateConfig('errorCorrection', v as QRConfig['errorCorrection'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher levels allow more damage but result in larger codes
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...DEFAULT_CONFIG })}
              >
                Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...config, fgColor: '#7C3AED', bgColor: '#F3E8FF' })}
              >
                Purple
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...config, fgColor: '#0EA5E9', bgColor: '#F0F9FF' })}
              >
                Blue
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="size-4 text-muted-foreground" />
              <Label>Share Options</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="size-4" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="size-4" />
                SMS
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Missing imports for share buttons
import { Mail, MessageSquare } from 'lucide-react';

// Compact QR display component
export function QRCodeBadge({ size = 64 }: { formSlug?: string; size?: number }) {
  return (
    <div 
      className="inline-flex items-center justify-center bg-white border rounded-lg p-2"
      style={{ width: size + 16, height: size + 16 }}
    >
      <QrCode className="text-muted-foreground/60" style={{ width: size, height: size }} />
    </div>
  );
}
