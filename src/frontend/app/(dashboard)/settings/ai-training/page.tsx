'use client';

/**
 * AI Training Configuration Page
 * Sprint 37 Feature - Configure AI tone, qualification criteria, and training
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Sparkles,
  MessageSquare,
  Target,
  Play,
  Save,
  Loader2,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useAiTrainingConfig,
  useUpdateAiTone,
  useUpdateQualificationCriteria,
  useTestAiModel,
  useTriggerTraining,
  useUpdateAutoResponse,
} from '@/hooks/api/useAiTraining';
import { Switch } from '@/components/ui/switch';
import { simulatorService, AIAnalysisResult } from '@/services/api/simulator.service';

export default function AITrainingPage() {
  const [activeTab, setActiveTab] = useState('tone');
  const [testInput, setTestInput] = useState('');
  const [, setTestResult] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tone settings state
  const [toneSettings, setToneSettings] = useState({
    tone: 'professional',
    formality: 'formal',
    personalityTraits: ['helpful', 'knowledgeable'],
  });

  // Qualification criteria state
  const [qualificationCriteria, setQualificationCriteria] = useState({
    budgetWeight: 30,
    authorityWeight: 25,
    needWeight: 25,
    timelineWeight: 20,
    minScoreToQualify: 60,
  });

  // API hooks
  const { data: config, isLoading } = useAiTrainingConfig();

  // Initialize state from API data when it loads
  useEffect(() => {
    if (config) {
      if (config.toneSettings) {
        setToneSettings({
          tone: config.toneSettings.tone || 'professional',
          formality: config.toneSettings.formality || 'formal',
          personalityTraits: config.toneSettings.personalityTraits || ['helpful', 'knowledgeable'],
        });
      }
      if (config.qualificationCriteria) {
        setQualificationCriteria({
          budgetWeight: config.qualificationCriteria.budgetWeight ?? 30,
          authorityWeight: config.qualificationCriteria.authorityWeight ?? 25,
          needWeight: config.qualificationCriteria.needWeight ?? 25,
          timelineWeight: config.qualificationCriteria.timelineWeight ?? 20,
          minScoreToQualify: config.qualificationCriteria.minScoreToQualify ?? 60,
        });
      }
    }
  }, [config]);
  const updateToneMutation = useUpdateAiTone();
  const updateCriteriaMutation = useUpdateQualificationCriteria();
  const _testModelMutation = useTestAiModel();
  const updateAutoResponseMutation = useUpdateAutoResponse();
  const triggerTrainingMutation = useTriggerTraining();

  const handleSaveTone = async () => {
    try {
      await updateToneMutation.mutateAsync(toneSettings);
      toast.success('AI tone settings saved');
    } catch {
      toast.error('Failed to save tone settings');
    }
  };

  const handleSaveCriteria = async () => {
    const total = qualificationCriteria.budgetWeight + 
                  qualificationCriteria.authorityWeight + 
                  qualificationCriteria.needWeight + 
                  qualificationCriteria.timelineWeight;
    
    if (total !== 100) {
      toast.error('BANT weights must sum to 100');
      return;
    }

    try {
      await updateCriteriaMutation.mutateAsync(qualificationCriteria);
      toast.success('Qualification criteria saved');
    } catch {
      toast.error('Failed to save criteria');
    }
  };

  const handleTestModel = async () => {
    if (!testInput.trim()) return;
    
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setTestResult(null);
    
    try {
      // Use real AI analysis via simulator service
      const analysis = await simulatorService.analyzeMessage(testInput);
      setAiAnalysis(analysis);
      setTestResult(`Intent: ${analysis.intent.primaryIntent} (${Math.round(analysis.intent.confidence * 100)}%)\nSentiment: ${analysis.sentiment.sentiment} (score: ${analysis.sentiment.score.toFixed(2)})`);
      toast.success(`AI analysis complete in ${analysis.processingTimeMs}ms`);
    } catch (error) {
      console.error('AI test failed:', error);
      toast.error('AI test failed - check backend connection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerTraining = async () => {
    try {
      await triggerTrainingMutation.mutateAsync();
      toast.success('Training job started');
    } catch {
      toast.error('Failed to start training');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const totalWeight = qualificationCriteria.budgetWeight + 
                      qualificationCriteria.authorityWeight + 
                      qualificationCriteria.needWeight + 
                      qualificationCriteria.timelineWeight;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Training</h1>
          <p className="text-sm text-gray-500">
            Configure your AI assistant&apos;s personality and qualification criteria
          </p>
        </div>
        <Button
          onClick={handleTriggerTraining}
          disabled={triggerTrainingMutation.isPending}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {triggerTrainingMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Zap className="size-4" />
          )}
          Train Model
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tone" className="gap-2">
            <MessageSquare className="size-4" />
            Tone & Personality
          </TabsTrigger>
          <TabsTrigger value="qualification" className="gap-2">
            <Target className="size-4" />
            Qualification Criteria
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <Play className="size-4" />
            Test AI
          </TabsTrigger>
        </TabsList>

        {/* Tone & Personality Tab */}
        <TabsContent value="tone" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Brain className="size-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">AI Personality</h3>
                <p className="text-sm text-gray-500">Define how your AI communicates</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Communication Tone</Label>
                <Select
                  value={toneSettings.tone}
                  onValueChange={(v) => setToneSettings({ ...toneSettings, tone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formality Level</Label>
                <Select
                  value={toneSettings.formality}
                  onValueChange={(v) => setToneSettings({ ...toneSettings, formality: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="semi-formal">Semi-Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Personality Traits</Label>
              <div className="flex flex-wrap gap-2">
                {['helpful', 'knowledgeable', 'friendly', 'empathetic', 'concise', 'detailed'].map((trait) => (
                  <Badge
                    key={trait}
                    variant={toneSettings.personalityTraits.includes(trait) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      const traits = toneSettings.personalityTraits.includes(trait)
                        ? toneSettings.personalityTraits.filter(t => t !== trait)
                        : [...toneSettings.personalityTraits, trait];
                      setToneSettings({ ...toneSettings, personalityTraits: traits });
                    }}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveTone}
                disabled={updateToneMutation.isPending}
                className="gap-2"
              >
                {updateToneMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Settings
              </Button>
            </div>
          </Card>

          {/* AI Auto-Response Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Auto-Response</h3>
                  <p className="text-sm text-gray-500">
                    Allow AI to automatically respond to incoming messages
                  </p>
                </div>
              </div>
              <Switch
                checked={config?.autoResponse?.enabled ?? false}
                onCheckedChange={async (checked) => {
                  try {
                    await updateAutoResponseMutation.mutateAsync(checked);
                    toast.success(checked ? 'AI auto-response enabled' : 'AI auto-response disabled');
                  } catch {
                    toast.error('Failed to update auto-response setting');
                  }
                }}
                disabled={updateAutoResponseMutation.isPending}
              />
            </div>
            {config?.autoResponse?.enabled && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Sparkles className="mr-2 inline-block size-4" />
                AI will automatically respond to leads based on your configured tone and knowledge base.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Qualification Criteria Tab */}
        <TabsContent value="qualification" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Target className="size-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">BANT Scoring Weights</h3>
                <p className="text-sm text-gray-500">Configure how leads are qualified</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Budget Weight</Label>
                  <span className="text-sm font-medium">{qualificationCriteria.budgetWeight}%</span>
                </div>
                <Slider
                  value={[qualificationCriteria.budgetWeight]}
                  onValueChange={([v]) => setQualificationCriteria({ ...qualificationCriteria, budgetWeight: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Authority Weight</Label>
                  <span className="text-sm font-medium">{qualificationCriteria.authorityWeight}%</span>
                </div>
                <Slider
                  value={[qualificationCriteria.authorityWeight]}
                  onValueChange={([v]) => setQualificationCriteria({ ...qualificationCriteria, authorityWeight: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Need Weight</Label>
                  <span className="text-sm font-medium">{qualificationCriteria.needWeight}%</span>
                </div>
                <Slider
                  value={[qualificationCriteria.needWeight]}
                  onValueChange={([v]) => setQualificationCriteria({ ...qualificationCriteria, needWeight: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Timeline Weight</Label>
                  <span className="text-sm font-medium">{qualificationCriteria.timelineWeight}%</span>
                </div>
                <Slider
                  value={[qualificationCriteria.timelineWeight]}
                  onValueChange={([v]) => setQualificationCriteria({ ...qualificationCriteria, timelineWeight: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className={cn(
                "p-3 rounded-lg text-sm",
                totalWeight === 100 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                Total: {totalWeight}% {totalWeight === 100 ? '✓' : '(must equal 100%)'}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Minimum Score to Qualify</Label>
                  <span className="text-sm font-medium">{qualificationCriteria.minScoreToQualify}</span>
                </div>
                <Slider
                  value={[qualificationCriteria.minScoreToQualify]}
                  onValueChange={([v]) => setQualificationCriteria({ ...qualificationCriteria, minScoreToQualify: v })}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveCriteria}
                disabled={updateCriteriaMutation.isPending || totalWeight !== 100}
                className="gap-2"
              >
                {updateCriteriaMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Criteria
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Test AI Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Test Your AI</h3>
                <p className="text-sm text-gray-500">See how your AI responds to different inputs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Test Input</Label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter a sample message to test the AI response..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleTestModel}
                disabled={isAnalyzing || !testInput.trim()}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Analyze with AI
              </Button>

              {aiAnalysis && (
                <div className="mt-4 space-y-4">
                  {/* Intent Analysis */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="size-4 text-purple-600" />
                      <Label className="text-xs text-purple-700 uppercase font-semibold">Intent Detection</Label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{aiAnalysis.intent.primaryIntent}</span>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        {Math.round(aiAnalysis.intent.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="size-4 text-blue-600" />
                      <Label className="text-xs text-blue-700 uppercase font-semibold">Sentiment Analysis</Label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{aiAnalysis.sentiment.sentiment}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Score: {aiAnalysis.sentiment.score.toFixed(2)}</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                          {Math.round(aiAnalysis.sentiment.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Model: {aiAnalysis.model}</span>
                    <span>Processing time: {aiAnalysis.processingTimeMs}ms</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
