import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ComingSoonPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  sprint?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function ComingSoonPlaceholder({
  icon: Icon,
  title,
  description,
  sprint,
  primaryAction = { label: 'Explore Dashboard', href: '/dashboard' },
  secondaryAction = { label: 'Contact Support', href: '/settings' },
}: ComingSoonPlaceholderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <Icon className="mx-auto size-16 text-brand-purple" />
        </div>
        <h1 className="heading-1 mb-4 text-text-navy">{title}</h1>
        <p className="body-text mb-2 text-gray-text">{description}</p>
        {sprint && (
          <p className="small-text mb-6 text-text-muted">
            Expected release: {sprint}
          </p>
        )}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}