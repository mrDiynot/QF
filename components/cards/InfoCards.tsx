/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Info Cards Collection
 * Various card components for displaying information
 * Note: Uses <img> for dynamic external images
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Feature Card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function FeatureCard({ icon, title, description, action, className }: FeatureCardProps) {
  return (
    <Card className={cn("p-6 hover:shadow-md transition-shadow", className)}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
      {action && (
        <Button variant="link" className="p-0 h-auto mt-4 text-primary" asChild={!!action.href}>
          {action.href ? (
            <a href={action.href} className="flex items-center gap-1">
              {action.label} <ArrowRight className="size-4" />
            </a>
          ) : (
            <span onClick={action.onClick} className="flex items-center gap-1 cursor-pointer">
              {action.label} <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      )}
    </Card>
  );
}

// Profile Card
interface ProfileCardProps {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileCard({ name, role, company, email, phone, avatar, actions, className }: ProfileCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start gap-4">
        <Avatar className="size-16">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-lg">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          {role && <p className="text-sm text-muted-foreground">{role}</p>}
          {company && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Building className="size-3" />
              {company}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Mail className="size-4" /> {email}
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Phone className="size-4" /> {phone}
          </a>
        )}
      </div>
      {actions && <div className="mt-4 pt-4 border-t flex gap-2">{actions}</div>}
    </Card>
  );
}

// Pricing Card
interface PricingCardProps {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  action?: { label: string; onClick?: () => void };
  className?: string;
}

export function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features,
  highlighted = false,
  badge,
  action,
  className,
}: PricingCardProps) {
  return (
    <Card className={cn(
      "p-6 relative",
      highlighted && "border-primary border-2 shadow-lg",
      className
    )}>
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">{badge}</Badge>
      )}
      <div className="text-center mb-6">
        <h3 className="font-semibold text-foreground">{name}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">
            {typeof price === 'number' ? `$${price}` : price}
          </span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <Star className="size-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      {action && (
        <Button
          onClick={action.onClick}
          className="w-full"
          variant={highlighted ? "default" : "outline"}
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}

// Event Card
interface EventCardProps {
  title: string;
  date: Date;
  time?: string;
  location?: string;
  attendees?: number;
  image?: string;
  className?: string;
}

export function EventCard({ title, date, time, location, attendees, image, className }: EventCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {image && (
        <div className="h-32 bg-muted/40">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {time && <span>• {time}</span>}
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              {location}
            </div>
          )}
          {attendees !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              {attendees} attending
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Summary Card
interface SummaryCardProps {
  title: string;
  items: Array<{ label: string; value: string | number }>;
  footer?: React.ReactNode;
  className?: string;
}

export function SummaryCard({ title, items, footer, className }: SummaryCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
    </Card>
  );
}

// Action Card
interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}

export function ActionCard({ title, description, icon, onClick, href, disabled, className }: ActionCardProps) {
  const content = (
    <Card className={cn(
      "p-4 flex items-center gap-4 transition-all cursor-pointer",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:border-primary/30",
      className
    )}>
      {icon && (
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{title}</h4>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <ArrowRight className="size-5 text-muted-foreground/60" />
    </Card>
  );

  if (href && !disabled) {
    return <a href={href}>{content}</a>;
  }

  return <div onClick={disabled ? undefined : onClick}>{content}</div>;
}

// Testimonial Card
interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ quote, author, role, company, avatar, rating, className }: TestimonialCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      {rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("size-4", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
            />
          ))}
        </div>
      )}
      <blockquote className="text-muted-foreground italic">&quot;{quote}&quot;</blockquote>
      <div className="flex items-center gap-3 mt-4">
        <Avatar className="size-10">
          <AvatarImage src={avatar} />
          <AvatarFallback>{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{author}</p>
          {(role || company) && (
            <p className="text-sm text-muted-foreground">
              {role}{role && company && ' at '}{company}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Metric Card with sparkline placeholder
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  className?: string;
}

export function MetricCard({ title, value, change, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        {change && (
          <Badge variant={trend === 'up' ? "success" : "destructive"}>
            {trend === 'up' ? '+' : ''}{change.value}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {change && <p className="text-xs text-muted-foreground/60 mt-1">{change.label}</p>}
      </div>
    </Card>
  );
}
