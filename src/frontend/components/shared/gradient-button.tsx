import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface GradientButtonProps extends React.ComponentProps<typeof Button> {
  showArrow?: boolean;
}

export function GradientButton({
  children,
  className,
  showArrow = false,
  asChild,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        'group gradient-primary h-12 rounded-xl px-6 text-base font-medium text-white shadow-lg',
        'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        'transition-all duration-200',
        className
      )}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {showArrow && (
            <ArrowRight className="ml-2 size-5 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </>
      )}
    </Button>
  );
}