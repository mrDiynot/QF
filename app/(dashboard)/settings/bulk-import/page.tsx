'use client';

/**
 * Bulk Import Page
 * Sprint 37 Feature - Import leads and contacts from CSV
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  FileText,
  Loader2,
  Info,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useImportLeads,
  useImportContacts,
  useValidateCsv,
  useDownloadLeadTemplate,
  useDownloadContactTemplate,
} from '@/hooks/api/useBulkImport';

export default function BulkImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // API hooks
  const importLeadsMutation = useImportLeads();
  const importContactsMutation = useImportContacts();
  const validateMutation = useValidateCsv();
  const downloadLeadTemplateMutation = useDownloadLeadTemplate();
  const downloadContactTemplateMutation = useDownloadContactTemplate();

  const isImporting = importLeadsMutation.isPending || importContactsMutation.isPending;
  const isValidating = validateMutation.isPending;

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setImportResult(null);
    }
  }, []);

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await validateMutation.mutateAsync({
        file: selectedFile,
        entityType: activeTab,
      });
      setValidationResult({
        valid: result.isValid,
        totalRows: result.totalRows,
        validRows: result.validRows,
        errors: result.errors || [],
      });
    } catch {
      toast.error('Validation failed');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = activeTab === 'leads'
        ? await importLeadsMutation.mutateAsync({
            file: selectedFile,
            skipDuplicates: !updateExisting, // If updating existing, don't skip duplicates
            updateExisting,
          })
        : await importContactsMutation.mutateAsync({
            file: selectedFile,
            skipDuplicates: !updateExisting,
            updateExisting,
          });

      setImportResult({
        success: true,
        imported: result.importedCount || result.successCount,
        updated: result.updatedCount || 0,
        skipped: result.skippedCount,
        errors: result.errors?.map(e => typeof e === 'string' ? e : e.message) || [],
      });

      const _totalProcessed = (result.importedCount || 0) + (result.updatedCount || 0);
      const message = updateExisting && result.updatedCount > 0
        ? `Imported ${result.importedCount} new and updated ${result.updatedCount} existing ${activeTab}`
        : `Successfully imported ${result.importedCount} ${activeTab}`;
      toast.success(message);
    } catch {
      toast.error('Import failed');
    }
  };

  const handleDownloadTemplate = () => {
    if (activeTab === 'leads') {
      downloadLeadTemplateMutation.mutate();
    } else {
      downloadContactTemplateMutation.mutate();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-1.5 text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Bulk Import</h1>
          <p className="text-sm text-gray-500">
            Import leads and contacts from CSV files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/leads" className="gap-2">
              <ExternalLink className="size-4" />
              Go to Leads
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/crm" className="gap-2">
              <Users className="size-4" />
              Go to Contacts
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetState(); }}>
        <TabsList>
          <TabsTrigger value="leads" className="gap-2">
            <UserPlus className="size-4" />
            Import Leads
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="size-4" />
            Import Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <ImportSection
            entityType="leads"
            selectedFile={selectedFile}
            validationResult={validationResult}
            importResult={importResult}
            isValidating={isValidating}
            isImporting={isImporting}
            updateExisting={updateExisting}
            onUpdateExistingChange={setUpdateExisting}
            onFileSelect={handleFileSelect}
            onValidate={handleValidate}
            onImport={handleImport}
            onDownloadTemplate={handleDownloadTemplate}
            onReset={resetState}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <ImportSection
            entityType="contacts"
            selectedFile={selectedFile}
            validationResult={validationResult}
            importResult={importResult}
            isValidating={isValidating}
            isImporting={isImporting}
            updateExisting={updateExisting}
            onUpdateExistingChange={setUpdateExisting}
            onFileSelect={handleFileSelect}
            onValidate={handleValidate}
            onImport={handleImport}
            onDownloadTemplate={handleDownloadTemplate}
            onReset={resetState}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ImportSectionProps {
  entityType: string;
  selectedFile: File | null;
  validationResult: {
    valid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } | null;
  importResult: {
    success: boolean;
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null;
  isValidating: boolean;
  isImporting: boolean;
  updateExisting: boolean;
  onUpdateExistingChange: (value: boolean) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidate: () => void;
  onImport: () => void;
  onDownloadTemplate: () => void;
  onReset: () => void;
}

function ImportSection({
  entityType,
  selectedFile,
  validationResult,
  importResult,
  isValidating,
  isImporting,
  updateExisting,
  onUpdateExistingChange,
  onFileSelect,
  onValidate,
  onImport,
  onDownloadTemplate,
  onReset,
}: ImportSectionProps) {
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Import Instructions</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
              <li>Download the CSV template to see the required format</li>
              <li>Fill in your data following the template structure</li>
              <li>Upload your file and validate before importing</li>
              <li>Duplicates are identified by email address</li>
              <li>Enable &quot;Update Existing&quot; to merge new data into existing records</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Import Options */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Import Options</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-5 text-purple-600" />
            <div>
              <Label htmlFor="update-existing" className="font-medium text-gray-900">
                Update Existing Records
              </Label>
              <p className="text-sm text-gray-500">
                When enabled, existing {entityType} with matching email will be updated instead of skipped
              </p>
            </div>
          </div>
          <Switch
            id="update-existing"
            checked={updateExisting}
            onCheckedChange={onUpdateExistingChange}
          />
        </div>
      </Card>

      {/* Template Download */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <FileSpreadsheet className="size-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">CSV Template</h3>
              <p className="text-sm text-gray-500">
                Download the template with required columns for {entityType}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onDownloadTemplate} className="gap-2">
            <Download className="size-4" />
            Download Template
          </Button>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Upload CSV File</h3>
        
        {!selectedFile ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="size-10 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-400 mt-1">CSV files only (max 10MB)</span>
            <input
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="size-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Remove
              </Button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className={cn(
                "p-4 rounded-lg",
                validationResult.valid ? "bg-green-50" : "bg-red-50"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.valid ? (
                    <CheckCircle className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-red-600" />
                  )}
                  <span className={cn(
                    "font-medium",
                    validationResult.valid ? "text-green-900" : "text-red-900"
                  )}>
                    {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Total rows: {validationResult.totalRows}</p>
                  <p>Valid rows: {validationResult.validRows}</p>
                  {validationResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-700">Errors:</p>
                      <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                        {validationResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li>...and {validationResult.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="size-5 text-green-600" />
                  <span className="font-medium text-green-900">Import Complete</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>New records imported: {importResult.imported}</p>
                  {importResult.updated > 0 && (
                    <p>Existing records updated: {importResult.updated}</p>
                  )}
                  {importResult.skipped > 0 && (
                    <p>Skipped (duplicates): {importResult.skipped}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!validationResult && (
                <Button
                  onClick={onValidate}
                  disabled={isValidating}
                  variant="outline"
                  className="gap-2"
                >
                  {isValidating && <Loader2 className="size-4 animate-spin" />}
                  Validate File
                </Button>
              )}
              
              {validationResult?.valid && !importResult && (
                <Button
                  onClick={onImport}
                  disabled={isImporting}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {isImporting && <Loader2 className="size-4 animate-spin" />}
                  Import {entityType}
                </Button>
              )}

              {importResult && (
                <Button onClick={onReset} variant="outline">
                  Import Another File
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
