'use client';

/**
 * QR Code Channel Management Page
 * Manage QR codes for offline-to-online lead capture
 * Provides campaign management, bulk generation, and analytics
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Plus,
  Download,
  BarChart3,
  Scan,
  TrendingUp,
  Calendar,
  MapPin,
  Smartphone,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { QRCodeGenerator } from '@/components/forms/QRCodeGenerator';
import { channelsService } from '@/services/api/channels.service';
import { channelInsightsService } from '@/services/api/channel-insights.service';
import { formsService } from '@/services/api/forms.service';

interface QRCampaign {
  id: string;
  name: string;
  formId?: string;
  formName?: string;
  widgetKey?: string;
  scans: number;
  conversions: number;
  lastScan?: string;
  createdAt: string;
}

interface ScanAnalytics {
  totalScans: number;
  uniqueScans: number;
  conversions: number;
  conversionRate: number;
  topLocations: Array<{ city: string; count: number }>;
  deviceBreakdown: { mobile: number; tablet: number; desktop: number };
  scansByDay: Array<{ date: string; count: number }>;
}

export default function QRCodeChannelPage() {
  useRouter(); // Navigation hook available for future use
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([]);
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [forms, setForms] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Load channel data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load forms for QR generation
      const formsData = await formsService.getForms();
      setForms((formsData.items || []).map((f: { id: string; name: string; slug: string }) => ({
        id: f.id,
        name: f.name,
        slug: f.slug
      })));

      // Load QRCode channels
      const qrChannels = await channelsService.getChannelsByType('QRCode');

      if (qrChannels.length > 0) {
        // Get health insights for the first QRCode channel (or aggregate if multiple)
        const channelHealth = await channelInsightsService.getChannelHealth();
        const qrHealth = channelHealth.insights?.find(i => i.channelType === 'QRCode');

        if (qrHealth) {
          // Map generic channel metrics to QRCode-specific analytics
          // TotalMessages = Total scans
          // ConversionRate = Scan-to-conversion rate
          const totalScans = qrHealth.metrics.totalMessages || 0;
          const conversionRate = qrHealth.metrics.conversionRate || 0;
          setAnalytics({
            totalScans: totalScans,
            uniqueScans: totalScans, // Real unique tracking requires dedicated API
            conversions: Math.floor(totalScans * conversionRate),
            conversionRate: conversionRate * 100,
            // Location/device breakdown requires dedicated QR Analytics API
            topLocations: [],
            deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
            scansByDay: [],
          });
        }
      } else {
        // No QRCode channels yet, use empty state
        setAnalytics({
          totalScans: 0,
          uniqueScans: 0,
          conversions: 0,
          conversionRate: 0,
          topLocations: [],
          deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
          scansByDay: [],
        });
      }

      // Load QR campaigns - using forms as campaign proxies for now
      // Real per-campaign scan data requires QR Campaign Analytics API
      const campaignsData = formsData.items?.slice(0, 5).map((form: { id: string; name: string; createdAt?: string; updatedAt?: string }) => ({
        id: form.id,
        name: form.name,
        formId: form.id,
        formName: form.name,
        scans: 0, // Real data requires QR Campaign Analytics API
        conversions: 0,
        lastScan: form.updatedAt || form.createdAt || undefined,
        createdAt: form.createdAt || new Date().toISOString(),
      })) || [];

      setCampaigns(campaignsData);

    } catch (error) {
      console.error('Failed to load QR code data:', error);
      toast.error('Failed to load QR code data');
      // Set empty state on error
      setAnalytics({
        totalScans: 0,
        uniqueScans: 0,
        conversions: 0,
        conversionRate: 0,
        topLocations: [],
        deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
        scansByDay: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setShowGenerator(true);
  };

  const handleBulkGenerate = () => {
    toast.info('Bulk QR generation coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <QrCode className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">QR Code Channel</h1>
                <p className="text-sm text-muted-foreground">
                  Offline-to-online lead capture and tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBulkGenerate}>
                <Download className="size-4 mr-2" />
                Bulk Generate
              </Button>
              <Button onClick={handleCreateCampaign} className="gradient-primary text-white">
                <Plus className="size-4 mr-2" />
                Create QR Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {analytics && (
        <div className="border-b bg-card/30">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Scans</p>
                    <p className="text-2xl font-bold">{analytics.totalScans.toLocaleString()}</p>
                  </div>
                  <Scan className="size-8 text-blue-500 opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Scans</p>
                    <p className="text-2xl font-bold">{analytics.uniqueScans.toLocaleString()}</p>
                  </div>
                  <Eye className="size-8 text-violet-500 opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold">{analytics.conversions}</p>
                  </div>
                  <TrendingUp className="size-8 text-emerald-500 opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                  </div>
                  <BarChart3 className="size-8 text-orange-500 opacity-20" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Scans */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Scan Activity</h3>
                    <Calendar className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {analytics?.scansByDay.slice(-5).reverse().map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-orange-500"
                              style={{ width: `${(day.count / 100) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Locations */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Top Locations</h3>
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {analytics?.topLocations.map((location, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{location.city}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                              style={{ width: `${(location.count / 200) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {location.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Device Breakdown */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Device Types</h3>
                    <Smartphone className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile</span>
                      <span className="text-sm font-medium">
                        {analytics?.deviceBreakdown.mobile} ({((analytics?.deviceBreakdown.mobile ?? 0) / (analytics?.totalScans ?? 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tablet</span>
                      <span className="text-sm font-medium">
                        {analytics?.deviceBreakdown.tablet} ({((analytics?.deviceBreakdown.tablet ?? 0) / (analytics?.totalScans ?? 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop</span>
                      <span className="text-sm font-medium">
                        {analytics?.deviceBreakdown.desktop} ({((analytics?.deviceBreakdown.desktop ?? 0) / (analytics?.totalScans ?? 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateCampaign}>
                      <Plus className="size-4 mr-2" />
                      Create New Campaign
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleBulkGenerate}>
                      <Download className="size-4 mr-2" />
                      Download All QR Codes
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('analytics')}>
                      <BarChart3 className="size-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              {campaigns.length === 0 ? (
                <Card className="p-12 text-center">
                  <QrCode className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No QR Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first QR code campaign to start tracking offline engagement
                  </p>
                  <Button onClick={handleCreateCampaign}>
                    <Plus className="size-4 mr-2" />
                    Create Campaign
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500 to-orange-500">
                            <QrCode className="size-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {campaign.formName && `Form: ${campaign.formName}`}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                              {campaign.lastScan && (
                                <span>Last scan {new Date(campaign.lastScan).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-center">
                          <div>
                            <p className="text-2xl font-bold text-violet-600">{campaign.scans}</p>
                            <p className="text-xs text-muted-foreground">Scans</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-600">{campaign.conversions}</p>
                            <p className="text-xs text-muted-foreground">Conversions</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-600">
                              {((campaign.conversions / campaign.scans) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Rate</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="size-5 text-blue-500" />
                  <h3 className="font-semibold">Detailed Analytics</h3>
                </div>
                <p className="text-muted-foreground">
                  Comprehensive analytics dashboard coming soon. This will include:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Time-series scan trends with hourly/daily/weekly/monthly views</li>
                  <li>• Heatmaps showing scan locations on a map</li>
                  <li>• Device and browser breakdowns</li>
                  <li>• Conversion funnel analysis</li>
                  <li>• A/B testing between different QR designs</li>
                  <li>• Export analytics data (CSV, PDF)</li>
                </ul>
              </Card>
            </TabsContent>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-6">
              {!showGenerator ? (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Generate QR Code</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Form</Label>
                      <Select value={selectedForm} onValueChange={setSelectedForm}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a form" />
                        </SelectTrigger>
                        <SelectContent>
                          {forms.map((form) => (
                            <SelectItem key={form.id} value={form.id}>
                              {form.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        if (!selectedForm) {
                          toast.error('Please select a form');
                          return;
                        }
                        setShowGenerator(true);
                      }}
                      className="w-full"
                    >
                      Generate QR Code
                    </Button>
                  </div>
                </Card>
              ) : (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGenerator(false)}
                    className="mb-4"
                  >
                    ← Back to Form Selection
                  </Button>
                  {selectedForm && forms.find(f => f.id === selectedForm) && (
                    <QRCodeGenerator
                      formId={selectedForm}
                      formName={forms.find(f => f.id === selectedForm)?.name || ''}
                      formSlug={forms.find(f => f.id === selectedForm)?.slug || ''}
                    />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
