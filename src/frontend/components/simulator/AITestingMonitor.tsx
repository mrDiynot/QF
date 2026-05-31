'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BANTScore {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
}

interface AITestResult {
  id: string;
  timestamp: Date;
  input: string;
  bant: BANTScore;
  overallScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  qualification: 'hot' | 'warm' | 'cold';
  processingTime: number;
}

export function AITestingMonitor() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<AITestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<AITestResult | null>(null);

  const testScenarios = [
    "I'm looking for a CRM solution. We have a budget of $10k and need it by next month.",
    "Just browsing, not sure what we need yet.",
    "I'm the CEO and we need to improve our lead management. Budget is approved.",
    "Can you tell me more about pricing? We're a small team of 5.",
  ];

  const runAITest = async () => {
    setIsRunning(true);
    
    for (const scenario of testScenarios) {
      const startTime = Date.now();
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const processingTime = Date.now() - startTime;
      
      // Generate mock BANT scores
      const bant: BANTScore = {
        budget: Math.floor(Math.random() * 40) + 60,
        authority: Math.floor(Math.random() * 40) + 60,
        need: Math.floor(Math.random() * 40) + 60,
        timeline: Math.floor(Math.random() * 40) + 60,
      };
      
      const overallScore = Math.floor(
        (bant.budget + bant.authority + bant.need + bant.timeline) / 4
      );
      
      const result: AITestResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        input: scenario,
        bant,
        overallScore,
        sentiment: overallScore > 75 ? 'positive' : overallScore > 50 ? 'neutral' : 'negative',
        qualification: overallScore > 75 ? 'hot' : overallScore > 50 ? 'warm' : 'cold',
        processingTime,
      };
      
      setCurrentTest(result);
      setTestResults(prev => [result, ...prev]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    setCurrentTest(null);
    toast.success('AI testing complete');
  };

  const getQualificationColor = (qual: string) => {
    switch (qual) {
      case 'hot':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warm':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cold':
        return 'bg-muted/50 text-info border-border';
      default:
        return 'bg-muted/40 text-foreground/80 border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="size-5 text-primary" />
              <CardTitle>AI Qualification Testing</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runAITest}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="size-4" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Run Tests
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTestResults([])}
                disabled={isRunning}
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Test */}
          {currentTest && (
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="size-5 text-primary animate-spin" />
                <span className="font-semibold text-foreground">Processing...</span>
              </div>
              <p className="text-sm text-foreground/80 mb-4">{currentTest.input}</p>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(currentTest.bant).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium capitalize">{key}</span>
                      <span className="font-semibold">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Test Results</h3>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <AlertCircle className="size-12 mx-auto mb-3 text-muted-foreground/60" />
                <p>No test results yet. Click &quot;Run Tests&quot; to start AI qualification testing.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {testResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{result.input}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getQualificationColor(result.qualification)}>
                            {result.qualification.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">
                            Score: {result.overallScore}%
                          </Badge>
                          <Badge variant="outline">
                            {result.processingTime}ms
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {Object.entries(result.bant).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium capitalize">{key}</span>
                            <span className="font-semibold">{value}%</span>
                          </div>
                          <Progress value={value} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
