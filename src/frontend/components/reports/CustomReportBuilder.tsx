'use client';

/**
 * Custom Report Builder Component
 * Drag-and-drop interface for creating custom reports with selected fields and filters
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Trash2,
  GripVertical,
  Save,
  Download,
  Eye,
  Users,
  MessageSquare,
  Phone,
  DollarSign,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Loader2,
  ChevronRight,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  category: string;
  aggregations?: ('sum' | 'avg' | 'count' | 'min' | 'max')[];
}

interface SelectedField {
  field: ReportField;
  aggregation?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ReportFilter {
  id: string;
  field: ReportField;
  operator: string;
  value: string;
}

interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  fields: SelectedField[];
  filters: ReportFilter[];
  groupBy?: string;
  visualization: 'table' | 'bar' | 'line' | 'pie';
}

const DATA_SOURCES = [
  { id: 'leads', name: 'Leads', icon: Users },
  { id: 'conversations', name: 'Conversations', icon: MessageSquare },
  { id: 'calls', name: 'AI Calls', icon: Phone },
  { id: 'revenue', name: 'Revenue', icon: DollarSign },
  { id: 'appointments', name: 'Appointments', icon: Calendar },
];

const AVAILABLE_FIELDS: Record<string, ReportField[]> = {
  leads: [
    { id: 'name', name: 'name', label: 'Lead Name', type: 'string', category: 'Basic' },
    { id: 'email', name: 'email', label: 'Email', type: 'string', category: 'Basic' },
    { id: 'phone', name: 'phone', label: 'Phone', type: 'string', category: 'Basic' },
    { id: 'source', name: 'source', label: 'Source', type: 'string', category: 'Attribution' },
    { id: 'status', name: 'status', label: 'Status', type: 'string', category: 'Status' },
    { id: 'score', name: 'score', label: 'Lead Score', type: 'number', category: 'Qualification', aggregations: ['avg', 'min', 'max'] },
    { id: 'createdAt', name: 'createdAt', label: 'Created Date', type: 'date', category: 'Dates' },
    { id: 'updatedAt', name: 'updatedAt', label: 'Last Updated', type: 'date', category: 'Dates' },
    { id: 'value', name: 'value', label: 'Estimated Value', type: 'currency', category: 'Financial', aggregations: ['sum', 'avg'] },
  ],
  conversations: [
    { id: 'leadName', name: 'leadName', label: 'Lead Name', type: 'string', category: 'Basic' },
    { id: 'channel', name: 'channel', label: 'Channel', type: 'string', category: 'Channel' },
    { id: 'messageCount', name: 'messageCount', label: 'Messages', type: 'number', category: 'Metrics', aggregations: ['sum', 'avg'] },
    { id: 'responseTime', name: 'responseTime', label: 'Avg Response Time', type: 'number', category: 'Metrics', aggregations: ['avg'] },
    { id: 'sentiment', name: 'sentiment', label: 'Sentiment', type: 'string', category: 'AI' },
    { id: 'createdAt', name: 'createdAt', label: 'Started', type: 'date', category: 'Dates' },
    { id: 'lastMessageAt', name: 'lastMessageAt', label: 'Last Message', type: 'date', category: 'Dates' },
  ],
  calls: [
    { id: 'leadName', name: 'leadName', label: 'Lead Name', type: 'string', category: 'Basic' },
    { id: 'duration', name: 'duration', label: 'Duration (sec)', type: 'number', category: 'Metrics', aggregations: ['sum', 'avg'] },
    { id: 'outcome', name: 'outcome', label: 'Outcome', type: 'string', category: 'Result' },
    { id: 'sentiment', name: 'sentiment', label: 'Sentiment', type: 'string', category: 'AI' },
    { id: 'agentName', name: 'agentName', label: 'AI Agent', type: 'string', category: 'Agent' },
    { id: 'calledAt', name: 'calledAt', label: 'Call Time', type: 'date', category: 'Dates' },
  ],
  revenue: [
    { id: 'leadName', name: 'leadName', label: 'Customer', type: 'string', category: 'Basic' },
    { id: 'amount', name: 'amount', label: 'Amount', type: 'currency', category: 'Financial', aggregations: ['sum', 'avg', 'min', 'max'] },
    { id: 'status', name: 'status', label: 'Status', type: 'string', category: 'Status' },
    { id: 'source', name: 'source', label: 'Source', type: 'string', category: 'Attribution' },
    { id: 'closedAt', name: 'closedAt', label: 'Closed Date', type: 'date', category: 'Dates' },
  ],
  appointments: [
    { id: 'leadName', name: 'leadName', label: 'Lead Name', type: 'string', category: 'Basic' },
    { id: 'title', name: 'title', label: 'Title', type: 'string', category: 'Basic' },
    { id: 'status', name: 'status', label: 'Status', type: 'string', category: 'Status' },
    { id: 'scheduledAt', name: 'scheduledAt', label: 'Scheduled Time', type: 'date', category: 'Dates' },
    { id: 'duration', name: 'duration', label: 'Duration (min)', type: 'number', category: 'Metrics', aggregations: ['avg'] },
  ],
};

const FILTER_OPERATORS: Record<string, { value: string; label: string }[]> = {
  string: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less or equal' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  currency: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
  ],
};

const VIZ_OPTIONS = [
  { id: 'table', icon: Table, label: 'Table' },
  { id: 'bar', icon: BarChart3, label: 'Bar Chart' },
  { id: 'line', icon: LineChart, label: 'Line Chart' },
  { id: 'pie', icon: PieChart, label: 'Pie Chart' },
];

interface CustomReportBuilderProps {
  className?: string;
  onSave?: (config: ReportConfig) => void;
}

export function CustomReportBuilder({ className, onSave }: CustomReportBuilderProps) {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dataSource, setDataSource] = useState<string>('leads');
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [visualization, setVisualization] = useState<'table' | 'bar' | 'line' | 'pie'>('table');
  const [groupBy, setGroupBy] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basic']));

  const availableFields = useMemo(() => AVAILABLE_FIELDS[dataSource] || [], [dataSource]);

  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const grouped: Record<string, ReportField[]> = {};
    availableFields.forEach((field) => {
      if (!grouped[field.category]) {
        grouped[field.category] = [];
      }
      grouped[field.category].push(field);
    });
    return grouped;
  }, [availableFields]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const addField = (field: ReportField) => {
    if (selectedFields.some((sf) => sf.field.id === field.id)) {
      toast.error('Field already added');
      return;
    }
    setSelectedFields([...selectedFields, { field }]);
  };

  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter((sf) => sf.field.id !== fieldId));
  };

  const updateFieldAggregation = (fieldId: string, aggregation: string) => {
    setSelectedFields(
      selectedFields.map((sf) =>
        sf.field.id === fieldId ? { ...sf, aggregation } : sf
      )
    );
  };

  const updateFieldSort = (fieldId: string, sortOrder: 'asc' | 'desc' | undefined) => {
    setSelectedFields(
      selectedFields.map((sf) =>
        sf.field.id === fieldId ? { ...sf, sortOrder } : sf
      )
    );
  };

  const addFilter = () => {
    if (availableFields.length === 0) return;
    const newFilter: ReportFilter = {
      id: `filter-${Date.now()}`,
      field: availableFields[0],
      operator: 'equals',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<ReportFilter>) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    setIsSaving(true);
    try {
      const config: ReportConfig = {
        name: reportName,
        description: reportDescription,
        dataSource,
        fields: selectedFields,
        filters,
        groupBy: groupBy || undefined,
        visualization,
      };

      if (onSave) {
        await onSave(config);
      }
      toast.success('Report saved successfully');
    } catch {
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Custom Report Builder</h2>
          <p className="text-sm text-muted-foreground">Build your own reports with custom fields and filters</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePreview}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button
            className="gap-2 gradient-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Report
          </Button>
        </div>
      </div>

      {/* Report Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Report Settings</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Report Name</Label>
            <Input
              placeholder="e.g., Monthly Lead Performance"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Source</Label>
            <Select value={dataSource} onValueChange={(v) => {
              setDataSource(v);
              setSelectedFields([]);
              setFilters([]);
              setGroupBy('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2">
                      <source.icon className="size-4" />
                      {source.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Description (optional)</Label>
            <Input
              placeholder="Brief description of this report"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Main Builder */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Fields */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings2 className="size-4" />
            Available Fields
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full p-2 text-sm font-medium text-foreground/80 hover:bg-muted/20 rounded-lg"
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  {category}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {fields.length}
                  </Badge>
                </button>
                {expandedCategories.has(category) && (
                  <div className="ml-6 space-y-1">
                    {fields.map((field) => {
                      const isSelected = selectedFields.some((sf) => sf.field.id === field.id);
                      return (
                        <button
                          key={field.id}
                          onClick={() => addField(field)}
                          disabled={isSelected}
                          className={cn(
                            "flex items-center gap-2 w-full p-2 text-sm rounded-lg transition-colors",
                            isSelected
                              ? "bg-primary/5 text-primary cursor-not-allowed"
                              : "hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <Plus className="size-3" />
                          {field.label}
                          {field.aggregations && (
                            <Badge variant="outline" className="text-[10px] ml-auto">
                              Agg
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Selected Fields */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Table className="size-4" />
            Selected Fields
            {selectedFields.length > 0 && (
              <Badge className="ml-2">{selectedFields.length}</Badge>
            )}
          </h3>
          {selectedFields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Table className="size-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">Click fields from the left panel to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedFields.map((sf) => (
                <div
                  key={sf.field.id}
                  className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg group"
                >
                  <GripVertical className="size-4 text-muted-foreground/60 cursor-move" />
                  <span className="text-sm font-medium text-foreground flex-1">
                    {sf.field.label}
                  </span>
                  {sf.field.aggregations && (
                    <Select
                      value={sf.aggregation || ''}
                      onValueChange={(v) => updateFieldAggregation(sf.field.id, v)}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="Agg" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sf.field.aggregations.map((agg) => (
                          <SelectItem key={agg} value={agg}>
                            {agg.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      sf.sortOrder === 'asc' && "bg-primary/10 text-primary"
                    )}
                    onClick={() => updateFieldSort(sf.field.id, sf.sortOrder === 'asc' ? undefined : 'asc')}
                  >
                    <SortAsc className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      sf.sortOrder === 'desc' && "bg-primary/10 text-primary"
                    )}
                    onClick={() => updateFieldSort(sf.field.id, sf.sortOrder === 'desc' ? undefined : 'desc')}
                  >
                    <SortDesc className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 opacity-0 group-hover:opacity-100"
                    onClick={() => removeField(sf.field.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Filter className="size-4" />
            Filters
          </h3>
          <Button variant="outline" size="sm" className="gap-2" onClick={addFilter}>
            <Plus className="size-4" />
            Add Filter
          </Button>
        </div>
        {filters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No filters applied. All records will be included.
          </p>
        ) : (
          <div className="space-y-3">
            {filters.map((filter, idx) => (
              <div key={filter.id} className="flex items-center gap-3">
                {idx > 0 && <Badge variant="secondary">AND</Badge>}
                <Select
                  value={filter.field.id}
                  onValueChange={(v) => {
                    const newField = availableFields.find((f) => f.id === v);
                    if (newField) {
                      updateFilter(filter.id, { field: newField, operator: 'equals', value: '' });
                    }
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.operator}
                  onValueChange={(v) => updateFilter(filter.id, { operator: v })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(FILTER_OPERATORS[filter.field.type] || FILTER_OPERATORS.string).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder="Value..."
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => removeFilter(filter.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Visualization */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Visualization</h3>
        <div className="flex gap-3">
          {VIZ_OPTIONS.map((viz) => (
            <button
              key={viz.id}
              onClick={() => setVisualization(viz.id as typeof visualization)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                visualization === viz.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-border text-muted-foreground"
              )}
            >
              <viz.icon className="size-6" />
              <span className="text-sm font-medium">{viz.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Preview Dialog */}
      <Modal open={previewOpen} onOpenChange={setPreviewOpen}>
        <ModalContent size="2xl">
          <ModalHeader>
            <ModalTitle>Report Preview</ModalTitle>
            <ModalDescription>
              Preview of &quot;{reportName || 'Untitled Report'}&quot; with sample data
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr>
                    {selectedFields.map((sf) => (
                      <th key={sf.field.id} className="text-left p-3 font-medium text-foreground/80">
                        {sf.field.label}
                        {sf.aggregation && (
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {sf.aggregation.toUpperCase()}
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="border-t">
                      {selectedFields.map((sf) => (
                        <td key={sf.field.id} className="p-3 text-muted-foreground">
                          {sf.field.type === 'currency'
                            ? `$${(Math.random() * 10000).toFixed(2)}`
                            : sf.field.type === 'number'
                            ? Math.floor(Math.random() * 100)
                            : sf.field.type === 'date'
                            ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            : `Sample ${sf.field.label} ${row}`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button className="gap-2 gradient-primary">
              <Download className="size-4" />
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
