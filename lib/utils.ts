import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a relative URL to an absolute URL using the API base URL.
 * Handles both relative URLs (e.g., /uploads/...) and already-absolute URLs.
 * @param url The URL to convert (can be relative or absolute)
 * @returns The absolute URL, or undefined if no URL provided
 */
export function getAbsoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // If already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Get API base URL from environment (uses existing NEXT_PUBLIC_API_URL)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

  // Ensure no double slashes when joining
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${apiBaseUrl.replace(/\/$/, '')}${cleanUrl}`;
}