'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToHomeLinkProps {
  className?: string;
  label?: string;
}

export function BackToHomeLink({ className, label = 'Back to Home' }: BackToHomeLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group",
        className
      )}
    >
      <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform duration-200" />
      {label}
    </Link>
  );
}
