'use client';

/**
 * Lead Source Tracking Configuration Page
 * Configure UTM tracking and source attribution for analytics
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Globe,
  MessageSquare,
  Phone,
  Share2,
  TrendingUp,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UtmSource {
  id: string;
  name: string;
  source: string;
  medium: string;
  enabled: boolean;
}

const DEFAULT_SOURCES: UtmSource[] = [
  { id: '1', name: 'Website Form', source: 'website', medium: 'form', enabled: true },
  { id: '2', name: 'Web Chat Widget', source: 'website', medium: 'chat', enabled: true },
  { id: '3', name: 'QR Code', source: 'qr_code', medium: 'offline', enabled: true },
  { id: '4', name: 'SMS Campaign', source: 'sms', medium: 'direct', enabled: true },
  { id: '5', name: 'WhatsApp', source: 'whatsapp', medium: 'messaging', enabled: false },
  { id: '6', name: 'Instagram', source: 'instagram', medium: 'social', enabled: false },
  { id: '7', name: 'Facebook', source: 'facebook', medium: 'social', enabled: false },
  { id: '8', name: 'Voice Call', source: 'phone', medium: 'voice', enabled: true },
];

export default function SourceTrackingPage() {
  const [sources, setSources] = useState<UtmSource[]>(DEFAULT_SOURCES);
  const [baseUrl, setBaseUrl] = useState('https://qualiflow.ai/form');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggleSource = (id: string) => {
    setSources(prev => 
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
    toast.success('Source tracking updated');
  };

  const generateUtmUrl = (source: UtmSource) => {
    const params = new URLSearchParams({
      utm_source: source.source,
      utm_medium: source.medium,
      ...(selectedCampaign && { utm_campaign: selectedCampaign }),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return <Globe className="size-4" />;
      case 'qr_code': return <QrCode className="size-4" />;
      case 'sms': return <MessageSquare className="size-4" />;
      case 'whatsapp': return <MessageSquare className="size-4" />;
      case 'instagram': return <Share2 className="size-4" />;
      case 'facebook': return <Share2 className="size-4" />;
      case 'phone': return <Phone className="size-4" />;
      default: return <Link2 className="size-4" />;
    }
  };

  const enabledCount = sources.filter(s => s.enabled).length;

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Lead Source Tracking</h1>
        <p className="text-sm text-gray-500">
          Configure UTM parameters and source attribution for lead analytics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Sources</p>
                <p className="text-2xl font-bold text-purple-600">{enabledCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Link2 className="size-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sources</p>
                <p className="text-2xl font-bold text-blue-600">{sources.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Globe className="size-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tracking Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="size-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">UTM Link Builder</CardTitle>
          <CardDescription>
            Generate trackable URLs for your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-form-url.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Campaign Name (optional)</Label>
              <Input
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                placeholder="e.g., spring_promo_2025"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Sources</CardTitle>
          <CardDescription>
            Enable/disable tracking for each lead source and generate UTM links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  source.enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    source.enabled ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {getSourceIcon(source.source)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        source.enabled ? "text-gray-900" : "text-gray-500"
                      )}>
                        {source.name}
                      </span>
                      {source.enabled && (
                        <Badge variant="outline" className="text-xs">
                          {source.source}/{source.medium}
                        </Badge>
                      )}
                    </div>
                    {source.enabled && (
                      <p className="text-xs text-gray-500 font-mono mt-1 truncate max-w-md">
                        {generateUtmUrl(source)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {source.enabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generateUtmUrl(source), source.id)}
                    >
                      {copiedId === source.id ? (
                        <Check className="size-4 text-green-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  )}
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={() => handleToggleSource(source.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">How UTM Tracking Works</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                <li>UTM parameters are added to your URLs to track lead sources</li>
                <li>When a lead submits a form, the source is automatically recorded</li>
                <li>View source attribution in Analytics → Lead Sources</li>
                <li>Use campaign names to track specific marketing efforts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

