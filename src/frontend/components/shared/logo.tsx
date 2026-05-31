'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Qualiflow AI Logo — image-based, matching the Coming Soon navigation logo.
 *
 * The source JPG has a white background.
 *  • On light surfaces the white blends invisibly.
 *  • On dark surfaces pass `darkBg` to wrap the image in a white rounded badge
 *    so the white background becomes an intentional design element.
 */

/* ─── Height map ─── */
const IMG_HEIGHTS: Record<string, string> = {
  sm: 'h-8 md:h-10',      // 32→40 px — compact (mobile header, collapsed sidebar)
  md: 'h-10 md:h-14',     // 40→56 px — nav bars
  lg: 'h-14 md:h-18',     // 56→72 px — branding panels (login, register)
  xl: 'h-18 md:h-22',     // 72→88 px — hero / splash
};

/* ─── Padding inside the white badge on dark backgrounds ─── */
const BADGE_PAD: Record<string, string> = {
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-xl',
  lg: 'p-2.5 rounded-xl',
  xl: 'p-3 rounded-2xl',
};

/* ─── Types ─── */
interface LogoProps {
  /** Predefined size token */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** When true, wraps the logo in a white rounded badge (for dark backgrounds) */
  darkBg?: boolean;
  /** Optional link destination */
  href?: string;
  /** Extra classes on the outer wrapper */
  className?: string;
  /* Legacy props kept for API compat — ignored */
  showText?: boolean;
  animated?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

/* ─── Main Logo ─── */
export function Logo({
  size = 'md',
  darkBg = false,
  href,
  className,
}: LogoProps) {
  const heightClass = IMG_HEIGHTS[size] || IMG_HEIGHTS.md;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/qualiflow-logo-full-v8.jpg"
      alt="Qualiflow AI — Every Lead Gets a Reply"
      className={cn(heightClass, 'w-auto', darkBg && 'rounded-lg')}
      draggable={false}
    />
  );

  const content = (
    <div className={cn('inline-flex items-center', className)}>
      {darkBg ? (
        <div className={cn('bg-white shadow-lg', BADGE_PAD[size] || BADGE_PAD.md)}>
          {img}
        </div>
      ) : (
        img
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

/* ─── Icon-only Logo (uses the no-text version) ─── */
export function LogoIcon({
  size = 44,
  className,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/qualiflow-logo_no_text.png"
      alt="Qualiflow AI"
      style={{ height: size, width: size }}
      className={cn('object-contain rounded-xl', className)}
      draggable={false}
    />
  );
}

export const LogoMark = LogoIcon;

/* ─── Admin Logo ─── */
export function AdminLogo({
  size = 'md',
  darkBg = true,
  href,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  /** Pass false on light backgrounds so the JPG blends without a visible badge */
  darkBg?: boolean;
  href?: string;
  className?: string;
}) {
  return <Logo size={size} darkBg={darkBg} href={href} className={className} />;
}

/* ─── Simulator Logo ─── */
export function SimulatorLogo({
  size = 'md',
  darkBg = false,
  href,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  darkBg?: boolean;
  href?: string;
  className?: string;
}) {
  return <Logo size={size} darkBg={darkBg} href={href} className={className} />;
}
