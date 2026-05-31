'use client';

/**
 * AI Qualification Monitor Page
 * Real-time view of AI lead qualification process
 */

import { useState, useEffect } from 'react';
import {
  Brain,
  Target,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Activity,
  CheckCircle2,
  Zap,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { leadsService } from '@/services/api/leads.service';
import { aiService, IntentDetectionResponse, SentimentAnalysisResponse } from '@/services/api/ai.service';
import { useSimulatorTheme } from '../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface QualificationSession {
  id: string;
  leadName: string;
  source: string;
  status: 'processing' | 'completed' | 'pending';
  score: number;
  bant: {
    budget: { score: number; confidence: number; notes: string };
    authority: { score: number; confidence: number; notes: string };
    need: { score: number; confidence: number; notes: string };
    timeline: { score: number; confidence: number; notes: string };
  };
  conversation: { role: 'lead' | 'ai'; text: string }[];
  timestamp: Date;
}

const mockSessions: QualificationSession[] = [
  {
    id: '1',
    leadName: 'John Doe',
    source: 'Contact Form',
    status: 'completed',
    score: 85,
    bant: {
      budget: { score: 90, confidence: 95, notes: 'Enterprise budget confirmed ($50k+)' },
      authority: { score: 85, confidence: 88, notes: 'Decision maker, VP of Sales' },
      need: { score: 80, confidence: 92, notes: 'Clear pain points identified' },
      timeline: { score: 85, confidence: 85, notes: 'Looking to implement Q1 2025' },
    },
    conversation: [
      { role: 'lead', text: "I'm looking for a lead qualification solution for our sales team" },
      { role: 'ai', text: 'Great! Could you tell me about your current process and team size?' },
      { role: 'lead', text: 'We have 25 sales reps and manually qualify about 500 leads per month' },
      { role: 'ai', text: "That's a significant volume! What's your budget for this solution?" },
      { role: 'lead', text: 'We have budget approval for up to $50k annually' },
    ],
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    leadName: 'Sarah Johnson',
    source: 'Chat Widget',
    status: 'processing',
    score: 62,
    bant: {
      budget: { score: 50, confidence: 60, notes: 'Budget unclear, small business' },
      authority: { score: 70, confidence: 75, notes: 'Marketing Manager, may need approval' },
      need: { score: 75, confidence: 85, notes: 'Expressed interest in automation' },
      timeline: { score: 55, confidence: 50, notes: 'No specific timeline mentioned' },
    },
    conversation: [
      { role: 'lead', text: 'Hi, I saw your ad about AI lead qualification' },
      { role: 'ai', text: "Hello! I'd be happy to tell you more. What brings you here today?" },
      { role: 'lead', text: "We're a small marketing agency looking to improve our lead process" },
    ],
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '3',
    leadName: 'Mike Chen',
    source: 'SMS',
    status: 'pending',
    score: 0,
    bant: {
      budget: { score: 0, confidence: 0, notes: 'Not yet assessed' },
      authority: { score: 0, confidence: 0, notes: 'Not yet assessed' },
      need: { score: 0, confidence: 0, notes: 'Not yet assessed' },
      timeline: { score: 0, confidence: 0, notes: 'Not yet assessed' },
    },
    conversation: [
      { role: 'lead', text: 'Interested in learning more about your services' },
    ],
    timestamp: new Date(),
  },
];

const bantLabels = {
  budget: { label: 'Budget', icon: DollarSign, color: 'text-emerald-400' },
  authority: { label: 'Authority', icon: Users, color: 'text-blue-400' },
  need: { label: 'Need', icon: Target, color: 'text-violet-400' },
  timeline: { label: 'Timeline', icon: Clock, color: 'text-amber-400' },
};

