'use client';

import { FormPage, ProgressStyle } from '@/types/multi-page-forms';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  pages: FormPage[];
  currentPageId: string;
  completedPageIds: string[];
  style: ProgressStyle;
  onPageClick?: (pageId: string) => void;
}

export function ProgressIndicator({
  pages,
  currentPageId,
  completedPageIds,
  style,
  onPageClick,
}: ProgressIndicatorProps) {
  if (style.type === 'none') return null;

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex(p => p.id === currentPageId);
  const progress = ((currentIndex + 1) / sortedPages.length) * 100;

  // Progress Bar
  if (style.type === 'bar') {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Progress</span>
          <span className="font-medium text-brand-purple">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-purple transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // Percentage Only
  if (style.type === 'percentage') {
    return (
      <div className="text-center">
        <div className="text-3xl font-bold text-brand-purple">{Math.round(progress)}%</div>
        <div className="text-sm text-text-secondary">Complete</div>
      </div>
    );
  }

  // Steps
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {sortedPages.map((page, index) => {
          const isCompleted = completedPageIds.includes(page.id);
          const isCurrent = page.id === currentPageId;
          const isClickable = onPageClick && (isCompleted || index < currentIndex);

          return (
            <div key={page.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onPageClick(page.id)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center size-10 rounded-full border-2 transition-all
                  ${isCurrent ? 'border-brand-purple bg-brand-purple text-white' : ''}
                  ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                  ${!isCurrent && !isCompleted ? 'border-border bg-white text-text-muted' : ''}
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                `}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : style.showNumbers ? (
                  <span className="text-sm font-medium">{index + 1}</span>
                ) : null}
              </button>

              {/* Step Label */}
              {style.showLabels && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center w-24">
                  <p className={`text-xs font-medium ${isCurrent ? 'text-brand-purple' : 'text-text-secondary'}`}>
                    {page.title}
                  </p>
                </div>
              )}

              {/* Connector Line */}
              {index < sortedPages.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div
                    className={`h-full transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
