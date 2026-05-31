'use client';

/**
 * Rating & Feedback Components
 * Star ratings, NPS scores, and feedback widgets
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Star Rating Component
interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' };
  const displayValue = hovered ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "transition-colors focus:outline-none",
              !readonly && "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

// Thumbs Up/Down Component
interface ThumbsRatingProps {
  value?: 'up' | 'down' | null;
  onChange?: (value: 'up' | 'down' | null) => void;
  showLabels?: boolean;
  className?: string;
}

export function ThumbsRating({ value, onChange, showLabels = false, className }: ThumbsRatingProps) {
  const handleClick = (newValue: 'up' | 'down') => {
    onChange?.(value === newValue ? null : newValue);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => handleClick('up')}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors",
          value === 'up'
            ? "bg-green-100 border-green-300 text-green-700"
            : "hover:bg-muted/20 text-muted-foreground"
        )}
      >
        <ThumbsUp className="size-5" />
        {showLabels && <span className="text-sm">Helpful</span>}
      </button>
      <button
        type="button"
        onClick={() => handleClick('down')}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors",
          value === 'down'
            ? "bg-red-100 border-red-300 text-red-700"
            : "hover:bg-muted/20 text-muted-foreground"
        )}
      >
        <ThumbsDown className="size-5" />
        {showLabels && <span className="text-sm">Not helpful</span>}
      </button>
    </div>
  );
}

// Emoji Rating Component
interface EmojiRatingProps {
  value?: 1 | 2 | 3 | null;
  onChange?: (value: 1 | 2 | 3) => void;
  showLabels?: boolean;
  className?: string;
}

export function EmojiRating({ value, onChange, showLabels = true, className }: EmojiRatingProps) {
  const options = [
    { value: 1 as const, icon: Frown, label: 'Poor', color: 'text-red-500 bg-red-50 border-red-200' },
    { value: 2 as const, icon: Meh, label: 'Okay', color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { value: 3 as const, icon: Smile, label: 'Great', color: 'text-green-500 bg-green-50 border-green-200' },
  ];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
              isSelected ? option.color : "border-border hover:border-border"
            )}
          >
            <Icon className={cn("size-8", isSelected ? "" : "text-muted-foreground/60")} />
            {showLabels && (
              <span className={cn("text-xs font-medium", isSelected ? "" : "text-muted-foreground")}>
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// NPS Score Widget
interface NPSScoreProps {
  value?: number | null;
  onChange?: (value: number) => void;
  className?: string;
}

export function NPSScore({ value, onChange, className }: NPSScoreProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground">
        How likely are you to recommend us to a friend or colleague?
      </p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 11 }).map((_, index) => {
          const isSelected = value === index;
          const getColor = () => {
            if (index <= 6) return isSelected ? 'bg-red-500 text-white' : 'hover:bg-red-100';
            if (index <= 8) return isSelected ? 'bg-amber-500 text-white' : 'hover:bg-amber-100';
            return isSelected ? 'bg-green-500 text-white' : 'hover:bg-green-100';
          };
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange?.(index)}
              className={cn(
                "size-9 rounded-lg border text-sm font-medium transition-colors",
                getColor()
              )}
            >
              {index}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground/60">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  );
}

// Complete Feedback Form
interface FeedbackFormProps {
  onSubmit?: (feedback: { rating: number; comment: string }) => void;
  title?: string;
  description?: string;
  ratingType?: 'stars' | 'emoji' | 'nps';
  showComment?: boolean;
  className?: string;
}

export function FeedbackForm({
  onSubmit,
  title = "How was your experience?",
  description,
  ratingType = 'stars',
  showComment = true,
  className,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    onSubmit?.({ rating, comment });
    setSubmitted(true);
    toast.success('Thank you for your feedback!');
  };

  if (submitted) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="size-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <Smile className="size-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-foreground">Thank you!</h3>
        <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve.</p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      
      <div className="mt-4">
        {ratingType === 'stars' && (
          <StarRating value={rating} onChange={setRating} size="lg" />
        )}
        {ratingType === 'emoji' && (
          <EmojiRating value={rating as 1 | 2 | 3 | null} onChange={(v) => setRating(v)} />
        )}
        {ratingType === 'nps' && (
          <NPSScore value={rating || null} onChange={setRating} />
        )}
      </div>

      {showComment && (
        <div className="mt-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more (optional)..."
            rows={3}
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full mt-4 gap-2 bg-primary hover:bg-purple-700"
        disabled={rating === 0}
      >
        <Send className="size-4" />
        Submit Feedback
      </Button>
    </Card>
  );
}

// Inline Rating Display
interface RatingDisplayProps {
  value: number;
  max?: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingDisplay({ value, max = 5, count, size = 'md', className }: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating value={Math.round(value)} max={max} size={size} readonly />
      <span className={cn("font-medium", size === 'sm' ? "text-sm" : "text-base")}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground/60 text-sm">({count})</span>
      )}
    </div>
  );
}
