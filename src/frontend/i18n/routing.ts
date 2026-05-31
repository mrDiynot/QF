"use client";

/**
 * Internationalization Routing
 *
 * Simple wrapper for next-intl routing compatibility with DashCode components
 * For now, this just re-exports Next.js Link since full i18n is not configured
 */

import { usePathname as nextUsePathname, useRouter as nextUseRouter } from "next/navigation";

// Re-export Next.js Link for now (until full i18n is configured)
export { default as Link } from "next/link";

// Placeholder for future i18n routing functions
export const usePathname = () => {
  return nextUsePathname();
};

export const useRouter = () => {
  return nextUseRouter();
};

/**
 * Mock useTranslations hook
 *
 * Returns a simple function that passes through the key
 * This allows DashCode components to work without full i18n setup
 */
export const useTranslations = (_namespace?: string) => {
  return (key: string) => {
    // For now, just return the key itself as the translation
    // This will display English fallback text from the components
    return key;
  };
};
