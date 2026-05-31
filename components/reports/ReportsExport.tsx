'use client';

/**
 * Reports & Export Component
 * Generate and download reports with various export options
 * Updated Sprint 37 - Connected to Reports API
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  Calendar,
  Clock,
  Loader2,
  BarChart3,
  Users,
  MessageSquare,
  Phone,
  DollarSign,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useReportTemplates, useGenerateReport, useExportToExcel, useExportToCsv } from '@/hooks/api/useReports';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  formats: ('pdf' | 'csv' | 'xlsx')[];
}

interface ScheduledReport {
  id: string;
  reportType: string;
  frequency: string;
  nextRun: Date;
  recipients: string[];
  format: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'leads',
    name: 'Leads Report',
    description: 'Overview of all leads with status and source',
    icon: <Users className="size-5" />,
    category: 'Sales',
    formats: ['pdf', 'csv', 'xlsx'],
  },
  {
    id: 'conversations',
    name: 'Conversations Report',
    description: 'Message volume and response times',
    icon: <MessageSquare className="size-5" />,
    category: 'Communication',
    formats: ['pdf', 'csv'],
  },
  {
    id: 'calls',
    name: 'Call Analytics',
    description: 'AI call performance and outcomes',
    icon: <Phone className="size-5" />,
    category: 'Voice',
    formats: ['pdf', 'csv', 'xlsx'],
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Pipeline value and closed deals',
    icon: <DollarSign className="size-5" />,
    category: 'Finance',
    formats: ['pdf', 'xlsx'],
  },
  {
    id: 'performance',
    name: 'Performance Dashboard',
    description: 'Team and channel performance metrics',
    icon: <TrendingUp className="size-5" />,
    category: 'Analytics',
    formats: ['pdf'],
  },
  {
    id: 'activity',
    name: 'Activity Log',
    description: 'Detailed activity history export',
    icon: <BarChart3 className="size-5" />,
    category: 'Analytics',
    formats: ['csv', 'xlsx'],
  },
];

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'custom', label: 'Custom range' },
];

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="size-4 text-red-500" />,
  csv: <File className="size-4 text-green-500" />,
  xlsx: <FileSpreadsheet className="size-4 text-info" />,
};

interface ReportsExportProps {
  className?: string;
}

export function ReportsExport({ className }: ReportsExportProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // API hooks - templates reserved for template selector
  useReportTemplates();
  const generateReportMutation = useGenerateReport();
  const exportExcelMutation = useExportToExcel();
  const exportCsvMutation = useExportToCsv();

  const isExporting = generateReportMutation.isPending || exportExcelMutation.isPending || exportCsvMutation.isPending;

  const scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      reportType: 'Leads Report',
      frequency: 'Weekly',
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      recipients: ['team@company.com'],
      format: 'pdf',
    },
    {
      id: '2',
      reportType: 'Revenue Report',
      frequency: 'Monthly',
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      recipients: ['finance@company.com'],
      format: 'xlsx',
    },
  ];

  // Calculate date range
  const getDateRange = () => {
    const to = new Date().toISOString().split('T')[0];
    let from = to;
    
    switch (dateRange) {
      case '7d':
        from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'ytd':
        from = `${new Date().getFullYear()}-01-01`;
        break;
    }
    return { from, to };
  };

  // Open export dialog
  const openExport = (report: ReportType) => {
    setSelectedReport(report);
    setExportFormat(report.formats[0]);
    setExportDialogOpen(true);
  };

  // Generate report using API
  const generateReport = async () => {
    if (!selectedReport) return;
    
    const { from, to } = getDateRange();
    
    try {
      if (exportFormat === 'xlsx') {
        const blob = await exportExcelMutation.mutateAsync({
          reportType: selectedReport.id,
          from,
          to,
        });
        // Download the blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.id}_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (exportFormat === 'csv') {
        const blob = await exportCsvMutation.mutateAsync({
          reportType: selectedReport.id,
          from,
          to,
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.id}_report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For PDF, generate report data first
        await generateReportMutation.mutateAsync({
          templateId: selectedReport.id,
          from,
          to,
        });
      }
      
      setExportDialogOpen(false);
      toast.success(`${selectedReport?.name} exported as ${exportFormat.toUpperCase()}`);
    } catch {
      toast.error('Failed to generate report');
    }
  };

  // Schedule report
  const scheduleReport = () => {
    setScheduleDialogOpen(false);
    toast.success('Report scheduled successfully');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Reports & Export</h2>
          <p className="text-sm text-muted-foreground">
            Generate and download detailed reports
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setScheduleDialogOpen(true)}
        >
          <Calendar className="size-4" />
          Schedule Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{REPORT_TYPES.length}</p>
              <p className="text-xs text-muted-foreground">Report Types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50 text-info">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{scheduledReports.length}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Download className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">Exports This Month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Available Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((report) => (
            <div
              key={report.id}
              className="p-4 border rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => openExport(report)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                  {report.icon}
                </div>
                <Badge variant="secondary">{report.category}</Badge>
              </div>
              <h4 className="font-medium text-foreground">{report.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              <div className="flex items-center gap-2 mt-3">
                {report.formats.map((fmt) => (
                  <span key={fmt} className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    {FORMAT_ICONS[fmt]}
                    {fmt.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Scheduled Reports</h3>
        {scheduledReports.length > 0 ? (
          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{report.reportType}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{report.frequency}</span>
                      <span>•</span>
                      <span>Next: {format(report.nextRun, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1">
                    {FORMAT_ICONS[report.format]}
                    {report.format.toUpperCase()}
                  </Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="size-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No scheduled reports</p>
          </div>
        )}
      </Card>

      {/* Export Dialog */}
      <Modal open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <ModalContent size="md">
          {selectedReport && (
            <>
              <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                  {selectedReport.icon}
                  Export {selectedReport.name}
                </ModalTitle>
                <ModalDescription>
                  Configure your export settings
                </ModalDescription>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <div className="flex gap-2">
                    {selectedReport.formats.map((fmt) => (
                      <Button
                        key={fmt}
                        variant={exportFormat === fmt ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setExportFormat(fmt)}
                      >
                        {FORMAT_ICONS[fmt]}
                        {fmt.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={generateReport}
                  disabled={isExporting}
                  className="gap-2 bg-primary hover:bg-purple-700"
                >
                  {isExporting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {isExporting ? 'Generating...' : 'Export'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Schedule Dialog */}
      <Modal open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Schedule Report</ModalTitle>
            <ModalDescription>
              Set up automatic report delivery
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="leads">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Send To</Label>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Mail className="size-4 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">team@company.com</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={scheduleReport} className="bg-primary hover:bg-purple-700">
              Schedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
