'use client';

/**
 * Network Inspector Component
 * Displays API requests made during testing
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  X,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  requestBody?: object;
  responseBody?: object;
  direction: 'inbound' | 'outbound';
}

const mockRequests: NetworkRequest[] = [
  {
    id: '1',
    method: 'GET',
    url: '/api/v1/public/chat/widget/main-widget',
    status: 200,
    duration: 45,
    timestamp: new Date(Date.now() - 5000),
    direction: 'outbound',
    responseBody: { widgetKey: 'main-widget', primaryColor: '#8b5cf6', position: 'bottom-right' },
  },
  {
    id: '2',
    method: 'POST',
    url: '/api/v1/public/chat/sessions',
    status: 201,
    duration: 123,
    timestamp: new Date(Date.now() - 4000),
    direction: 'outbound',
    requestBody: { widgetKey: 'main-widget', visitorName: 'John' },
    responseBody: { sessionId: 'sess_123', sessionToken: 'token_abc' },
  },
  {
    id: '3',
    method: 'POST',
    url: '/api/v1/public/chat/messages',
    status: 201,
    duration: 89,
    timestamp: new Date(Date.now() - 3000),
    direction: 'outbound',
    requestBody: { sessionToken: 'token_abc', content: 'Hello!' },
    responseBody: { messageId: 'msg_456', content: 'Hello!' },
  },
  {
    id: '4',
    method: 'POST',
    url: '/signalr/negotiate',
    status: 200,
    duration: 34,
    timestamp: new Date(Date.now() - 2000),
    direction: 'outbound',
  },
  {
    id: '5',
    method: 'GET',
    url: '/api/v1/public/forms/contact-us',
    status: 200,
    duration: 56,
    timestamp: new Date(Date.now() - 1000),
    direction: 'outbound',
    responseBody: { formId: 'form_789', fields: ['name', 'email', 'message'] },
  },
];

export function NetworkInspector() {
  const [requests, setRequests] = useState<NetworkRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredRequests = requests.filter((req) => {
    if (filter === 'success') return req.status < 400;
    if (filter === 'error') return req.status >= 400;
    return true;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'POST':
        return 'bg-muted/300/20 text-blue-400';
      case 'PUT':
        return 'bg-amber-500/20 text-amber-400';
      case 'PATCH':
        return 'bg-primary/50/20 text-purple-400';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusColor = (status: number) => {
    if (status < 300) return 'text-emerald-400';
    if (status < 400) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Request List */}
      <div className="w-1/2 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Network</span>
            <Badge variant="secondary" className="text-[10px]">
              {requests.length} requests
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'success' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('success')}
            >
              <Check className="w-3 h-3 mr-1" />
              Success
            </Button>
            <Button
              variant={filter === 'error' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('error')}
            >
              <X className="w-3 h-3 mr-1" />
              Errors
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRequests([])}
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Request List */}
        <ScrollArea className="flex-1">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No requests captured yet
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors',
                    selectedRequest?.id === request.id && 'bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Direction Icon */}
                    {request.direction === 'outbound' ? (
                      <ArrowUpRight className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}

                    {/* Method */}
                    <Badge className={cn('text-[10px] font-mono', getMethodColor(request.method))}>
                      {request.method}
                    </Badge>

                    {/* URL */}
                    <span className="flex-1 text-sm text-slate-300 truncate font-mono">
                      {request.url}
                    </span>

                    {/* Status */}
                    <span className={cn('text-xs font-mono', getStatusColor(request.status))}>
                      {request.status}
                    </span>

                    {/* Duration */}
                    <span className="text-xs text-slate-500 tabular-nums">
                      {request.duration}ms
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Request Details */}
      <div className="w-1/2 flex flex-col">
        {selectedRequest ? (
          <>
            {/* Details Header */}
            <div className="shrink-0 px-4 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Badge className={cn('text-[10px] font-mono', getMethodColor(selectedRequest.method))}>
                  {selectedRequest.method}
                </Badge>
                <span className={cn('text-xs font-mono', getStatusColor(selectedRequest.status))}>
                  {selectedRequest.status}
                </span>
                <span className="text-xs text-slate-500">
                  {selectedRequest.duration}ms
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1 truncate">
                {selectedRequest.url}
              </p>
            </div>

            {/* Details Body */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedRequest.requestBody && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-400 uppercase">Request Body</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 bg-slate-800/50 rounded-lg p-3 overflow-auto">
                      {JSON.stringify(selectedRequest.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedRequest.responseBody && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-400 uppercase">Response Body</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 bg-slate-800/50 rounded-lg p-3 overflow-auto">
                      {JSON.stringify(selectedRequest.responseBody, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-400 uppercase">Timing</span>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Timestamp</span>
                      <span className="text-slate-300 font-mono">
                        {selectedRequest.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-slate-300 font-mono">{selectedRequest.duration}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}
