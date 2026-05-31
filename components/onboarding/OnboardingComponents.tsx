'use client';

/**
 * Onboarding & Wizard Components
 * Step wizards, checklists, and feature tours
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  X,
  Lightbulb,
  Rocket,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Step Wizard Types
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  children: React.ReactNode;
  showNavigation?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  showNavigation = true,
  allowSkip = false,
  className,
}: StepWizardProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
          <span className="font-medium">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => index < currentStep && onStepChange(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex items-center justify-center size-10 rounded-full transition-colors",
                  isComplete && "bg-green-500 text-white",
                  isCurrent && "bg-primary text-white",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="size-5" />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1",
                  index < currentStep ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{steps[currentStep]?.title}</h2>
        {steps[currentStep]?.description && (
          <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {children}
      </div>

      {/* Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {allowSkip && !isLastStep && steps[currentStep]?.optional && (
              <Button variant="ghost" onClick={handleNext}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? 'Complete' : 'Continue'}
              {!isLastStep && <ChevronRight className="size-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Onboarding Checklist
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  href?: string;
  onClick?: () => void;
}

interface OnboardingChecklistProps {
  title?: string;
  items: ChecklistItem[];
  onItemClick?: (item: ChecklistItem) => void;
  onDismiss?: () => void;
  className?: string;
}

export function OnboardingChecklist({
  title = "Getting Started",
  items,
  onItemClick,
  onDismiss,
  className,
}: OnboardingChecklistProps) {
  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="size-5 text-primary" />
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} of {items.length} completed
          </p>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onDismiss}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
              item.completed ? "bg-green-50" : "hover:bg-muted/20"
            )}
            onClick={() => {
              item.onClick?.();
              onItemClick?.(item);
            }}
          >
            <div className={cn(
              "flex size-6 items-center justify-center rounded-full flex-shrink-0",
              item.completed ? "bg-green-500 text-white" : "border-2 border-border"
            )}>
              {item.completed && <Check className="size-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                item.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {item.title}
              </p>
              {item.description && !item.completed && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
            {!item.completed && (
              <ChevronRight className="size-4 text-muted-foreground/60" />
            )}
          </div>
        ))}
      </div>

      {completedCount === items.length && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
          <Gift className="size-8 mx-auto text-green-600 mb-2" />
          <p className="font-medium text-green-800">All done! You&apos;re ready to go.</p>
        </div>
      )}
    </Card>
  );
}

// Feature Highlight Card
interface FeatureHighlightProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick?: () => void; href?: string };
  onDismiss?: () => void;
  variant?: 'default' | 'gradient';
  className?: string;
}

export function FeatureHighlight({
  title,
  description,
  icon,
  action,
  onDismiss,
  variant = 'default',
  className,
}: FeatureHighlightProps) {
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden",
      variant === 'gradient' && "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none",
      className
    )}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className={cn("absolute top-2 right-2 size-6", variant === 'gradient' && "text-white hover:bg-white/20")}
          onClick={onDismiss}
        >
          <X className="size-4" />
        </Button>
      )}
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn(
            "flex size-10 items-center justify-center rounded-lg flex-shrink-0",
            variant === 'gradient' ? "bg-white/20" : "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className={cn("font-semibold", variant === 'gradient' ? "text-white" : "text-foreground")}>
            {title}
          </h4>
          <p className={cn("text-sm mt-1", variant === 'gradient' ? "text-white/80" : "text-muted-foreground")}>
            {description}
          </p>
          {action && (
            <Button
              variant={variant === 'gradient' ? 'secondary' : 'link'}
              size="sm"
              className={cn("mt-2 p-0 h-auto", variant !== 'gradient' && "text-primary")}
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href} className="flex items-center gap-1">
                  {action.label} <ArrowRight className="size-3" />
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  {action.label} <ArrowRight className="size-3" />
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Welcome Banner
interface WelcomeBannerProps {
  userName?: string;
  title?: string;
  subtitle?: string;
  actions?: Array<{ label: string; onClick?: () => void; href?: string; primary?: boolean }>;
  onDismiss?: () => void;
  className?: string;
}

export function WelcomeBanner({
  userName,
  title,
  subtitle,
  actions,
  onDismiss,
  className,
}: WelcomeBannerProps) {
  const displayTitle = title || (userName ? `Welcome, ${userName}!` : 'Welcome!');

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none relative overflow-hidden",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full -mb-16" />

      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
          onClick={onDismiss}
        >
          <X className="size-4" />
        </Button>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-5" />
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            New
          </Badge>
        </div>
        <h2 className="text-2xl font-bold">{displayTitle}</h2>
        {subtitle && <p className="text-white/80 mt-1">{subtitle}</p>}
        
        {actions && actions.length > 0 && (
          <div className="flex gap-3 mt-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? 'secondary' : 'outline'}
                className={cn(
                  action.primary ? '' : 'border-white/30 text-white hover:bg-white/10'
                )}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? <a href={action.href}>{action.label}</a> : action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Tip Card
interface TipCardProps {
  tip: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

export function TipCard({ tip, title = "Pro Tip", onDismiss, className }: TipCardProps) {
  return (
    <Card className={cn("p-4 bg-amber-50 border-amber-200", className)}>
      <div className="flex items-start gap-3">
        <Lightbulb className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">{title}</p>
          <p className="text-sm text-amber-700 mt-1">{tip}</p>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="size-6 text-amber-600" onClick={onDismiss}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

// Progress Card (for goals/milestones)
interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ProgressCard({ title, current, target, unit = '', icon, className }: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        {isComplete && (
          <Badge className="bg-green-100 text-green-700">
            <Check className="size-3 mr-1" /> Complete
          </Badge>
        )}
      </div>
      <Progress value={percentage} className="h-2 mb-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{current.toLocaleString()}{unit} of {target.toLocaleString()}{unit}</span>
        <span className="font-medium text-primary">{Math.round(percentage)}%</span>
      </div>
    </Card>
  );
}
