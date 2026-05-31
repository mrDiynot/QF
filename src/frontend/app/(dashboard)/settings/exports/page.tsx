'use client';

/**
 * Data Export Page
 * Export business data in various formats
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize?: number;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}


const EXPORT_TYPES = [
  { id: 'leads', name: 'Leads', icon: Users, description: 'All lead data including contact info and scores' },
  { id: 'conversations', name: 'Conversations', icon: MessageSquare, description: 'Chat history and message logs' },
  { id: 'bookings', name: 'Bookings', icon: Calendar, description: 'Appointment and booking records' },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, description: 'Performance metrics and statistics' },
];

const FORMAT_OPTIONS = [
  { id: 'csv', name: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values' },
  { id: 'xlsx', name: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
  { id: 'json', name: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <Clock className="size-3" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="size-3 animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="size-3" /> },
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DataExportPage() {
  const [selectedType, setSelectedType] = useState('leads');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [includeArchived, setIncludeArchived] = useState(false);
  const queryClient = useQueryClient();

  // Fetch export jobs
  const { data: exports = [], isLoading, refetch } = useQuery({
    queryKey: ['export-jobs'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/exports');
      return response.data;
    },
    refetchInterval: 5000, // Poll for updates
  });

  // Create export mutation
  const createExportMutation = useMutation({
    mutationFn: async (data: { type: string; format: string; dateRange: string; includeArchived: boolean }) => {
      const response = await apiClient.post('/api/v1/exports', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Export started');
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
    },
    onError: () => {
      toast.error('Failed to start export');
    },
  });

  // Delete export mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/exports/${id}`);
    },
    onSuccess: () => {
      toast.success('Export deleted');
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
    },
  });

  const handleExport = () => {
    createExportMutation.mutate({
      type: selectedType,
      format: selectedFormat,
      dateRange,
      includeArchived,
    });
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
    toast.success('Download started');
  };

  const completedExports = exports.filter((e: ExportJob) => e.status === 'completed');
  const processingExports = exports.filter((e: ExportJob) => e.status === 'processing' || e.status === 'pending');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="size-7 text-purple-600" />
            Data Export
          </h1>
          <p className="text-gray-500 mt-1">
            Export your business data in various formats
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Download className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exports.length}</p>
                <p className="text-xs text-gray-500">Total Exports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExports.length}</p>
                <p className="text-xs text-gray-500">Available Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Loader2 className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processingExports.length}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Export */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New Export</CardTitle>
            <CardDescription>Select data type and format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Type */}
            <div className="space-y-3">
              <Label>Data Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXPORT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        selectedType === type.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      )}
                    >
                      <Icon className={cn(
                        "size-5 mb-1",
                        selectedType === type.id ? "text-purple-600" : "text-gray-400"
                      )} />
                      <p className="font-medium text-sm">{type.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-3">
              <Label>Format</Label>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-center transition-all",
                      selectedFormat === format.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    )}
                  >
                    <p className={cn(
                      "font-medium text-sm",
                      selectedFormat === format.id ? "text-purple-600" : "text-gray-600"
                    )}>{format.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="archived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
              />
              <Label htmlFor="archived" className="text-sm">Include archived records</Label>
            </div>

            <Button 
              className="w-full" 
              onClick={handleExport}
              disabled={createExportMutation.isPending}
            >
              {createExportMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Download className="size-4 mr-2" />
              )}
              Start Export
            </Button>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>Your recent exports and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : exports.length === 0 ? (
              <div className="text-center py-12">
                <Download className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No exports yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first export using the form</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exports.map((job: ExportJob) => {
                  const statusConfig = STATUS_CONFIG[job.status];
                  const typeConfig = EXPORT_TYPES.find(t => t.id === job.type);
                  const TypeIcon = typeConfig?.icon || FileText;
                  
                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <TypeIcon className="size-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 capitalize">
                                {job.type} Export
                              </h4>
                              <Badge className={cn('gap-1', statusConfig.color)}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </Badge>
                              <Badge variant="outline" className="uppercase text-xs">
                                {job.format}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                              {job.fileSize && <span>{formatBytes(job.fileSize)}</span>}
                              {job.expiresAt && (
                                <span>Expires {formatDistanceToNow(new Date(job.expiresAt), { addSuffix: true })}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {job.status === 'processing' && (
                            <div className="w-24">
                              <Progress value={job.progress} className="h-2" />
                              <p className="text-xs text-gray-400 text-center mt-1">{job.progress}%</p>
                            </div>
                          )}
                          {job.status === 'completed' && job.downloadUrl && (
                            <Button
                              size="sm"
                              onClick={() => handleDownload(job.downloadUrl!)}
                            >
                              <Download className="size-4 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(job.id)}
                          >
                            <Trash2 className="size-4 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
