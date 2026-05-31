/**
 * Type declarations for rtl-detect package
 *
 * Provides types for detecting RTL (right-to-left) language direction
 */

declare module 'rtl-detect' {
  /**
   * Get the text direction for a language code
   * @param locale - Language code (e.g., 'en', 'ar', 'he')
   * @returns 'rtl' for right-to-left languages, 'ltr' for left-to-right languages
   */
  export function getLangDir(locale: string): 'rtl' | 'ltr';

  /**
   * Check if a language code represents an RTL language
   * @param locale - Language code to check
   * @returns true if the language is RTL, false otherwise
   */
  export function isRtlLang(locale: string): boolean;
}
