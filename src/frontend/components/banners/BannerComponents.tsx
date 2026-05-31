/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Announcement & Banner Components
 * Top banners, cookie consent, promotional banners
 * Note: Uses <img> for dynamic promotional images
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  X,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCircle,
  Sparkles,
  Gift,
  Bell,
  ExternalLink,
  Cookie,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Announcement Banner (top of page)
type BannerVariant = 'info' | 'warning' | 'success' | 'error' | 'promo';

interface AnnouncementBannerProps {
  message: string;
  variant?: BannerVariant;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const BANNER_CONFIG: Record<BannerVariant, { bg: string; icon: React.ReactNode }> = {
  info: { bg: 'bg-info', icon: <Info className="size-4" /> },
  warning: { bg: 'bg-amber-500', icon: <AlertTriangle className="size-4" /> },
  success: { bg: 'bg-green-600', icon: <CheckCircle className="size-4" /> },
  error: { bg: 'bg-red-600', icon: <AlertTriangle className="size-4" /> },
  promo: { bg: 'bg-gradient-to-r from-purple-600 to-indigo-600', icon: <Sparkles className="size-4" /> },
};

export function AnnouncementBanner({
  message,
  variant = 'info',
  actionLabel,
  actionHref,
  onAction,
  dismissible = true,
  onDismiss,
  icon,
  className,
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = BANNER_CONFIG[variant];

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={cn(config.bg, "text-white py-2 px-4", className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {icon || config.icon}
        <p className="text-sm font-medium">{message}</p>
        {(actionLabel && (actionHref || onAction)) && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
            onClick={onAction}
            asChild={!!actionHref}
          >
            {actionHref ? (
              <a href={actionHref} className="flex items-center gap-1">
                {actionLabel}
                <ExternalLink className="size-3" />
              </a>
            ) : (
              actionLabel
            )}
          </Button>
        )}
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-white hover:bg-white/20 ml-2"
            onClick={handleDismiss}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Cookie Consent Banner
interface CookieConsentProps {
  onAccept: () => void;
  onDecline?: () => void;
  onSettings?: () => void;
  privacyPolicyUrl?: string;
  className?: string;
}

export function CookieConsent({
  onAccept,
  onDecline,
  onSettings,
  privacyPolicyUrl = '/privacy',
  className,
}: CookieConsentProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleAccept = () => {
    setDismissed(true);
    onAccept();
  };

  const handleDecline = () => {
    setDismissed(true);
    onDecline?.();
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4",
      className
    )}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="size-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground/80">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
              <a href={privacyPolicyUrl} className="text-primary hover:underline">
                Learn more
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              Settings
            </Button>
          )}
          {onDecline && (
            <Button variant="outline" size="sm" onClick={handleDecline}>
              Decline
            </Button>
          )}
          <Button size="sm" onClick={handleAccept} className="bg-primary hover:bg-purple-700">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

// Promo Banner Card
interface PromoBannerProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  imageUrl?: string;
  badge?: string;
  onDismiss?: () => void;
  variant?: 'default' | 'gradient' | 'image';
  className?: string;
}

export function PromoBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  imageUrl,
  badge,
  onDismiss,
  variant = 'default',
  className,
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={cn(
      "p-6 relative overflow-hidden",
      variant === 'gradient' && "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none",
      className
    )}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 size-6",
            variant === 'gradient' && "text-white hover:bg-white/20"
          )}
          onClick={handleDismiss}
        >
          <X className="size-4" />
        </Button>
      )}

      <div className="flex items-center gap-6">
        {imageUrl && (
          <img src={imageUrl} alt="" className="size-24 object-cover rounded-lg" />
        )}
        <div className="flex-1">
          {badge && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full mb-2",
              variant === 'gradient' ? "bg-white/20" : "bg-primary/10 text-primary"
            )}>
              <Gift className="size-3" />
              {badge}
            </span>
          )}
          <h3 className={cn(
            "text-lg font-bold",
            variant === 'gradient' ? "text-white" : "text-foreground"
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "text-sm mt-1",
              variant === 'gradient' ? "text-white/80" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
        </div>
        {ctaLabel && (
          <Button
            variant={variant === 'gradient' ? 'secondary' : 'default'}
            onClick={onCtaClick}
            asChild={!!ctaHref}
            className={variant !== 'gradient' ? "bg-primary hover:bg-purple-700" : ""}
          >
            {ctaHref ? <a href={ctaHref}>{ctaLabel}</a> : ctaLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

// System Status Banner
interface SystemStatusBannerProps {
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  message?: string;
  statusPageUrl?: string;
  className?: string;
}

const STATUS_CONFIG = {
  operational: { label: 'All Systems Operational', color: 'bg-green-500', icon: <CheckCircle className="size-4" /> },
  degraded: { label: 'Degraded Performance', color: 'bg-amber-500', icon: <AlertTriangle className="size-4" /> },
  outage: { label: 'Service Outage', color: 'bg-red-500', icon: <AlertTriangle className="size-4" /> },
  maintenance: { label: 'Scheduled Maintenance', color: 'bg-muted/300', icon: <Info className="size-4" /> },
};

export function SystemStatusBanner({ status, message, statusPageUrl, className }: SystemStatusBannerProps) {
  const config = STATUS_CONFIG[status];

  if (status === 'operational') return null;

  return (
    <div className={cn(config.color, "text-white py-2 px-4", className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {config.icon}
        <span className="text-sm font-medium">{message || config.label}</span>
        {statusPageUrl && (
          <a
            href={statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:no-underline flex items-center gap-1"
          >
            Status Page <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// Notification Permission Banner
interface NotificationBannerProps {
  onEnable: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function NotificationBanner({ onEnable, onDismiss, className }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className={cn("p-4 border-primary/20 bg-primary/5", className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
          <Bell className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">Enable Notifications</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Get notified about new leads, messages, and important updates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setDismissed(true); onDismiss?.(); }}>
            Not Now
          </Button>
          <Button size="sm" onClick={onEnable} className="bg-primary hover:bg-purple-700">
            Enable
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Privacy Notice Banner
interface PrivacyNoticeBannerProps {
  onAccept: () => void;
  privacyUrl?: string;
  className?: string;
}

export function PrivacyNoticeBanner({ onAccept, privacyUrl = '/privacy', className }: PrivacyNoticeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 max-w-md bg-white rounded-lg shadow-lg border p-4 z-50",
      className
    )}>
      <div className="flex items-start gap-3">
        <Shield className="size-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-foreground">Privacy Notice</h4>
          <p className="text-sm text-muted-foreground mt-1">
            We value your privacy. Read our{' '}
            <a href={privacyUrl} className="text-primary hover:underline">
              privacy policy
            </a>{' '}
            to learn how we handle your data.
          </p>
          <Button
            size="sm"
            className="mt-3 bg-primary hover:bg-purple-700"
            onClick={() => { setDismissed(true); onAccept(); }}
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}

// Feature Announcement
interface FeatureAnnouncementProps {
  title: string;
  description: string;
  features?: string[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function FeatureAnnouncement({
  title,
  description,
  features,
  ctaLabel = "Learn More",
  onCtaClick,
  onDismiss,
  className,
}: FeatureAnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-primary/10", className)}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-6"
          onClick={() => { setDismissed(true); onDismiss(); }}
        >
          <X className="size-4" />
        </Button>
      )}
      <div className="flex items-center gap-2 text-primary mb-3">
        <Megaphone className="size-5" />
        <span className="text-sm font-medium">New Feature</span>
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
      {features && features.length > 0 && (
        <ul className="mt-3 space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      {ctaLabel && (
        <Button onClick={onCtaClick} className="mt-4 bg-primary hover:bg-purple-700">
          {ctaLabel}
        </Button>
      )}
    </Card>
  );
}
