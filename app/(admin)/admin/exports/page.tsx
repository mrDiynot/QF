'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  FileText,
  Loader2,

  Building2,
  Users,
  CreditCard,
  Ticket,
  ScrollText,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useExportBusinesses,
  useExportUsers,
  useExportSubscriptions,
  useExportAIUsage,
} from '@/hooks/admin';

type ExportType = 'businesses' | 'users' | 'subscriptions' | 'support_tickets' | 'audit_logs';
type ExportFormat = 'csv' | 'xlsx' | 'json';

const exportTypes: { value: ExportType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'businesses', label: 'Businesses', icon: <Building2 className="h-5 w-5" />, description: 'All registered businesses' },
  { value: 'users', label: 'Users', icon: <Users className="h-5 w-5" />, description: 'All platform users' },
  { value: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-5 w-5" />, description: 'Subscription data and billing' },
  { value: 'support_tickets', label: 'Support Tickets', icon: <Ticket className="h-5 w-5" />, description: 'All support tickets' },
  { value: 'audit_logs', label: 'Audit Logs', icon: <ScrollText className="h-5 w-5" />, description: 'System audit trail' },
];

export default function ExportsPage() {
  const [selectedType, setSelectedType] = useState<ExportType>('businesses');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const exportBusinesses = useExportBusinesses();
  const exportUsers = useExportUsers();
  const exportSubscriptions = useExportSubscriptions();
  const exportAIUsage = useExportAIUsage();

  const isExporting = exportBusinesses.isPending || exportUsers.isPending || 
                      exportSubscriptions.isPending || exportAIUsage.isPending;

  const handleExport = async () => {
    const request = { format: selectedFormat };
    
    try {
      switch (selectedType) {
        case 'businesses':
          await exportBusinesses.mutateAsync(request);
          break;
        case 'users':
          await exportUsers.mutateAsync(request);
          break;
        case 'subscriptions':
          await exportSubscriptions.mutateAsync(request);
          break;
        case 'support_tickets':
        case 'audit_logs':
          await exportAIUsage.mutateAsync(request);
          break;
      }
      toast.success(`${selectedType} exported successfully`);
    } catch {
      toast.error(`Failed to export ${selectedType}`);
    }
  };

  const _getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
      case 'json':
        return <FileText className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-admin-foreground">Data Exports</h1>
          <p className="text-admin-muted-foreground mt-1">
            Export platform data in various formats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Export */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-foreground">New Export</CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              Select data type and format to export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-admin-muted-foreground">Data Type</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ExportType)}>
                <SelectTrigger className="mt-1 bg-admin-background border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-admin-muted-foreground">Format</label>
              <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
                <SelectTrigger className="mt-1 bg-admin-background border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <p className="text-sm text-admin-muted-foreground mb-4">
                {exportTypes.find(t => t.value === selectedType)?.description}
              </p>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-[#FF6900] hover:bg-orange-600"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Export
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Info */}
        <div className="lg:col-span-2">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Export Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-admin-muted rounded-lg">
                <h3 className="font-medium text-admin-foreground mb-2">Available Exports</h3>
                <ul className="space-y-2 text-sm text-admin-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span><strong>Businesses:</strong> All registered business accounts with their details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span><strong>Users:</strong> All platform users across all businesses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span><strong>Subscriptions:</strong> Subscription and billing data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span><strong>Support Tickets:</strong> All support ticket records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4" />
                    <span><strong>Audit Logs:</strong> System activity and audit trail</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-admin-muted-foreground">
                  <span className="font-medium text-admin-foreground">Note:</span> Exported files will be downloaded directly to your browser. Large exports may take a few moments to generate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
