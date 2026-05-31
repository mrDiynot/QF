import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradientButton } from '@/components/ui/gradient-button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  billingPeriod: 'monthly' | 'annual';
}

export function PricingCard({ name, price, period, features, popular = false, billingPeriod }: PricingCardProps) {
  const displayPrice = price === 'Custom' 
    ? price 
    : billingPeriod === 'annual' && price !== '$0'
      ? `$${Math.round(parseInt(price.replace('$', '')) * 12 * 0.8)}`
      : price;
      
  const displayPeriod = price === 'Custom'
    ? period
    : billingPeriod === 'annual' && price !== '$0'
      ? 'per year'
      : period;

  return (
    <Card className={cn(
      'relative p-8 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300',
      popular ? 'border-brand-orange shadow-elevation-md' : 'border-border/50 bg-white/80 backdrop-blur-sm'
    )}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="gradient-primary text-white text-xs font-bold px-4 py-1 shadow-md">
            POPULAR
          </Badge>
        </div>
      )}
      <h3 className="heading-2 mb-4 text-text-navy">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-text-navy">
          {displayPrice}
        </span>
        <span className="body-text text-text-secondary"> {displayPeriod}</span>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="size-5 text-success mt-0.5 shrink-0" />
            <span className="small-text text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
      <GradientButton asChild className="w-full">
        <Link href="/register">Start Free Trial</Link>
      </GradientButton>
    </Card>
  );
}