'use client';

import { useState } from 'react';
import { EnhancedTranscript, SentimentType, formatTimestamp, searchTranscript, filterBySentiment, filterBySpeaker } from '@/types/voice-transcript';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Play, Download, Smile, Meh, Frown, Star, User, Headphones } from 'lucide-react';

interface EnhancedTranscriptViewerProps {
  transcript: EnhancedTranscript;
  onPlaySegment?: (timestamp: number) => void;
}

export function EnhancedTranscriptViewer({ transcript, onPlaySegment }: EnhancedTranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [speakerFilter, setSpeakerFilter] = useState<'agent' | 'customer' | 'all'>('all');

  const filteredSegments = filterBySpeaker(
    filterBySentiment(
      searchQuery ? searchTranscript(transcript.segments, searchQuery) : transcript.segments,
      sentimentFilter
    ),
    speakerFilter
  );

  const getSentimentIcon = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="size-4 text-green-500" />;
      case 'negative':
        return <Frown className="size-4 text-red-500" />;
      default:
        return <Meh className="size-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-muted/20 border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Metadata */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-navy">Call Transcript</h2>
            <p className="text-sm text-text-secondary mt-1">
              {transcript.metadata.date.toLocaleDateString()} • {formatTimestamp(transcript.metadata.duration)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Headphones className="size-4 text-brand-purple" />
            <span className="text-sm text-text-secondary">Agent:</span>
            <span className="text-sm font-medium text-text-navy">{transcript.metadata.agentName || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="size-4 text-brand-orange" />
            <span className="text-sm text-text-secondary">Customer:</span>
            <span className="text-sm font-medium text-text-navy">{transcript.metadata.customerName || 'Unknown'}</span>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Smile className="size-5 text-green-500" />
            <div>
              <p className="text-xs text-text-secondary">Positive</p>
              <p className="text-lg font-bold text-green-600">{transcript.sentiment.breakdown.positive.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Meh className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-text-secondary">Neutral</p>
              <p className="text-lg font-bold text-muted-foreground">{transcript.sentiment.breakdown.neutral.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Frown className="size-5 text-red-500" />
            <div>
              <p className="text-xs text-text-secondary">Negative</p>
              <p className="text-lg font-bold text-red-600">{transcript.sentiment.breakdown.negative.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              className="pl-10"
            />
          </div>

          <Select value={sentimentFilter} onValueChange={(value: typeof sentimentFilter) => setSentimentFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={speakerFilter} onValueChange={(value: typeof speakerFilter) => setSpeakerFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by speaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Speakers</SelectItem>
              <SelectItem value="agent">Agent Only</SelectItem>
              <SelectItem value="customer">Customer Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Key Moments */}
      {transcript.sentiment.keyMoments.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-text-navy mb-3 flex items-center gap-2">
            <Star className="size-5 text-yellow-500" />
            Key Moments
          </h3>
          <div className="space-y-2">
            {transcript.sentiment.keyMoments.map((moment, index) => (
              <button
                key={index}
                onClick={() => onPlaySegment?.(moment.timestamp)}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-brand-purple">{formatTimestamp(moment.timestamp)}</span>
                  <Badge variant="outline" className="text-xs">
                    {moment.type}
                  </Badge>
                </div>
                <p className="text-sm text-text-navy">{moment.text}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Transcript Segments */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-navy">Transcript</h3>
          <span className="text-sm text-text-secondary">
            {filteredSegments.length} of {transcript.segments.length} segments
          </span>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredSegments.map((segment) => (
            <div
              key={segment.id}
              className={`p-4 rounded-lg border ${getSentimentColor(segment.sentiment)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={segment.speaker === 'agent' ? 'default' : 'secondary'} className="text-xs">
                    {segment.speaker === 'agent' ? 'Agent' : 'Customer'}
                  </Badge>
                  <span className="text-xs text-text-secondary">{formatTimestamp(segment.timestamp)}</span>
                  {segment.isKeyMoment && <Star className="size-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(segment.sentiment)}
                  {onPlaySegment && (
                    <button
                      onClick={() => onPlaySegment(segment.timestamp)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Play className="size-3 text-brand-purple" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-navy mb-2">{segment.text}</p>

              {segment.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {segment.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Summary & Action Items */}
      {(transcript.summary || transcript.actionItems) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transcript.summary && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-text-navy mb-3">Summary</h3>
              <p className="text-sm text-text-secondary">{transcript.summary}</p>
            </Card>
          )}

          {transcript.actionItems && transcript.actionItems.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-text-navy mb-3">Action Items</h3>
              <ul className="space-y-2">
                {transcript.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-brand-purple">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
