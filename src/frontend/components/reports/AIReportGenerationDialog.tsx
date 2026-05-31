'use client';

/**
 * AI Report Generation Dialog
 * Sprint 42 - Story 6.2: Frontend AI Report Builder UI
 * Allows users to generate comprehensive business reports using AI
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, subDays, subMonths } from 'date-fns';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Loader2,
  Target,
  TrendingUp,
  BarChart,
  DollarSign,
  Users,
  Settings,
  Calendar,
  Sparkles,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import aiService from '@/services/api/ai.service';
import type {
  ReportType,
  ReportGenerationRequest,
  ReportGenerationResult,
  ReportInsight,
  ReportSection,
  ReportRecommendation,
} from '@/types/ai-reports';
import { REPORT_TYPES } from '@/types/ai-reports';

interface AIReportGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportGenerated?: (report: ReportGenerationResult) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  TrendingUp,
  BarChart,
  DollarSign,
  Brain,
  Users,
  Settings,
};

const DATE_RANGE_PRESETS = [
  { label: 'Last 7 days', value: '7d', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: '30d', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 months', value: '3m', getDates: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'Last 6 months', value: '6m', getDates: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: 'Last year', value: '1y', getDates: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
];

export function AIReportGenerationDialog({
  open,
  onOpenChange,
  onReportGenerated,
}: AIReportGenerationDialogProps) {
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('LeadPerformance');
  const [dateRangePreset, setDateRangePreset] = useState('30d');
  const [includeTrends, setIncludeTrends] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [generatedReport, setGeneratedReport] = useState<ReportGenerationResult | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (request: ReportGenerationRequest) => {
      return await aiService.generateReport(request);
    },
    onSuccess: (result) => {
      if (result.success) {
        setGeneratedReport(result);
        setActiveTab('preview');
        toast.success('Report generated successfully');
        onReportGenerated?.(result);
      } else {
        toast.error(result.errorMessage || 'Failed to generate report');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });

  const handleGenerate = () => {
    const preset = DATE_RANGE_PRESETS.find(p => p.value === dateRangePreset);
    if (!preset) return;

    const { from, to } = preset.getDates();

    generateMutation.mutate({
      reportType: selectedReportType,
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
      includeTrends,
      includeRecommendations,
    });
  };

  const handleExport = (formatType: 'pdf' | 'markdown') => {
    if (!generatedReport) return;
    // For now, just show a toast - actual export would require backend support
    toast.success(`Exporting report as ${formatType.toUpperCase()}...`);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setActiveTab('configure');
      setGeneratedReport(null);
    }, 300);
  };

  const selectedTypeInfo = REPORT_TYPES.find(t => t.value === selectedReportType);
  const _SelectedIcon = selectedTypeInfo ? ICON_MAP[selectedTypeInfo.icon] || Brain : Brain;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent size="2xl" className="max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            AI Report Generator
          </ModalTitle>
          <ModalDescription>
            Generate comprehensive business reports with AI-powered insights and recommendations
          </ModalDescription>
        </ModalHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'configure' | 'preview')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure Report</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedReport}>
              Preview & Export
            </TabsTrigger>
          </TabsList>

          {/* Configure Tab */}
          <TabsContent value="configure" className="flex-1 space-y-6 mt-4">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Report Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {REPORT_TYPES.map((type) => {
                  const Icon = ICON_MAP[type.icon] || Brain;
                  const isSelected = selectedReportType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedReportType(type.value)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-purple-900/20'
                          : 'border-border hover:border-purple-300 hover:bg-muted/50'
                      )}
                    >
                      <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      <div>
                        <p className={cn('font-medium text-sm', isSelected && 'text-primary dark:text-purple-300')}>
                          {type.label}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="size-4" />
                Date Range
              </Label>
              <Select value={dateRangePreset} onValueChange={setDateRangePreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Options</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trends" className="text-sm">Include Trends</Label>
                  <p className="text-xs text-muted-foreground">Show trend analysis and comparisons</p>
                </div>
                <Switch id="trends" checked={includeTrends} onCheckedChange={setIncludeTrends} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recommendations" className="text-sm">Include Recommendations</Label>
                  <p className="text-xs text-muted-foreground">AI-generated actionable insights</p>
                </div>
                <Switch id="recommendations" checked={includeRecommendations} onCheckedChange={setIncludeRecommendations} />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
            {generatedReport && (
              <div className="flex flex-col h-full">
                {/* Report Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{generatedReport.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {generatedReport.dateRange && (
                        <>
                          {format(new Date(generatedReport.dateRange.from), 'MMM d, yyyy')} -{' '}
                          {format(new Date(generatedReport.dateRange.to), 'MMM d, yyyy')}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('markdown')}>
                      <FileText className="size-4 mr-1" />
                      Markdown
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="size-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Scrollable Report Content */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6 pb-4">
                    {/* Executive Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        Executive Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">{generatedReport.executiveSummary}</p>
                    </div>

                    {/* Key Insights */}
                    {generatedReport.keyInsights.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="size-4 text-primary" />
                          Key Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {generatedReport.keyInsights.map((insight, idx) => (
                            <InsightCard key={idx} insight={insight} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sections */}
                    {generatedReport.sections.map((section, idx) => (
                      <SectionCard key={idx} section={section} />
                    ))}

                    {/* Recommendations */}
                    {generatedReport.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle className="size-4 text-green-600" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {generatedReport.recommendations.map((rec, idx) => (
                            <RecommendationCard key={idx} recommendation={rec} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ModalContent>
    </Modal>
  );
}

// Sub-components for report display
function InsightCard({ insight }: { insight: ReportInsight }) {
  const TrendIcon = insight.trend === 'up' ? ArrowUp : insight.trend === 'down' ? ArrowDown : Minus;
  const trendColor = insight.trend === 'up' ? 'text-green-600' : insight.trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <div className="p-3 border rounded-lg bg-background">
      <div className="flex items-start justify-between">
        <p className="font-medium text-sm">{insight.title}</p>
        <TrendIcon className={cn('size-4', trendColor)} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
    </div>
  );
}

function SectionCard({ section }: { section: ReportSection }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-1">{section.title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {section.metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-2 bg-muted/30 rounded">
            <p className="text-lg font-semibold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.name}</p>
            {metric.change && (
              <Badge variant={metric.changeType === 'positive' ? 'default' : metric.changeType === 'negative' ? 'destructive' : 'secondary'} className="text-xs mt-1">
                {metric.change}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: ReportRecommendation }) {
  const priorityColor = recommendation.priority === 'high' ? 'bg-red-100 text-red-700' : recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <AlertTriangle className={cn('size-4 mt-0.5', recommendation.priority === 'high' ? 'text-red-500' : 'text-yellow-500')} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{recommendation.title}</p>
          <Badge className={cn('text-xs', priorityColor)}>{recommendation.priority}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
      </div>
    </div>
  );
}
