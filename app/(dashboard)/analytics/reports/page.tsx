'use client';

/**
 * Custom Reports Page
 * Build and manage custom analytics reports
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Download,
  Play,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  FileText,
  Eye,
  Star,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { AIReportGenerationDialog } from '@/components/reports/AIReportGenerationDialog';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: string;
  metrics: string[];
  schedule?: string;
  lastRunAt?: string;
  isFavorite: boolean;
  createdAt: string;
}


const REPORT_TYPES = [
  { id: 'leads', name: 'Leads', icon: Users },
  { id: 'conversations', name: 'Conversations', icon: MessageSquare },
  { id: 'channels', name: 'Channels', icon: Phone },
  { id: 'ai', name: 'AI Usage', icon: TrendingUp },
  { id: 'bookings', name: 'Bookings', icon: Calendar },
  { id: 'emails', name: 'Emails', icon: Mail },
];

const METRICS_BY_TYPE: Record<string, { id: string; name: string }[]> = {
  leads: [
    { id: 'total_leads', name: 'Total Leads' },
    { id: 'new_leads', name: 'New Leads' },
    { id: 'conversion_rate', name: 'Conversion Rate' },
    { id: 'top_sources', name: 'Top Sources' },
    { id: 'avg_score', name: 'Average Lead Score' },
  ],
  conversations: [
    { id: 'total_conversations', name: 'Total Conversations' },
    { id: 'avg_response_time', name: 'Avg Response Time' },
    { id: 'resolution_rate', name: 'Resolution Rate' },
    { id: 'sentiment_score', name: 'Sentiment Score' },
  ],
  channels: [
    { id: 'messages_sent', name: 'Messages Sent' },
    { id: 'messages_received', name: 'Messages Received' },
    { id: 'response_rate', name: 'Response Rate' },
    { id: 'channel_breakdown', name: 'Channel Breakdown' },
  ],
  ai: [
    { id: 'ai_conversations', name: 'AI Conversations' },
    { id: 'ai_voice_minutes', name: 'AI Voice Minutes' },
    { id: 'ai_success_rate', name: 'AI Success Rate' },
    { id: 'handoff_rate', name: 'Human Handoff Rate' },
  ],
  bookings: [
    { id: 'total_bookings', name: 'Total Bookings' },
    { id: 'completion_rate', name: 'Completion Rate' },
    { id: 'no_show_rate', name: 'No-Show Rate' },
    { id: 'avg_booking_value', name: 'Avg Booking Value' },
  ],
  emails: [
    { id: 'emails_sent', name: 'Emails Sent' },
    { id: 'open_rate', name: 'Open Rate' },
    { id: 'click_rate', name: 'Click Rate' },
    { id: 'bounce_rate', name: 'Bounce Rate' },
  ],
};

const SCHEDULE_OPTIONS = [
  { id: 'none', name: 'No Schedule' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
];

export default function CustomReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiReportDialogOpen, setAiReportDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'leads',
    metrics: [] as string[],
    schedule: 'none',
  });
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/reports');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newReport) => {
      const response = await apiClient.post('/api/v1/reports', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report created');
      setCreateDialogOpen(false);
      setNewReport({ name: '', description: '', type: 'leads', metrics: [], schedule: 'none' });
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
    onError: () => {
      toast.error('Failed to create report');
    },
  });

  // Run report mutation
  const runReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/reports/${id}/run`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report is running');
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
    onError: () => {
      toast.error('Failed to run report');
    },
  });

  // Toggle favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await apiClient.patch(`/api/v1/reports/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/reports/${id}`);
    },
    onSuccess: () => {
      toast.success('Report deleted');
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
    onError: () => {
      toast.error('Failed to delete report');
    },
  });

  const handleCreate = () => {
    if (!newReport.name || newReport.metrics.length === 0) {
      toast.error('Please fill in name and select at least one metric');
      return;
    }
    createMutation.mutate(newReport);
  };

  const toggleMetric = (metricId: string) => {
    setNewReport(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  // Filter reports
  const filteredReports = reports.filter((report: CustomReport) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const favoriteReports = reports.filter((r: CustomReport) => r.isFavorite);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="size-7 text-purple-600" />
            Custom Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Build and schedule custom analytics reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setAiReportDialogOpen(true)}
            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="size-4" />
            AI Report
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-gray-500">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Star className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{favoriteReports.length}</p>
                <p className="text-xs text-gray-500">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter((r: CustomReport) => r.schedule).length}</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter((r: CustomReport) => r.lastRunAt).length}</p>
                <p className="text-xs text-gray-500">Run This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>Click on a report to view or run it</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reports found</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Your First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report: CustomReport) => {
                const typeConfig = REPORT_TYPES.find(t => t.id === report.type);
                const TypeIcon = typeConfig?.icon || BarChart3;
                
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                            <TypeIcon className="size-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{report.name}</h4>
                              {report.isFavorite && (
                                <Star className="size-4 text-amber-500 fill-amber-500" />
                              )}
                              {report.schedule && (
                                <Badge variant="outline" className="capitalize">{report.schedule}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {report.metrics.slice(0, 3).map((metric) => (
                                <Badge key={metric} variant="secondary" className="text-xs">
                                  {metric.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                              {report.metrics.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{report.metrics.length - 3} more
                                </Badge>
                              )}
                            </div>
                            {report.lastRunAt && (
                              <p className="text-xs text-gray-400 mt-2">
                                Last run {formatDistanceToNow(new Date(report.lastRunAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runReportMutation.mutate(report.id)}
                          >
                            <Play className="size-4 mr-1" />
                            Run
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="size-4 mr-2" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFavoriteMutation.mutate({ id: report.id, isFavorite: !report.isFavorite })}>
                                <Star className="size-4 mr-2" />
                                {report.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="size-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="size-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteMutation.mutate(report.id)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Modal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Create Custom Report</ModalTitle>
            <ModalDescription>
              Build a new report by selecting metrics to track.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Lead Summary"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Report Type</Label>
                <Select
                  value={newReport.type}
                  onValueChange={(value) => setNewReport({ ...newReport, type: value, metrics: [] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of what this report tracks"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Metrics *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {METRICS_BY_TYPE[newReport.type]?.map((metric) => (
                  <div key={metric.id} className="flex items-center gap-2">
                    <Checkbox
                      id={metric.id}
                      checked={newReport.metrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetric(metric.id)}
                    />
                    <Label htmlFor={metric.id} className="text-sm font-normal">{metric.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Select
                value={newReport.schedule}
                onValueChange={(value) => setNewReport({ ...newReport, schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Report Generation Dialog */}
      <AIReportGenerationDialog
        open={aiReportDialogOpen}
        onOpenChange={setAiReportDialogOpen}
        onReportGenerated={() => {
          toast.success('AI Report generated! You can export it as PDF or Markdown.');
        }}
      />
    </div>
  );
}
