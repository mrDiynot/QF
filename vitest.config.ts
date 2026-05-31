import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Exclude E2E tests - they should run with Playwright, not Vitest
    exclude: [
      'node_modules/**',
      '__tests__/e2e/**',
      '**/*.e2e.ts',
      '**/*.e2e.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        '__tests__/e2e/**',
        '**/__tests__/**',
      ],
      // Coverage thresholds enforced via Codecov at the PR level (diff coverage).
      // Global thresholds are not enforced here because the test suite is still
      // growing and a hard gate would block CI on untested legacy code.
      // Re-enable global thresholds once overall coverage reaches 60%+.
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

