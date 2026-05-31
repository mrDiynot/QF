'use client';

/**
 * Billing & Pricing Components
 * Pricing tables, usage meters, invoices
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Check,
  X,
  Zap,
  CreditCard,
  Download,
  AlertTriangle,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Pricing Plan
interface PricingFeature {
  name: string;
  included: boolean | string;
  tooltip?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  features: PricingFeature[];
  highlighted?: boolean;
  badge?: string;
  ctaLabel?: string;
}

interface PricingTableProps {
  plans: PricingPlan[];
  currentPlanId?: string;
  onSelectPlan?: (planId: string, billing: 'monthly' | 'yearly') => void;
  className?: string;
}

export function PricingTable({ plans, currentPlanId, onSelectPlan, className }: PricingTableProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn("text-sm", billing === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground')}>
          Monthly
        </span>
        <Switch
          checked={billing === 'yearly'}
          onCheckedChange={(checked) => setBilling(checked ? 'yearly' : 'monthly')}
        />
        <span className={cn("text-sm", billing === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground')}>
          Yearly
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Save 20%</Badge>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isCurrent = plan.id === currentPlanId;

          return (
            <Card
              key={plan.id}
              className={cn(
                "p-6 relative",
                plan.highlighted && "border-primary border-2 shadow-lg"
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                )}
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${price}
                  </span>
                  <span className="text-muted-foreground">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    {feature.included === true ? (
                      <Check className="size-5 text-green-500 flex-shrink-0" />
                    ) : feature.included === false ? (
                      <X className="size-5 text-muted-foreground/30 flex-shrink-0" />
                    ) : (
                      <Check className="size-5 text-green-500 flex-shrink-0" />
                    )}
                    <span className={feature.included === false ? 'text-muted-foreground/60' : ''}>
                      {typeof feature.included === 'string' ? feature.included : feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full",
                  plan.highlighted ? "bg-primary hover:bg-purple-700" : "",
                  isCurrent && "bg-muted/40 text-muted-foreground hover:bg-muted/40"
                )}
                variant={plan.highlighted ? "default" : "outline"}
                disabled={isCurrent}
                onClick={() => onSelectPlan?.(plan.id, billing)}
              >
                {isCurrent ? 'Current Plan' : plan.ctaLabel || 'Get Started'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Usage Meter
interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  warningThreshold?: number;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
  className?: string;
}

export function UsageMeter({
  label,
  used,
  limit,
  unit = '',
  warningThreshold = 80,
  showUpgrade = true,
  onUpgrade,
  className,
}: UsageMeterProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= warningThreshold;
  const isExceeded = percentage >= 100;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground/80">{label}</span>
        <span className={cn(
          "text-sm font-medium",
          isExceeded ? "text-red-600" : isWarning ? "text-amber-600" : "text-muted-foreground"
        )}>
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isExceeded && "[&>div]:bg-red-500",
          isWarning && !isExceeded && "[&>div]:bg-amber-500"
        )}
      />
      {isWarning && showUpgrade && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className={cn("size-4", isExceeded ? "text-red-500" : "text-amber-500")} />
            <span className={isExceeded ? "text-red-600" : "text-amber-600"}>
              {isExceeded ? 'Limit exceeded' : 'Approaching limit'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onUpgrade} className="gap-1">
            <Zap className="size-3" />
            Upgrade
          </Button>
        </div>
      )}
    </Card>
  );
}

// Usage Summary
interface UsageItem {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

interface UsageSummaryProps {
  items: UsageItem[];
  title?: string;
  billingPeriod?: string;
  className?: string;
}

export function UsageSummary({ items, title = 'Usage Summary', billingPeriod, className }: UsageSummaryProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {billingPeriod && (
          <span className="text-sm text-muted-foreground">{billingPeriod}</span>
        )}
      </div>
      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.min((item.used / item.limit) * 100, 100);
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">
                  {item.used.toLocaleString()}{item.unit} / {item.limit.toLocaleString()}{item.unit}
                </span>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Invoice Item
interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description?: string;
  pdfUrl?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onDownload?: (invoice: Invoice) => void;
  className?: string;
}

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

export function InvoiceList({ invoices, onDownload, className }: InvoiceListProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Invoices</h3>
      </div>
      <div className="divide-y">
        {invoices.map((invoice) => {
          const status = STATUS_CONFIG[invoice.status];
          return (
            <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-muted/40 flex items-center justify-center">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    ${invoice.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(invoice.date, 'MMM d, yyyy')}
                    {invoice.description && ` • ${invoice.description}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={status.color}>
                  {status.label}
                </Badge>
                {invoice.pdfUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onDownload?.(invoice)}
                  >
                    <Download className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {invoices.length === 0 && (
        <div className="p-8 text-center">
          <FileText className="size-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No invoices yet</p>
        </div>
      )}
    </Card>
  );
}

// Payment Method Card
interface PaymentMethodProps {
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function PaymentMethod({
  last4,
  brand,
  expiryMonth,
  expiryYear,
  isDefault,
  onEdit,
  onRemove,
  className,
}: PaymentMethodProps) {
  return (
    <Card className={cn("p-4", isDefault && "border-primary", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-muted/40 flex items-center justify-center">
            <CreditCard className="size-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">
                {brand && `${brand} `}•••• {last4}
              </p>
              {isDefault && (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
            </div>
            {expiryMonth && expiryYear && (
              <p className="text-sm text-muted-foreground">
                Expires {expiryMonth.toString().padStart(2, '0')}/{expiryYear}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onRemove && !isDefault && (
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600">
              Remove
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Current Plan Card
interface CurrentPlanProps {
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  renewalDate?: Date;
  onManage?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CurrentPlan({ name, price, billing, renewalDate, onManage, onCancel, className }: CurrentPlanProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{name}</h3>
            <Badge className="bg-primary/10 text-primary">Active</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            ${price}<span className="text-base font-normal text-muted-foreground">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
          </p>
          {renewalDate && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="size-4" />
              Renews on {format(renewalDate, 'MMMM d, yyyy')}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {onManage && (
            <Button variant="outline" onClick={onManage}>
              Manage Plan
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="text-red-600">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
