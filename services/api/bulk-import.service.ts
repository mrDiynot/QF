import { apiClient } from '@/lib/axios';

// ============================================================================
// Bulk Import Types
// ============================================================================

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface BulkImportResult {
  entityType: string;
  totalRows: number;
  successCount: number;
  importedCount: number; // Alias for successCount
  updatedCount: number; // Count of existing records that were updated
  failedCount: number;
  skippedCount: number;
  startedAt: string;
  completedAt?: string;
  errors: ImportError[];
}

export interface CsvValidationResult {
  fileName: string;
  fileSize: number;
  isValid: boolean;
  totalRows: number;
  validRows: number; // Number of valid rows
  detectedColumns: string[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Bulk Import Service
// ============================================================================

export const bulkImportService = {
  importLeads: async (
    file: File,
    skipDuplicates: boolean = true,
    updateExisting: boolean = false
  ): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<BulkImportResult>(
      `/bulk-import/leads?skipDuplicates=${skipDuplicates}&updateExisting=${updateExisting}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  importContacts: async (
    file: File,
    skipDuplicates: boolean = true,
    updateExisting: boolean = false
  ): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<BulkImportResult>(
      `/bulk-import/contacts?skipDuplicates=${skipDuplicates}&updateExisting=${updateExisting}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  validateCsv: async (file: File, entityType: string = 'leads'): Promise<CsvValidationResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<CsvValidationResult>(
      `/bulk-import/validate?entityType=${entityType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  downloadLeadTemplate: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/bulk-import/templates/leads', {
      responseType: 'blob',
    });
    return data;
  },

  downloadContactTemplate: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/bulk-import/templates/contacts', {
      responseType: 'blob',
    });
    return data;
  },
};

export default bulkImportService;
