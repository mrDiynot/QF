'use client';

/**
 * WebForm Channel Management Page
 * Manage web forms for lead capture and customer engagement
 * Provides form analytics, A/B testing, and campaign tracking
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Code,
  BarChart3,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { formsService } from '@/services/api/forms.service';
import { EmbedCodeDialog } from '@/components/forms/EmbedCodeDialog';
import { channelInsightsService } from '@/services/api/channel-insights.service';

interface FormAnalytics {
  formId: string;
  views: number;
  submissions: number;
  completionRate: number;
  avgCompletionTime: number;
  lastSubmission?: string;
}

interface ABTest {
  id: string;
  name: string;
  variantA: { formId: string; name: string; conversions: number };
  variantB: { formId: string; name: string; conversions: number };
  status: 'active' | 'completed' | 'paused';
  startedAt: string;
  winner?: 'A' | 'B';
}

export default function WebFormChannelPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [selectedForm, _setSelectedForm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load forms
  const { data: formsData, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => formsService.getForms(),
  });

  const forms = useMemo(() => formsData?.items || [], [formsData?.items]);

  // Mock analytics data (would come from real API)
  const [analytics, setAnalytics] = useState<Record<string, FormAnalytics>>({});
  const [abTests, setAbTests] = useState<ABTest[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (forms.length > 0) {
        try {
          // Get WebForm channel health from analytics API
          const channelHealth = await channelInsightsService.getChannelHealth();
          const webFormHealth = channelHealth.insights?.find(i => i.channelType === 'WebForm');

          // Use real channel health data if available
          const formAnalytics: Record<string, FormAnalytics> = {};
          const totalMessages = webFormHealth?.metrics.totalMessages || 0;
          const avgPerForm = forms.length > 0 ? Math.floor(totalMessages / forms.length) : 0;
          const channelConversionRate = webFormHealth?.metrics.conversionRate || 0;
          const channelAvgResponseTime = webFormHealth?.metrics.avgResponseTime || 0;

          forms.forEach((form) => {
            // Distribute evenly across forms (real per-form analytics requires Form Analytics API)
            const submissions = avgPerForm;
            const views = channelConversionRate > 0 ? Math.floor(submissions / channelConversionRate) : 0;

            formAnalytics[form.id] = {
              formId: form.id,
              views: views,
              submissions: submissions,
              completionRate: channelConversionRate * 100,
              avgCompletionTime: channelAvgResponseTime,
              lastSubmission: form.updatedAt || form.createdAt || undefined,
            };
          });

          setAnalytics(formAnalytics);

          // A/B tests require dedicated API - show empty until implemented
          setAbTests([]);
        } catch (error) {
          console.error('Failed to load form analytics:', error);
          // Show zeros on error instead of fake data
          const fallbackAnalytics: Record<string, FormAnalytics> = {};
          forms.forEach((form) => {
            fallbackAnalytics[form.id] = {
              formId: form.id,
              views: 0,
              submissions: 0,
              completionRate: 0,
              avgCompletionTime: 0,
              lastSubmission: form.updatedAt || form.createdAt || undefined,
            };
          });
          setAnalytics(fallbackAnalytics);
        }
      }
    };

    loadAnalytics();
  }, [forms]);

  const handleCopyEmbedCode = (formId: string) => {
    const embedCode = `<script src="${window.location.origin}/embed.js" data-form-id="${formId}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedId(formId);
    toast.success('Embed code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateForm = () => {
    router.push('/forms/builder');
  };

  const handleEditForm = (formId: string) => {
    router.push(`/forms/builder?id=${formId}`);
  };

  const handleViewSubmissions = (formId: string) => {
    router.push(`/forms/${formId}/submissions`);
  };

  const totalViews = Object.values(analytics).reduce((sum, a) => sum + a.views, 0);
  const totalSubmissions = Object.values(analytics).reduce((sum, a) => sum + a.submissions, 0);
  const avgCompletionRate = forms.length > 0
    ? Object.values(analytics).reduce((sum, a) => sum + a.completionRate, 0) / forms.length
    : 0;

  if (isLoading) {
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                <FileText className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Web Forms Channel</h1>
                <p className="text-sm text-muted-foreground">
                  Lead capture and customer engagement forms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/forms')}>
                <Settings className="size-4 mr-2" />
                Manage All Forms
              </Button>
              <Button onClick={handleCreateForm} className="gradient-primary text-white">
                <Plus className="size-4 mr-2" />
                Create Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                  <p className="text-2xl font-bold">{forms.length}</p>
                </div>
                <FileText className="size-8 text-blue-500 opacity-20" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="size-8 text-violet-500 opacity-20" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
                <Users className="size-8 text-emerald-500 opacity-20" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="size-8 text-orange-500 opacity-20" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Performing Forms */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Top Performing Forms</h3>
                    <TrendingUp className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {forms.slice(0, 5).map((form) => {
                      const formAnalytics = analytics[form.id];
                      if (!formAnalytics) return null;
                      return (
                        <div key={form.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{form.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formAnalytics.submissions} submissions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-violet-600">
                              {formAnalytics.completionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">completion</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <Clock className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {forms
                      .filter((f) => analytics[f.id]?.lastSubmission)
                      .sort((a, b) => {
                        const aTime = new Date(analytics[a.id]?.lastSubmission || 0).getTime();
                        const bTime = new Date(analytics[b.id]?.lastSubmission || 0).getTime();
                        return bTime - aTime;
                      })
                      .slice(0, 5)
                      .map((form) => {
                        const formAnalytics = analytics[form.id];
                        return (
                          <div key={form.id} className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <CheckCircle2 className="size-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{form.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Submitted{' '}
                                {formAnalytics?.lastSubmission
                                  ? new Date(formAnalytics.lastSubmission).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms" className="space-y-4">
              {forms.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Forms Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first web form to start capturing leads
                  </p>
                  <Button onClick={handleCreateForm}>
                    <Plus className="size-4 mr-2" />
                    Create Form
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {forms.map((form) => {
                    const formAnalytics = analytics[form.id];
                    return (
                      <Card key={form.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                              <FileText className="size-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{form.name}</h3>
                                <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                                  {form.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {form.description || 'No description'}
                              </p>
                              {formAnalytics && (
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Views</p>
                                    <p className="font-semibold">{formAnalytics.views}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Submissions</p>
                                    <p className="font-semibold">{formAnalytics.submissions}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Completion</p>
                                    <p className="font-semibold">
                                      {formAnalytics.completionRate.toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Avg Time</p>
                                    <p className="font-semibold">
                                      {Math.floor(formAnalytics.avgCompletionTime / 60)}m{' '}
                                      {formAnalytics.avgCompletionTime % 60}s
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmissions(form.id)}
                            >
                              <Eye className="size-4 mr-2" />
                              View Submissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyEmbedCode(form.id)}
                            >
                              {copiedId === form.id ? (
                                <Check className="size-4 mr-2" />
                              ) : (
                                <Code className="size-4 mr-2" />
                              )}
                              Embed Code
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditForm(form.id)}>
                              <Settings className="size-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* A/B Testing Tab */}
            <TabsContent value="ab-testing" className="space-y-4">
              {abTests.length === 0 ? (
                <Card className="p-12 text-center">
                  <BarChart3 className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No A/B Tests Running</h3>
                  <p className="text-muted-foreground mb-4">
                    Create A/B tests to optimize your form conversion rates
                  </p>
                  <Button onClick={() => toast.info('A/B test creation coming soon')}>
                    <Plus className="size-4 mr-2" />
                    Create A/B Test
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {abTests.map((test) => (
                    <Card key={test.id} className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{test.name}</h3>
                            <Badge
                              variant={
                                test.status === 'active'
                                  ? 'default'
                                  : test.status === 'completed'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {test.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Started {new Date(test.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {test.winner && (
                          <Badge className="bg-emerald-500">Winner: Variant {test.winner}</Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Variant A */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Variant A</h4>
                            <span className="text-2xl font-bold text-blue-600">
                              {test.variantA.conversions}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.variantA.name}</p>
                          <Progress
                            value={
                              (test.variantA.conversions /
                                (test.variantA.conversions + test.variantB.conversions)) *
                              100
                            }
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {(
                              (test.variantA.conversions /
                                (test.variantA.conversions + test.variantB.conversions)) *
                              100
                            ).toFixed(1)}
                            % conversion rate
                          </p>
                        </div>

                        {/* Variant B */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Variant B</h4>
                            <span className="text-2xl font-bold text-violet-600">
                              {test.variantB.conversions}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.variantB.name}</p>
                          <Progress
                            value={
                              (test.variantB.conversions /
                                (test.variantA.conversions + test.variantB.conversions)) *
                              100
                            }
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {(
                              (test.variantB.conversions /
                                (test.variantA.conversions + test.variantB.conversions)) *
                              100
                            ).toFixed(1)}
                            % conversion rate
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {test.status === 'active' && (
                          <>
                            <Button variant="outline" size="sm">
                              Pause Test
                            </Button>
                            <Button variant="outline" size="sm">
                              End Test
                            </Button>
                          </>
                        )}
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
                  <h3 className="font-semibold">Detailed Form Analytics</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics dashboard coming soon. This will include:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Field-level drop-off analysis (which fields cause abandonment)</li>
                  <li>• Time-to-complete trends by form and field</li>
                  <li>• Geographic distribution of submissions</li>
                  <li>• Device and browser breakdown</li>
                  <li>• Conversion funnel visualization</li>
                  <li>• Form performance comparison</li>
                  <li>• Export analytics data (CSV, PDF)</li>
                  <li>• Custom date range filtering</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Embed Dialog */}
      {showEmbedDialog && selectedForm && (
        <EmbedCodeDialog
          open={showEmbedDialog}
          onOpenChange={setShowEmbedDialog}
          formId={selectedForm}
          formSlug={forms.find((f) => f.id === selectedForm)?.slug || ''}
        />
      )}
    </div>
  );
}
