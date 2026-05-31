'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  History,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScoreColor, getScoreBgColor } from '@/hooks/useLeadScoring';
import { BantAnalysis } from './BantAnalysis';
import { ScoreHistory } from './ScoreHistory';

interface LeadQualificationCardProps {
  leadId: string;
  conversationId?: string;
  currentScore: number;
  previousScore?: number;
  status: string;
  isQualified?: boolean;
  className?: string;
  onViewDetails?: () => void;
}

export function LeadQualificationCard({
  leadId,
  conversationId,
  currentScore,
  previousScore,
  status,
  isQualified,
  className,
  onViewDetails,
}: LeadQualificationCardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const scoreChange = previousScore !== undefined ? currentScore - previousScore : 0;
  const qualificationThreshold = 70; // This should come from config

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'qualified':
      case 'opportunity':
        return 'default';
      case 'engaged':
        return 'secondary';
      case 'new':
      case 'contacted':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Lead Qualification
            </CardTitle>
            <CardDescription>AI-powered scoring and analysis</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Overview */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div
            className={cn(
              'flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold',
              getScoreBgColor(currentScore),
              getScoreColor(currentScore)
            )}
          >
            {currentScore}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Qualification Score</span>
              {scoreChange !== 0 && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm',
                    scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {scoreChange > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </div>
              )}
            </div>
            <Progress value={currentScore} className="h-2 mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Qualified: {qualificationThreshold}
              </span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Qualification Status */}
        {isQualified !== undefined && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg',
              isQualified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            )}
          >
            {isQualified ? (
              <>
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Lead is qualified!</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Needs {qualificationThreshold - currentScore} more points to qualify
                </span>
              </>
            )}
          </div>
        )}

        {/* Tabs for BANT and History */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              BANT Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Score History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {conversationId ? (
              <BantAnalysis conversationId={conversationId} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversation available for BANT analysis</p>
                <p className="text-sm">Start a conversation to see qualification signals</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScoreHistory leadId={leadId} limit={5} showRecalculate />
          </TabsContent>
        </Tabs>

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewDetails}
          >
            View Full Qualification Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default LeadQualificationCard;
