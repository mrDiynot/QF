/**
 * Enhanced Voice Transcript Type Definitions
 * Advanced transcript viewer with sentiment analysis
 */

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: number; // seconds from start
  duration: number; // seconds
  sentiment: SentimentType;
  confidence: number; // 0-1
  keywords: string[];
  isKeyMoment?: boolean;
}

export interface SentimentAnalysis {
  overall: SentimentType;
  score: number; // -1 to 1
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyMoments: Array<{
    timestamp: number;
    type: 'positive' | 'negative' | 'question' | 'objection' | 'commitment';
    text: string;
  }>;
}

export interface TranscriptMetadata {
  callId: string;
  duration: number;
  recordingUrl?: string;
  date: Date;
  customerName?: string;
  agentName?: string;
  outcome?: 'qualified' | 'not_qualified' | 'callback' | 'no_answer';
  tags: string[];
}

export interface EnhancedTranscript {
  metadata: TranscriptMetadata;
  segments: TranscriptSegment[];
  sentiment: SentimentAnalysis;
  summary?: string;
  actionItems?: string[];
}

// Helper to calculate sentiment from segments
export const calculateSentiment = (segments: TranscriptSegment[]): SentimentAnalysis => {
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  segments.forEach(segment => {
    sentimentCounts[segment.sentiment]++;
  });

  const total = segments.length;
  const breakdown = {
    positive: (sentimentCounts.positive / total) * 100,
    neutral: (sentimentCounts.neutral / total) * 100,
    negative: (sentimentCounts.negative / total) * 100,
  };

  // Calculate overall sentiment score (-1 to 1)
  const score = (sentimentCounts.positive - sentimentCounts.negative) / total;

  // Determine overall sentiment
  let overall: SentimentType = 'neutral';
  if (score > 0.2) overall = 'positive';
  else if (score < -0.2) overall = 'negative';

  // Extract key moments
  const keyMoments = segments
    .filter(s => s.isKeyMoment)
    .map(s => ({
      timestamp: s.timestamp,
      type: determineKeyMomentType(s),
      text: s.text,
    }));

  return {
    overall,
    score,
    breakdown,
    keyMoments,
  };
};

const determineKeyMomentType = (segment: TranscriptSegment): 'positive' | 'negative' | 'question' | 'objection' | 'commitment' => {
  const text = segment.text.toLowerCase();
  
  if (text.includes('?')) return 'question';
  if (text.includes('but') || text.includes('however') || text.includes('concern')) return 'objection';
  if (text.includes('yes') || text.includes('agree') || text.includes('sounds good')) return 'commitment';
  if (segment.sentiment === 'negative') return 'negative';
  return 'positive';
};

// Format timestamp for display
export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Search transcript
export const searchTranscript = (
  segments: TranscriptSegment[],
  query: string
): TranscriptSegment[] => {
  const lowerQuery = query.toLowerCase();
  return segments.filter(segment =>
    segment.text.toLowerCase().includes(lowerQuery) ||
    segment.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
};

// Filter by sentiment
export const filterBySentiment = (
  segments: TranscriptSegment[],
  sentiment: SentimentType | 'all'
): TranscriptSegment[] => {
  if (sentiment === 'all') return segments;
  return segments.filter(s => s.sentiment === sentiment);
};

// Filter by speaker
export const filterBySpeaker = (
  segments: TranscriptSegment[],
  speaker: 'agent' | 'customer' | 'all'
): TranscriptSegment[] => {
  if (speaker === 'all') return segments;
  return segments.filter(s => s.speaker === speaker);
};
