'use client';

import DOMPurify from 'dompurify';

/**
 * Call Transcript Viewer Component
 * Displays call recordings with AI-generated transcripts and insights
 *
 * TODO: Future AI Enhancements (when backend supports):
 * - Structured transcript segments with timestamps
 * - Sentiment analysis per segment
 * - Intent detection
 * - AI-generated summary and key topics
 * - Action item extraction
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Search,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVoiceCall } from '@/hooks/api/useVoiceCalls';

interface CallTranscriptProps {
  callId: string;
  className?: string;
}

export function CallTranscript({ callId, className }: CallTranscriptProps) {
  const { data: call, isLoading, error } = useVoiceCall(callId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy transcript
  const copyTranscript = () => {
    if (!call?.transcript) {
      toast.error('No transcript available');
      return;
    }
    navigator.clipboard.writeText(call.transcript);
    setCopied(true);
    toast.success('Transcript copied');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download recording
  const downloadRecording = () => {
    if (!call?.recordingUrl) {
      toast.error('No recording available');
      return;
    }
    window.open(call.recordingUrl, '_blank');
  };

  // Highlight search query in transcript
  const highlightedTranscript = useMemo(() => {
    if (!call?.transcript || !searchQuery) return call?.transcript || '';

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const raw = call.transcript.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    return DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['mark'], ALLOWED_ATTR: ['class'] });
  }, [call?.transcript, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading call transcript...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="size-8 text-red-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Failed to load call</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </Card>
    );
  }

  // No call data
  if (!call) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="size-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Call not found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("grid lg:grid-cols-3 gap-6", className)}>
      {/* Main Transcript */}
      <div className="lg:col-span-2 space-y-4">
        {/* Audio Player */}
        {call.recordingUrl && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              {/* Play Controls */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8">
                  <SkipBack className="size-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="size-12 rounded-full bg-primary hover:bg-purple-700"
                >
                  {isPlaying ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5 ml-0.5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <SkipForward className="size-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 space-y-1">
                <Slider
                  value={[currentTime]}
                  max={call.durationSeconds}
                  step={1}
                  onValueChange={([v]) => setCurrentTime(v)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(call.durationSeconds)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
                  className="w-20"
                />
              </div>

              {/* Actions */}
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadRecording}>
                <Download className="size-4" />
                Download
              </Button>
            </div>
          </Card>
        )}

        {/* Transcript */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={copyTranscript} className="gap-2">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                Copy
              </Button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2">
            {call.transcript ? (
              <div
                className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedTranscript }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">No transcript available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transcript will be generated after the call completes
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Sidebar - Call Info */}
      <div className="space-y-4">
        {/* Call Info */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-lg">
              {call.contactName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">{call.contactName || 'Unknown'}</h4>
              <p className="text-sm text-muted-foreground truncate">{call.phoneNumber}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Direction</span>
              <Badge variant={call.direction === 'inbound' ? 'default' : 'secondary'}>
                {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                {call.status}
              </Badge>
            </div>
            {call.outcome && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Outcome</span>
                <Badge variant="outline" className="text-xs">
                  {call.outcome.replace('_', ' ')}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="size-4" />
                Duration
              </span>
              <span className="font-medium text-foreground">{formatTime(call.durationSeconds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Started</span>
              <span className="text-foreground">
                {new Date(call.startedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* AI Insights Placeholder - TODO: Enable when backend supports */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-sm">AI Insights Coming Soon</h4>
            <p className="text-xs text-muted-foreground">
              Enhanced transcript analysis with sentiment detection, key topics extraction, and automated action items will be available in a future update.
            </p>
          </div>
        </Card>

        {/* Agent Info */}
        {call.agentName && (
          <Card className="p-4">
            <h4 className="font-semibold text-foreground mb-2 text-sm">Voice Agent</h4>
            <p className="text-sm text-muted-foreground">{call.agentName}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
