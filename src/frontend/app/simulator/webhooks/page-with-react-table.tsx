'use client';

/**
 * Webhook Inspector Page with DashCode React-Table Integration
 * Monitor and test webhook payloads using advanced data table
 */

import { useState, useEffect } from 'react';
import {
  Webhook,
  Play,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { webhooksService } from '@/services/api/webhooks.service';
import { useSimulatorTheme } from '../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { columns, WebhookEvent } from './columns';

const mockEvents: WebhookEvent[] = [
  {
    id: '1',
    direction: 'inbound',
    type: 'form.submitted',
    url: '/api/v1/webhooks/forms',
    method: 'POST',
    status: 200,
    duration: 45,
    timestamp: new Date(Date.now() - 60000),
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=abc123...' },
    payload: { event: 'form.submitted', formId: 'form_123', submissionId: 'sub_456', data: { name: 'John', email: 'john@example.com' } },
    response: { success: true, leadId: 'lead_789' },
  },
  {
    id: '2',
    direction: 'outbound',
    type: 'lead.qualified',
    url: 'https://crm.example.com/webhooks/leads',
    method: 'POST',
    status: 201,
    duration: 234,
    timestamp: new Date(Date.now() - 120000),
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token...' },
    payload: { event: 'lead.qualified', leadId: 'lead_789', score: 85, qualifiedAt: '2024-12-16T12:00:00Z' },
    response: { received: true, crmId: 'crm_001' },
  },
  {
    id: '3',
    direction: 'inbound',
    type: 'twilio.sms',
    url: '/api/v1/webhooks/twilio/sms',
    method: 'POST',
    status: 200,
    duration: 67,
    timestamp: new Date(Date.now() - 180000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload: { From: '+15551234567', To: '+18005550199', Body: 'Hello!' },
    response: { success: true, messageId: 'msg_abc' },
  },
  {
    id: '4',
    direction: 'outbound',
    type: 'slack.notification',
    url: 'https://hooks.slack.com/services/T00/B00/xxx',
    method: 'POST',
    status: 500,
    duration: 1234,
    timestamp: new Date(Date.now() - 240000),
    headers: { 'Content-Type': 'application/json' },
    payload: { text: 'New lead: John Doe', channel: '#leads' },
    response: { error: 'channel_not_found' },
  },
];

export default function WebhookInspectorPage() {
  useSimulatorTheme();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [testUrl, setTestUrl] = useState('https://');
  const [testPayload, setTestPayload] = useState('{\n  "event": "test",\n  "data": {}\n}');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch webhook events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deliveries = await webhooksService.getRecentActivity(20);
        if (deliveries.length > 0) {
          const transformedEvents: WebhookEvent[] = deliveries.map((d) => ({
            id: d.id,
            direction: 'outbound' as const,
            type: d.eventType,
            url: 'Unknown',
            method: 'POST' as const,
            status: d.responseCode || (d.status === 1 ? 200 : 500),
            duration: d.durationMs || 0,
            timestamp: new Date(d.createdAt),
            headers: { 'Content-Type': 'application/json' },
            payload: { event: d.eventType, webhookId: d.webhookId },
            response: d.errorMessage ? { error: d.errorMessage } : { success: true },
          }));
          setEvents(transformedEvents);
        } else {
          setEvents(mockEvents);
        }
      } catch {
        setEvents(mockEvents);
      }
    };
    fetchData();
  }, []);

  const table = useReactTable({
    data: events,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleTestWebhook = () => {
    // Simulate sending a test webhook
    const newEvent: WebhookEvent = {
      id: Date.now().toString(),
      direction: 'outbound',
      type: 'test.webhook',
      url: testUrl,
      method: 'POST',
      status: Math.random() > 0.2 ? 200 : 500,
      duration: Math.floor(Math.random() * 500) + 50,
      timestamp: new Date(),
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.parse(testPayload),
      response: { success: true },
    };
    setEvents([newEvent, ...events]);
    setSelectedEvent(newEvent);
  };

  const getStatusColor = (status: number) => {
    if (status < 300) return 'text-emerald-400';
    if (status < 400) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600">
                <Webhook className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Webhook Inspector</h1>
                <p className="text-xs text-slate-400">Monitor webhooks with advanced data table</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Listening
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Webhook Events Table */}
        <div className="flex-1 border-r border-slate-800 flex flex-col">
          {/* Filters */}
          <div className="shrink-0 p-3 border-b border-slate-800 flex items-center gap-3">
            <Input
              placeholder="Filter by type..."
              value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("type")?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-slate-800 border-slate-700"
            />
            <div className="flex-1" />
            <div className="text-xs text-slate-500">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-800/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => setSelectedEvent(row.original)}
                      className={cn(
                        "cursor-pointer hover:bg-slate-800/50",
                        selectedEvent?.id === row.original.id && "bg-slate-800"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No webhook events captured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="shrink-0 border-t border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-slate-700"
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-96 flex flex-col bg-slate-950">
          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-slate-800 bg-transparent p-0 h-12">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="test"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-4"
              >
                Test Webhook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto m-0">
              {selectedEvent ? (
                <div className="p-4 space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {selectedEvent.status < 300 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={cn('text-lg font-mono', getStatusColor(selectedEvent.status))}>
                      {selectedEvent.status}
                    </span>
                    <Badge variant="secondary">
                      {selectedEvent.method}
                    </Badge>
                    <span className="text-sm text-slate-500">{selectedEvent.duration}ms</span>
                  </div>

                  {/* URL */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">URL</Label>
                    <code className="block p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-slate-300 break-all">
                      {selectedEvent.url}
                    </code>
                  </div>

                  {/* Headers */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">Headers</Label>
                    <pre className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.headers, null, 2)}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">Payload</Label>
                    <pre className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>

                  {/* Response */}
                  {selectedEvent.response && (
                    <div>
                      <Label className="text-xs text-slate-500 mb-1.5 block">Response</Label>
                      <pre className={cn(
                        'p-3 rounded-lg border text-xs font-mono overflow-x-auto',
                        selectedEvent.status < 300
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      )}>
                        {JSON.stringify(selectedEvent.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center text-slate-500">
                    <ChevronRight className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                    <p>Select an event to view details</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="flex-1 p-4 overflow-auto m-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Webhook URL</Label>
                  <Input
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://your-endpoint.com/webhook"
                    className="bg-slate-800 border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Payload (JSON)</Label>
                  <Textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="bg-slate-800 border-slate-700 font-mono min-h-[200px] resize-none"
                  />
                </div>
                <Button
                  onClick={handleTestWebhook}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Send Test Webhook
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
