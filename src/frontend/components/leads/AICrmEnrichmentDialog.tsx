'use client';

/**
 * AI CRM Enrichment Dialog
 * Modal for enriching CRM data from conversation analysis.
 * Shows extracted contact, company, and deal suggestions with accept/reject options.
 */

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Sparkles,
  Loader2,
  User,
  Building2,
  Briefcase,
  Target,
  CheckCircle2,
  Quote,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAICrmEnrichment, useApplyCrmEnrichment } from '@/hooks/api/useAICrmEnrichment';
import type {
  CrmEnrichmentResult,
  CrmFieldSuggestion,
  SuggestionWithStatus,
  SuggestionCategory,
  BantScores,
} from '@/types/ai-crm-enrichment';
import { getFieldDisplayName } from '@/types/ai-crm-enrichment';

interface AICrmEnrichmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  leadId?: string;
  contactId?: string;
  dealId?: string;
  onEnrichmentApplied?: () => void;
}

type EnrichmentStep = 'analyzing' | 'review' | 'applying';

export function AICrmEnrichmentDialog({
  open,
  onOpenChange,
  conversationId,
  leadId,
  contactId,
  dealId,
  onEnrichmentApplied,
}: AICrmEnrichmentDialogProps) {
  const [step, setStep] = useState<EnrichmentStep>('analyzing');
  const [result, setResult] = useState<CrmEnrichmentResult | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);

  const { mutate: enrichCrmData, isPending: isAnalyzing } = useAICrmEnrichment();
  const { mutate: applyEnrichment, isPending: _isApplying } = useApplyCrmEnrichment();

  // Start analysis when dialog opens
  const handleStartAnalysis = () => {
    setStep('analyzing');
    enrichCrmData(
      {
        conversationId,
        leadId,
        contactId,
        dealId,
        includeCompanyInfo: true,
        includeContactDetails: true,
        includeDealSignals: true,
        includeBantScores: true,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.success) {
            // Convert suggestions to trackable format
            const allSuggestions = convertToSuggestionsWithStatus(data);
            setSuggestions(allSuggestions);
            setStep('review');
          }
        },
        onError: () => {
          setStep('review');
        },
      }
    );
  };

  // Start analysis on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAnalyzing && step === 'analyzing') {
      handleStartAnalysis();
    }
    if (!newOpen) {
      // Reset state on close
      setStep('analyzing');
      setResult(null);
      setSuggestions([]);
    }
    onOpenChange(newOpen);
  };

  // Toggle suggestion acceptance
  const toggleSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accepted: !s.accepted } : s))
    );
  };

  // Accept all suggestions
  const acceptAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, accepted: true })));
  };

  // Reject all suggestions
  const rejectAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, accepted: false })));
  };

  // Apply accepted suggestions
  const handleApply = () => {
    const acceptedSuggestions = suggestions.filter((s) => s.accepted);
    if (acceptedSuggestions.length === 0) {
      onOpenChange(false);
      return;
    }

    setStep('applying');
    applyEnrichment(
      {
        leadId,
        contactId,
        dealId,
        acceptedSuggestions: acceptedSuggestions.map(({ fieldName, suggestedValue, confidence, sourceQuote }) => ({
          fieldName,
          suggestedValue,
          confidence,
          sourceQuote,
        })),
      },
      {
        onSuccess: () => {
          onEnrichmentApplied?.();
          onOpenChange(false);
        },
        onError: () => {
          setStep('review');
        },
      }
    );
  };

  const acceptedCount = suggestions.filter((s) => s.accepted).length;
  const totalCount = suggestions.length;

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent size="lg" className="max-h-[90vh] flex flex-col">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI CRM Enrichment
          </ModalTitle>
          <ModalDescription>
            Analyze conversation to extract contact, company, and deal information
          </ModalDescription>
        </ModalHeader>

        {/* Analyzing State */}
        {step === 'analyzing' && isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="size-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Analyzing conversation for CRM data...
            </p>
          </div>
        )}

        {/* Error State */}
        {step === 'review' && result && !result.success && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="size-12 text-red-500" />
            <p className="text-sm text-red-600">
              {result.limitExceeded
                ? 'Usage limit exceeded. Please upgrade your plan.'
                : result.errorMessage || 'Failed to analyze conversation'}
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {/* Review State */}
        {step === 'review' && result?.success && (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between px-1 py-2 border-b">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalCount}</span> suggestions found
                {acceptedCount > 0 && (
                  <span className="ml-2">
                    (<span className="text-green-600 font-medium">{acceptedCount}</span> selected)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={acceptAll}>
                  <Check className="size-4 mr-1" />
                  Accept All
                </Button>
                <Button variant="ghost" size="sm" onClick={rejectAll}>
                  <X className="size-4 mr-1" />
                  Reject All
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 max-h-[400px] pr-4">
              <div className="space-y-4 py-4">
                {/* Contact Suggestions */}
                <SuggestionGroup
                  title="Contact Information"
                  icon={User}
                  suggestions={suggestions.filter((s) => s.category === 'contact')}
                  onToggle={toggleSuggestion}
                />

                {/* Company Suggestions */}
                <SuggestionGroup
                  title="Company Information"
                  icon={Building2}
                  suggestions={suggestions.filter((s) => s.category === 'company')}
                  onToggle={toggleSuggestion}
                />

                {/* Deal Suggestions */}
                <SuggestionGroup
                  title="Deal Signals"
                  icon={Briefcase}
                  suggestions={suggestions.filter((s) => s.category === 'deal')}
                  onToggle={toggleSuggestion}
                />

                {/* BANT Scores */}
                {result.bantScores && <BantScoresCard scores={result.bantScores} />}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={acceptedCount === 0}
                className="gap-2"
              >
                <CheckCircle2 className="size-4" />
                Apply {acceptedCount} Updates
              </Button>
            </div>
          </>
        )}

        {/* Applying State */}
        {step === 'applying' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="size-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Applying CRM updates...</p>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface SuggestionGroupProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestions: SuggestionWithStatus[];
  onToggle: (id: string) => void;
}

function SuggestionGroup({ title, icon: Icon, suggestions, onToggle }: SuggestionGroupProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {suggestions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-2">
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onToggle={() => onToggle(suggestion.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface SuggestionItemProps {
  suggestion: SuggestionWithStatus;
  onToggle: () => void;
}

function SuggestionItem({ suggestion, onToggle }: SuggestionItemProps) {
  const confidenceColor =
    suggestion.confidence >= 0.8
      ? 'text-green-600'
      : suggestion.confidence >= 0.6
        ? 'text-yellow-600'
        : 'text-orange-600';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
        suggestion.accepted
          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
          : 'bg-muted/30 hover:bg-muted/50'
      )}
      onClick={onToggle}
    >
      <Checkbox checked={suggestion.accepted} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {getFieldDisplayName(suggestion.fieldName)}
          </span>
          <span className={cn('text-xs', confidenceColor)}>
            {Math.round(suggestion.confidence * 100)}% confident
          </span>
        </div>
        <p className="text-sm text-foreground break-words">{suggestion.suggestedValue}</p>
        {suggestion.sourceQuote && (
          <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground">
            <Quote className="size-3 mt-0.5 shrink-0" />
            <span className="italic">&quot;{suggestion.sourceQuote}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BantScoresCardProps {
  scores: BantScores;
}

function BantScoresCard({ scores }: BantScoresCardProps) {
  const bantItems = [
    { label: 'Budget', score: scores.budgetScore, signals: scores.budgetSignals, color: 'bg-green-500' },
    { label: 'Authority', score: scores.authorityScore, signals: scores.authoritySignals, color: 'bg-muted/300' },
    { label: 'Need', score: scores.needScore, signals: scores.needSignals, color: 'bg-primary/50' },
    { label: 'Timeline', score: scores.timelineScore, signals: scores.timelineSignals, color: 'bg-orange-500' },
  ];

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Target className="size-4 text-muted-foreground" />
          BANT Qualification Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {bantItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.score}/100</span>
            </div>
            <Progress value={item.score} className="h-2" />
            {item.signals.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.signals.slice(0, 3).map((signal, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {signal}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function convertToSuggestionsWithStatus(result: CrmEnrichmentResult): SuggestionWithStatus[] {
  const suggestions: SuggestionWithStatus[] = [];
  let idCounter = 0;

  const addSuggestions = (items: CrmFieldSuggestion[], category: SuggestionCategory) => {
    items.forEach((item) => {
      suggestions.push({
        ...item,
        id: `suggestion-${idCounter++}`,
        category,
        accepted: item.confidence >= 0.7, // Auto-accept high confidence suggestions
      });
    });
  };

  addSuggestions(result.contactSuggestions, 'contact');
  addSuggestions(result.companySuggestions, 'company');
  addSuggestions(result.dealSuggestions, 'deal');

  return suggestions;
}

