'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Mic
} from 'lucide-react';
import { voiceCallsService, type VoiceCallDetail } from '@/services/api/voice-calls.service';
import { useChannelByType } from '@/hooks/api/useConversations';
import { ChannelSetupDialog } from '@/components/channels/ChannelSetupDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function VoiceChannelPage() {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const queryClient = useQueryClient();

  // Use standardized hook for consistent channel fetching
  const { data: voiceChannel } = useChannelByType('voice');

  // Fetch call history from API
  const { data: callsResponse, isLoading: callsLoading } = useQuery({
    queryKey: ['voice-calls'],
    queryFn: () => voiceCallsService.getCalls({ page: 1, pageSize: 50 }),
  });

  const calls = callsResponse?.calls || [];

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['voice-calls', 'analytics'],
    queryFn: () => voiceCallsService.getAnalytics(),
  });

  // Filter calls based on search query
  const filteredCalls = calls.filter((call: VoiceCallDetail) =>
    call.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.phoneNumber.includes(searchQuery)
  );

  // Use analytics from API or calculate from calls
  const stats = {
    totalCalls: analytics?.totalCalls ?? calls.length,
    inboundCalls: analytics?.byDirection?.find(d => d.direction === 'inbound')?.count ?? calls.filter((c: VoiceCallDetail) => c.direction === 'inbound').length,
    outboundCalls: analytics?.byDirection?.find(d => d.direction === 'outbound')?.count ?? calls.filter((c: VoiceCallDetail) => c.direction === 'outbound').length,
    missedCalls: calls.filter((c: VoiceCallDetail) => c.status === 'missed').length,
    averageDuration: analytics?.averageDurationSeconds ?? (calls.length > 0 
      ? Math.round(calls.reduce((sum: number, c: VoiceCallDetail) => sum + c.durationSeconds, 0) / calls.length)
      : 0),
    answerRate: analytics?.successRate ?? (calls.length > 0
      ? Math.round((calls.filter((c: VoiceCallDetail) => c.status === 'completed').length / calls.length) * 100)
      : 0),
  };

  const selectedCallData = calls.find((c: VoiceCallDetail) => c.id === selectedCall);

  // Callback mutation
  const callbackMutation = useMutation({
    mutationFn: (callId: string) => voiceCallsService.callback(callId),
    onSuccess: (newCall) => {
      toast.success(`Calling back ${newCall.contactName || newCall.phoneNumber}...`);
      queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate callback');
    },
  });

  // View transcript mutation
  const transcriptMutation = useMutation({
    mutationFn: (callId: string) => voiceCallsService.getTranscript(callId),
    onSuccess: (data) => {
      if (data.transcript) {
        toast.success('Transcript loaded');
      } else {
        toast.info('No transcript available for this call');
      }
    },
    onError: () => {
      toast.error('Failed to load transcript');
    },
  });

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Phone className="size-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-navy">Voice Channel</h1>
                <p className="text-sm text-text-secondary mt-1">
                  {voiceChannel?.phoneNumber || 'No phone number configured'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={voiceChannel?.isActive ? 'default' : 'secondary'}>
              {voiceChannel?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <PhoneCall className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-text-secondary">
              {stats.inboundCalls} in / {stats.outboundCalls} out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Calls</CardTitle>
            <PhoneMissed className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missedCalls}</div>
            <p className="text-xs text-text-secondary">Needs follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.averageDuration / 60)}:{(stats.averageDuration % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-text-secondary">Minutes per call</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.answerRate}%</div>
            <p className="text-xs text-text-secondary">Calls answered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Call History */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-400px)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Call History</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="size-4" />
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                <Input
                  placeholder="Search calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-550px)]">
                {callsLoading ? (
                  <div className="p-8 text-center text-text-secondary">
                    Loading calls...
                  </div>
                ) : filteredCalls.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">
                    No calls found
                  </div>
                ) : (
                  filteredCalls.map((call) => (
                    <button
                      key={call.id}
                      onClick={() => setSelectedCall(call.id)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedCall === call.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          call.direction === 'inbound' 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          {call.direction === 'inbound' ? (
                            <PhoneIncoming className="size-4 text-blue-600" />
                          ) : (
                            <PhoneOutgoing className="size-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">
                              {call.contactName || 'Unknown'}
                            </p>
                            <Badge 
                              variant={
                                call.status === 'completed' ? 'default' :
                                call.status === 'missed' ? 'destructive' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {call.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-1">
                            {call.phoneNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {call.durationSeconds > 0 && (
                              <span className="text-xs text-text-secondary">
                                {Math.floor(call.durationSeconds / 60)}:{(call.durationSeconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                            <span className="text-xs text-text-secondary">
                              {formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Details */}
        <div className="col-span-7">
          <Card className="h-[calc(100vh-400px)]">
            {selectedCallData ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedCallData.contactName || 'Unknown Caller'}
                      </CardTitle>
                      <p className="text-sm text-text-secondary mt-1">
                        {selectedCallData.direction === 'inbound' 
                          ? `From: ${selectedCallData.phoneNumber}` 
                          : `To: ${selectedCallData.phoneNumber}`}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        selectedCallData.status === 'completed' ? 'default' :
                        selectedCallData.status === 'missed' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {selectedCallData.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Call Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">Duration</p>
                      <p className="text-lg font-semibold">
                        {selectedCallData.durationSeconds > 0 
                          ? `${Math.floor(selectedCallData.durationSeconds / 60)}:${(selectedCallData.durationSeconds % 60).toString().padStart(2, '0')}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Time</p>
                      <p className="text-lg font-semibold">
                        {formatDistanceToNow(new Date(selectedCallData.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {selectedCallData.outcome && (
                      <div>
                        <p className="text-sm text-text-secondary">Outcome</p>
                        <Badge variant="secondary">
                          {selectedCallData.outcome}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Recording */}
                  {selectedCallData.recordingUrl && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recording</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="size-4 mr-2" />
                          ) : (
                            <Play className="size-4 mr-2" />
                          )}
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="size-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 w-1/3"></div>
                      </div>
                    </div>
                  )}

                  {/* Transcript */}
                  {selectedCallData.transcript && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Transcript</p>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-text-secondary">
                          {selectedCallData.transcript}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => callbackMutation.mutate(selectedCallData.id)}
                      disabled={callbackMutation.isPending}
                    >
                      <PhoneCall className="size-4 mr-2" />
                      {callbackMutation.isPending ? 'Calling...' : 'Call Back'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => transcriptMutation.mutate(selectedCallData.id)}
                      disabled={transcriptMutation.isPending}
                    >
                      <Mic className="size-4 mr-2" />
                      {transcriptMutation.isPending ? 'Loading...' : 'View Full Transcript'}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <Phone className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Select a call to view details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Channel Setup Dialog */}
      <ChannelSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        channelType="Voice"
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['channels'] });
          setShowSetupDialog(false);
        }}
      />
    </div>
  );
}
