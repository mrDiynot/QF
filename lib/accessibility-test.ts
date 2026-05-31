/**
 * Accessibility Testing Configuration
 *
 * This file configures axe-core for automated accessibility testing in development mode.
 * It integrates with React DevTools to provide real-time WCAG compliance feedback.
 *
 * @see https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react
 */

import configureAxe from '@axe-core/react';

/**
 * Configure accessibility testing for development
 *
 * This should be called once in the app initialization (e.g., in layout.tsx or _app.tsx)
 * It will only run in development mode to avoid performance impact in production.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { configureAccessibilityTesting } from '@/lib/accessibility-test';
 *
 * if (process.env.NODE_ENV !== 'production') {
 *   configureAccessibilityTesting();
 * }
 * ```
 */
export const configureAccessibilityTesting = () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactDOM = require('react-dom');

    configureAxe(React, ReactDOM, 1000, {
      // Core WCAG 2.1 Level AA rules
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'aria-required-attr',
          enabled: true,
        },
        {
          id: 'aria-valid-attr',
          enabled: true,
        },
        {
          id: 'aria-valid-attr-value',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'link-name',
          enabled: true,
        },
        {
          id: 'image-alt',
          enabled: true,
        },
        {
          id: 'form-field-multiple-labels',
          enabled: true,
        },
        {
          id: 'frame-title',
          enabled: true,
        },
        {
          id: 'html-has-lang',
          enabled: true,
        },
        {
          id: 'html-lang-valid',
          enabled: true,
        },
        {
          id: 'input-image-alt',
          enabled: true,
        },
        {
          id: 'list',
          enabled: true,
        },
        {
          id: 'listitem',
          enabled: true,
        },
        {
          id: 'meta-viewport',
          enabled: true,
        },
        {
          id: 'region',
          enabled: true,
        },
        {
          id: 'role-img-alt',
          enabled: true,
        },
        {
          id: 'scrollable-region-focusable',
          enabled: true,
        },
        {
          id: 'select-name',
          enabled: true,
        },
        {
          id: 'svg-img-alt',
          enabled: true,
        },
        {
          id: 'valid-lang',
          enabled: true,
        },
      ],
    });

    console.log('[axe-core] Accessibility testing enabled - violations will be logged to console');
  }
};

/**
 * Run a manual accessibility audit on a component
 *
 * Use this for manual testing or in test suites
 *
 * @example
 * ```tsx
 * import { runAccessibilityAudit } from '@/lib/accessibility-test';
 *
 * // In a test
 * const { container } = render(<MyComponent />);
 * const results = await runAccessibilityAudit(container);
 * expect(results.violations).toHaveLength(0);
 * ```
 */
export const runAccessibilityAudit = async (element: HTMLElement) => {
  const axe = (await import('axe-core')).default;
  return axe.run(element);
};

/**
 * Get a summary of accessibility violations
 *
 * @param violations - Array of axe violations
 * @returns Formatted summary string
 */
export const formatViolationsSummary = (violations: { impact: string }[]) => {
  if (violations.length === 0) {
    return '✅ No accessibility violations found';
  }

  const critical = violations.filter(v => v.impact === 'critical').length;
  const serious = violations.filter(v => v.impact === 'serious').length;
  const moderate = violations.filter(v => v.impact === 'moderate').length;
  const minor = violations.filter(v => v.impact === 'minor').length;

  return `
❌ Found ${violations.length} accessibility violation(s):
  - Critical: ${critical}
  - Serious: ${serious}
  - Moderate: ${moderate}
  - Minor: ${minor}
  `.trim();
};
