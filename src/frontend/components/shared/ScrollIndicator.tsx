'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  targetId?: string;
  threshold?: number;
  className?: string;
}

/**
 * ScrollIndicator component
 * Shows a visual indicator when content extends below the fold
 * Helps users know there's more content to scroll
 */
export function ScrollIndicator({ 
  targetId, 
  threshold = 100,
  className 
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const target = targetId ? document.getElementById(targetId) : document.documentElement;
      if (!target) return;

      const scrollableHeight = target.scrollHeight - target.clientHeight;
      const currentScroll = targetId 
        ? target.scrollTop 
        : window.scrollY || document.documentElement.scrollTop;

      // Show indicator if there's more than threshold pixels to scroll
      setShowIndicator(scrollableHeight - currentScroll > threshold);
    };

    checkScroll();
    
    const scrollElement = targetId ? document.getElementById(targetId) : window;
    scrollElement?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      scrollElement?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [targetId, threshold]);

  if (!showIndicator) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-bounce",
      "flex flex-col items-center gap-1 pointer-events-none",
      className
    )}>
      <span className="text-xs font-medium text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200">
        Scroll for more
      </span>
      <ChevronDown className="size-4 text-gray-600" />
    </div>
  );
}
