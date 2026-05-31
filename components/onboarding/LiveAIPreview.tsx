'use client';

/**
 * Live AI Preview Component
 * Shows real-time AI conversation demo based on user's selections
 * Animated chat bubbles with typing indicators
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getPreviewScenario, type PreviewScenario } from '@/utils/onboarding/preview-scenarios';

interface LiveAIPreviewProps {
  businessType?: string;
  goal?: string;
}

export function LiveAIPreview({ businessType, goal }: LiveAIPreviewProps) {
  const [scenario, setScenario] = useState<PreviewScenario | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  // Load scenario when inputs change
  useEffect(() => {
    if (businessType) {
      // Use a default goal if none selected to show a preview
      const effectiveGoal = goal || 'qualify_leads';
      const newScenario = getPreviewScenario(businessType, effectiveGoal);
      setScenario(newScenario);
      setVisibleMessages(0);
    } else {
      setScenario(null);
    }
  }, [businessType, goal]);

  // Animate messages one by one
  useEffect(() => {
    if (!scenario || visibleMessages >= scenario.conversation.length) {
      setIsTyping(false);
      return;
    }

    const message = scenario.conversation[visibleMessages];
    const timer = setTimeout(() => {
      setIsTyping(true);
      // Show typing indicator, then message
      const showMessageTimer = setTimeout(() => {
        setVisibleMessages((prev) => prev + 1);
        setIsTyping(false);
      }, 800);

      return () => clearTimeout(showMessageTimer);
    }, message.delay);

    return () => clearTimeout(timer);
  }, [scenario, visibleMessages]);

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
        <div className="text-center space-y-3 sm:space-y-4 px-4">
          <div className="flex size-12 sm:size-16 items-center justify-center rounded-2xl bg-purple-50 mx-auto animate-pulse">
            <Bot className="size-7 sm:size-10 text-purple-300" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto">
            Select your business type first
            <br />
            to see your AI assistant in action
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
        <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-purple-100">
          <Bot className="size-5 sm:size-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{scenario.title}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{scenario.subtitle}</p>
        </div>
        <Sparkles className="size-4 sm:size-5 text-brand-orange animate-pulse shrink-0" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto mb-4 sm:mb-5 pr-1 sm:pr-2">
        <AnimatePresence mode="popLayout">
          {scenario.conversation.slice(0, visibleMessages).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('flex gap-2', message.type === 'lead' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'size-7 sm:size-8 rounded-full flex items-center justify-center shrink-0',
                  message.type === 'ai' ? 'bg-purple-100' : 'bg-gray-200'
                )}
              >
                {message.type === 'ai' ? (
                  <Bot className="size-4 sm:size-5 text-purple-600" />
                ) : (
                  <User className="size-4 sm:size-5 text-gray-600" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm leading-relaxed',
                  message.type === 'ai'
                    ? 'bg-purple-50 text-gray-900 border border-purple-100'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                )}
              >
                {message.text}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <div className="size-6 sm:size-7 rounded-full flex items-center justify-center shrink-0 bg-purple-100">
                <Bot className="size-3.5 sm:size-4 text-purple-600" />
              </div>
              <div className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex gap-1">
                  <div className="size-1.5 sm:size-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-1.5 sm:size-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-1.5 sm:size-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Score */}
      {visibleMessages >= scenario.conversation.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pt-3 sm:pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className={cn('size-4 sm:size-5', getScoreColor(scenario.finalScore))} />
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Qualification Score</p>
                <p className={cn('text-xl sm:text-2xl font-bold', getScoreColor(scenario.finalScore))}>
                  {scenario.finalScore}/100
                </p>
              </div>
            </div>
            <Badge className={cn('text-[10px] sm:text-xs px-2 py-0.5', getScoreBadgeColor(scenario.finalScore))}>
              {scenario.priority}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}
