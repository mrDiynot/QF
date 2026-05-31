'use client';

/**
 * AI Knowledge Generation Dialog
 * Modal for generating knowledge base articles and extracting FAQs using AI.
 * Supports two modes: Generate (create new content) and Extract (analyze conversations).
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sparkles,
  FileText,
  MessageSquareText,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAIKnowledgeGeneration,
  useAIFaqExtraction,
  useSaveGeneratedArticle,
  useSaveExtractedFaqs,
} from '@/hooks/api/useAIKnowledgeGeneration';
import type {
  KnowledgeEntryType,
  KnowledgeArticleResult,
  ExtractFaqsResult,
} from '@/types/ai-knowledge';
import { KNOWLEDGE_ENTRY_TYPES, KNOWLEDGE_TONES } from '@/types/ai-knowledge';

interface AIKnowledgeGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleSaved?: () => void;
}

type GenerationStep = 'input' | 'preview';

export function AIKnowledgeGenerationDialog({
  open,
  onOpenChange,
  onArticleSaved,
}: AIKnowledgeGenerationDialogProps) {
  // State for generation mode
  const [mode, setMode] = useState<'generate' | 'extract'>('generate');
  const [step, setStep] = useState<GenerationStep>('input');

  // Generate mode state
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [entryType, setEntryType] = useState<KnowledgeEntryType>('FAQ');
  const [tone, setTone] = useState('professional');
  const [generateRelatedFaqs, setGenerateRelatedFaqs] = useState(true);

  // Extract mode state
  const [daysToAnalyze, setDaysToAnalyze] = useState(30);
  const [maxFaqs, setMaxFaqs] = useState(10);
  const [minConfidence, setMinConfidence] = useState(70);

  // Results state
  const [articleResult, setArticleResult] = useState<KnowledgeArticleResult | null>(null);
  const [extractResult, setExtractResult] = useState<ExtractFaqsResult | null>(null);
  const [selectedFaqs, setSelectedFaqs] = useState<Set<number>>(new Set());

  // Mutations
  const { mutate: generateArticle, isPending: isGenerating } = useAIKnowledgeGeneration();
  const { mutate: extractFaqs, isPending: isExtracting } = useAIFaqExtraction();
  const { mutate: saveArticle, isPending: isSavingArticle } = useSaveGeneratedArticle();
  const { mutate: saveFaqs, isPending: isSavingFaqs } = useSaveExtractedFaqs();

  const resetState = () => {
    setStep('input');
    setTopic('');
    setContext('');
    setEntryType('FAQ');
    setTone('professional');
    setGenerateRelatedFaqs(true);
    setDaysToAnalyze(30);
    setMaxFaqs(10);
    setMinConfidence(70);
    setArticleResult(null);
    setExtractResult(null);
    setSelectedFaqs(new Set());
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleGenerate = () => {
    generateArticle(
      {
        topic,
        entryType,
        context: context || undefined,
        tone,
        generateRelatedFaqs,
        maxRelatedFaqs: 3,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setArticleResult(result);
            setStep('preview');
          }
        },
      }
    );
  };

  const handleExtract = () => {
    extractFaqs(
      {
        daysToAnalyze,
        maxFaqs,
        minConfidence,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setExtractResult(result);
            setStep('preview');
            // Select all FAQs by default
            setSelectedFaqs(new Set(result.faqs.map((_, i) => i)));
          }
        },
      }
    );
  };

  const handleSaveArticle = () => {
    if (!articleResult) return;
    saveArticle(articleResult, {
      onSuccess: () => {
        onArticleSaved?.();
        handleClose();
      },
    });
  };

  const handleSaveFaqs = () => {
    if (!extractResult) return;
    const faqsToSave = extractResult.faqs
      .filter((_, i) => selectedFaqs.has(i))
      .map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }));

    if (faqsToSave.length === 0) return;

    saveFaqs(faqsToSave, {
      onSuccess: () => {
        onArticleSaved?.();
        handleClose();
      },
    });
  };

  const toggleFaqSelection = (index: number) => {
    const newSelected = new Set(selectedFaqs);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFaqs(newSelected);
  };

  const isLoading = isGenerating || isExtracting;
  const isSaving = isSavingArticle || isSavingFaqs;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Knowledge Generator
          </ModalTitle>
          <ModalDescription>
            Generate knowledge base articles or extract FAQs from your conversations using AI.
          </ModalDescription>
        </ModalHeader>

        {step === 'input' && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'extract')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="gap-2">
                <FileText className="size-4" />
                Generate Article
              </TabsTrigger>
              <TabsTrigger value="extract" className="gap-2">
                <MessageSquareText className="size-4" />
                Extract FAQs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., How to qualify leads using BANT methodology"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  What should the article be about?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Type</Label>
                  <Select value={entryType} onValueChange={(v) => setEntryType(v as KnowledgeEntryType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KNOWLEDGE_ENTRY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KNOWLEDGE_TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Provide any specific details, examples, or requirements..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="relatedFaqs"
                  checked={generateRelatedFaqs}
                  onCheckedChange={(checked) => setGenerateRelatedFaqs(checked === true)}
                />
                <Label htmlFor="relatedFaqs" className="text-sm">
                  Generate related FAQs
                </Label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || isLoading}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Generate Article
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="extract" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Days to Analyze: {daysToAnalyze}</Label>
                    <Slider
                      value={[daysToAnalyze]}
                      onValueChange={(v) => setDaysToAnalyze(v[0])}
                      min={7}
                      max={90}
                      step={7}
                    />
                    <p className="text-xs text-muted-foreground">
                      Analyze conversations from the last {daysToAnalyze} days
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max FAQs: {maxFaqs}</Label>
                      <Slider
                        value={[maxFaqs]}
                        onValueChange={(v) => setMaxFaqs(v[0])}
                        min={5}
                        max={25}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Min Confidence: {minConfidence}%</Label>
                      <Slider
                        value={[minConfidence]}
                        onValueChange={(v) => setMinConfidence(v[0])}
                        min={50}
                        max={95}
                        step={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleExtract}
                disabled={isLoading}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Analyzing Conversations...
                  </>
                ) : (
                  <>
                    <MessageSquareText className="size-4 mr-2" />
                    Extract FAQs from Conversations
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {step === 'preview' && mode === 'generate' && articleResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="size-5" />
              <span className="font-medium">Article Generated Successfully!</span>
            </div>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <h3 className="text-lg font-semibold">{articleResult.title}</h3>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Content Preview</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md max-h-48 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                      {articleResult.content.slice(0, 500)}
                      {articleResult.content.length > 500 && '...'}
                    </div>
                  </div>
                </div>

                {articleResult.suggestedTags.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Suggested Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {articleResult.suggestedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="size-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {articleResult.relatedFaqs.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Related FAQs ({articleResult.relatedFaqs.length})
                    </Label>
                    <div className="mt-1 space-y-2">
                      {articleResult.relatedFaqs.map((faq, i) => (
                        <div key={i} className="p-2 bg-muted rounded text-sm">
                          <p className="font-medium">{faq.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Tokens used: {articleResult.tokensUsed}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSaveArticle} disabled={isSaving} className="flex-1">
                {isSavingArticle ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save to Knowledge Base
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && mode === 'extract' && extractResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="size-5" />
                <span className="font-medium">
                  Extracted {extractResult.faqs.length} FAQ(s)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                From {extractResult.conversationsAnalyzed} conversations
              </span>
            </div>

            {extractResult.faqs.length === 0 ? (
              <Card>
                <CardContent className="pt-4 text-center text-muted-foreground">
                  <XCircle className="size-8 mx-auto mb-2 opacity-50" />
                  <p>No FAQs could be extracted from your conversations.</p>
                  <p className="text-sm mt-1">Try adjusting the analysis parameters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {extractResult.faqs.map((faq, index) => (
                  <Card
                    key={index}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedFaqs.has(index) ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    )}
                    onClick={() => toggleFaqSelection(index)}
                  >
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedFaqs.has(index)}
                          onCheckedChange={() => toggleFaqSelection(index)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{faq.question}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {faq.answer}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {faq.category && (
                              <Badge variant="outline" className="text-xs">
                                {faq.category}
                              </Badge>
                            )}
                            <Badge
                              variant={faq.confidence >= 80 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {faq.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSaveFaqs}
                disabled={isSaving || selectedFaqs.size === 0}
                className="flex-1"
              >
                {isSavingFaqs ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save {selectedFaqs.size} FAQ(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