export default function AIMonitorPage() {
  useSimulatorTheme();
  const [sessions, setSessions] = useState<QualificationSession[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<QualificationSession | null>(mockSessions[0]);
  const [, setIsLoadingLeads] = useState(true);
  const [, setRealLeadsCount] = useState(0);
  
  // AI Testing State
  const [testMessage, setTestMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentDetectionResponse | null>(null);
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysisResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch real leads data on mount
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoadingLeads(true);
      try {
        const response = await leadsService.getLeads({ pageSize: 10 });
        const leads = response.items || [];
        setRealLeadsCount(response.totalItems || 0);
        
        // Convert real leads to QualificationSession format
        if (leads.length > 0) {
          const realSessions: QualificationSession[] = leads.map((lead) => ({
            id: lead.id,
            leadName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown',
            source: lead.source || 'Unknown',
            status: lead.score ? 'completed' : 'pending',
            score: lead.score || 0,
            bant: {
              budget: { score: lead.score ? Math.round(lead.score * 0.9) : 0, confidence: 80, notes: 'Based on lead data' },
              authority: { score: lead.score ? Math.round(lead.score * 0.85) : 0, confidence: 75, notes: 'Inferred from context' },
              need: { score: lead.score ? Math.round(lead.score * 0.95) : 0, confidence: 85, notes: 'Analyzed from conversation' },
              timeline: { score: lead.score ? Math.round(lead.score * 0.8) : 0, confidence: 70, notes: 'Estimated timeline' },
            },
            conversation: [],
            timestamp: new Date(lead.createdAt),
          }));
          setSessions([...realSessions, ...mockSessions]);
          if (realSessions.length > 0) {
            setSelectedSession(realSessions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setIsLoadingLeads(false);
      }
    };
    fetchLeads();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.status === 'processing') {
            // Simulate score updates
            const newScore = Math.min(100, s.score + Math.floor(Math.random() * 5));
            return { ...s, score: newScore };
          }
          return s;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Score background helper - reserved for progress bar styling
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  void getScoreBg;

  const qualifiedCount = sessions.filter((s) => s.score >= 70).length;
  const avgScore = Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length);

  // AI Analysis function - calls real OpenAI endpoints
  const analyzeMessage = async () => {
    if (!testMessage.trim()) return;
    
    setIsAnalyzing(true);
    setAiError(null);
    setIntentResult(null);
    setSentimentResult(null);

    try {
      // Call both AI endpoints in parallel
      const [intent, sentiment] = await Promise.all([
        aiService.detectIntent({ message: testMessage }),
        aiService.analyzeSentiment({ message: testMessage }),
      ]);
      
      setIntentResult(intent);
      setSentimentResult(sentiment);
    } catch (error: unknown) {
      console.error('AI Analysis error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setAiError(err?.response?.data?.message || err?.message || 'Failed to analyze message');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-emerald-400';
      case 'Negative': return 'text-red-400';
      case 'Mixed': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">AI Qualification Monitor</h1>
                <p className="text-xs text-slate-400">Real-time BANT scoring visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 gap-1.5">
                <Sparkles className="w-3 h-3" />
                GPT-4 Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{sessions.length}</p>
              <p className="text-xs text-slate-500">Active Sessions</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-10 bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{qualifiedCount}</p>
              <p className="text-xs text-slate-500">Qualified (70+)</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-10 bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{avgScore}</p>
              <p className="text-xs text-slate-500">Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Testing Panel */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Test AI Analysis (Intent & Sentiment)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeMessage()}
                placeholder="Enter a message to analyze... (e.g., 'I'm interested in scheduling a demo')"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
              <Button 
                onClick={analyzeMessage} 
                disabled={isAnalyzing || !testMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="ml-2">Analyze</span>
              </Button>
            </div>
          </div>
          
          {/* AI Results */}
          {(intentResult || sentimentResult || aiError) && (
            <div className="flex gap-4">
              {aiError && (
                <div className="px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-xs text-red-400">{aiError}</p>
                </div>
              )}
              {intentResult && (
                <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-500">Intent</p>
                  <p className="text-sm font-medium text-purple-400">{intentResult.primaryIntent}</p>
                  <p className="text-xs text-slate-500">{Math.round(intentResult.confidence * 100)}% confidence</p>
                </div>
              )}
              {sentimentResult && (
                <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-500">Sentiment</p>
                  <p className={cn('text-sm font-medium', getSentimentColor(sentimentResult.sentiment))}>
                    {sentimentResult.sentiment}
                  </p>
                  <p className="text-xs text-slate-500">Score: {sentimentResult.score.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions List */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="shrink-0 p-3 border-b border-slate-800">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Qualification Sessions
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-all border',
                    selectedSession?.id === session.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={selectedSession?.id === session.id ? 'bg-purple-500/30' : 'bg-slate-700'}>
                          {session.leadName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{session.leadName}</p>
                        <p className="text-xs text-slate-500">{session.source}</p>
                      </div>
                    </div>
                    <div className={cn(
                      'text-lg font-bold tabular-nums',
                      getScoreColor(session.score)
                    )}>
                      {session.score}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px]',
                        session.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
                        session.status === 'processing' && 'bg-blue-500/20 text-blue-400',
                        session.status === 'pending' && 'bg-slate-500/20 text-slate-400'
                      )}
                    >
                      {session.status === 'processing' && (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      {session.status}
                    </Badge>
                    <span className="text-[10px] text-slate-500">
                      {session.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Session Details */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {selectedSession ? (
            <>
              {/* Score Overview */}
              <div className="shrink-0 p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedSession.leadName}</h2>
                    <p className="text-sm text-slate-400">Lead from {selectedSession.source}</p>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-5xl font-bold tabular-nums',
                      getScoreColor(selectedSession.score)
                    )}>
                      {selectedSession.score}
                    </div>
                    <p className="text-sm text-slate-500">Overall Score</p>
                  </div>
                </div>

                {/* BANT Scores */}
                <div className="grid grid-cols-4 gap-4">
                  {(Object.entries(selectedSession.bant) as [keyof typeof bantLabels, typeof selectedSession.bant.budget][]).map(([key, data]) => {
                    const config = bantLabels[key];
                    return (
                      <Card key={key} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <config.icon className={cn('w-4 h-4', config.color)} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <span className={cn('text-lg font-bold', getScoreColor(data.score))}>
                              {data.score}
                            </span>
                          </div>
                          <Progress
                            value={data.score}
                            className="h-2 mb-2"
                          />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Confidence</span>
                            <span className="text-slate-400">{data.confidence}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Details Grid */}
              <div className="flex-1 flex overflow-hidden">
                {/* AI Analysis */}
                <div className="flex-1 border-r border-slate-800 flex flex-col">
                  <div className="shrink-0 px-4 py-3 border-b border-slate-800">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Analysis
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {(Object.entries(selectedSession.bant) as [keyof typeof bantLabels, typeof selectedSession.bant.budget][]).map(([key, data]) => {
                        const config = bantLabels[key];
                        return (
                          <div key={key} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <config.icon className={cn('w-4 h-4', config.color)} />
                              <span className="font-medium text-sm">{config.label}</span>
                              <Badge variant="secondary" className="ml-auto text-[10px]">
                                Score: {data.score}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{data.notes}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Conversation */}
                <div className="w-96 flex flex-col">
                  <div className="shrink-0 px-4 py-3 border-b border-slate-800">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      Conversation
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {selectedSession.conversation.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex gap-2',
                            msg.role === 'ai' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {msg.role === 'lead' && (
                            <Avatar className="w-6 h-6 shrink-0">
                              <AvatarFallback className="bg-slate-700 text-xs">
                                {selectedSession.leadName[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn(
                            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                            msg.role === 'lead'
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-purple-600 text-white'
                          )}>
                            {msg.text}
                          </div>
                          {msg.role === 'ai' && (
                            <Avatar className="w-6 h-6 shrink-0">
                              <AvatarFallback className="bg-purple-500/30">
                                <Brain className="w-3 h-3 text-purple-400" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Brain className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p>Select a session to view AI analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
