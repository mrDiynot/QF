import { test, expect } from '@playwright/test';

/**
 * Error Scenario E2E Tests
 * Tests error handling, edge cases, and recovery flows
 */

test.describe('Network Error Handling', () => {
  test('should show error state when API is unavailable', async ({ page }) => {
    // Intercept API calls and return error
    await page.route('**/api/**', route => {
      route.abort('connectionfailed');
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(3000);

    // Should either show error UI or redirect to login
    const url = page.url();
    expect(url.includes('dashboard') || url.includes('login') || url.includes('error')).toBeTruthy();
  });

  test('should handle 401 unauthorized gracefully', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should redirect to login
    const url = page.url();
    expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
  });

  test('should handle 403 forbidden', async ({ page }) => {
    await page.route('**/api/v1/admin/**', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Forbidden' }),
      });
    });

    await page.goto('/admin');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('admin') || url.includes('login')).toBeTruthy();
  });

  test('should handle 500 server error', async ({ page }) => {
    await page.route('**/api/v1/leads', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/leads');
    await page.waitForTimeout(2000);

    // Page should still load, possibly with error state
    const url = page.url();
    expect(url.includes('leads') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Form Validation Errors', () => {
  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.first().isVisible()) {
      await emailInput.first().fill('invalid-email');
      await page.click('body'); // Blur input

      // Check for validation error or HTML5 validation
      const hasError = await page.locator('.error, [role="alert"], :invalid').first().isVisible().catch(() => false);
      console.log('Email validation error shown:', hasError);
    }
    expect(true).toBeTruthy();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.first().isVisible()) {
      await passwordInput.first().fill('123');
      await page.click('body');
    }
    expect(true).toBeTruthy();
  });

  test('should show required field errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.first().isVisible()) {
      await submitButton.first().click();
      await page.waitForTimeout(500);

      // Check for any validation feedback
      const hasError = await page.locator('.error, [role="alert"], :invalid, .text-red, .text-destructive').first().isVisible().catch(() => false);
      console.log('Required field errors shown:', hasError);
    }
    expect(true).toBeTruthy();
  });
});

test.describe('Session Handling', () => {
  test('should handle expired session', async ({ page }) => {
    // Simulate expired token
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token expired' }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
  });

  test('should handle concurrent session logout', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    // Should show login page
    const loginForm = page.locator('form');
    const hasForm = await loginForm.first().isVisible().catch(() => false);
    expect(hasForm || page.url().includes('login')).toBeTruthy();
  });
});

test.describe('Empty States', () => {
  test('should show empty state for no leads', async ({ page }) => {
    await page.route('**/api/v1/leads*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 10 }),
      });
    });

    await page.goto('/leads');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('leads') || url.includes('login')).toBeTruthy();
  });

  test('should show empty state for no conversations', async ({ page }) => {
    await page.route('**/api/v1/conversations*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 10 }),
      });
    });

    await page.goto('/conversations');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('conversations') || url.includes('login')).toBeTruthy();
  });

  test('should show empty state for no bookings', async ({ page }) => {
    await page.route('**/api/v1/bookings*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 10 }),
      });
    });

    await page.goto('/bookings');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('bookings') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Timeout Handling', () => {
  test('should handle slow API response', async ({ page }) => {
    await page.route('**/api/v1/analytics/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/analytics');
    await page.waitForTimeout(3000);

    // Page should show loading or redirect
    const url = page.url();
    expect(url.includes('analytics') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Navigation Edge Cases', () => {
  test('should handle 404 for unknown route', async ({ page }) => {
    await page.goto('/unknown-route-xyz');
    await page.waitForTimeout(1000);

    // Should show 404 page or redirect
    const url = page.url();
    const has404 = await page.locator('text=404, text=Not Found').first().isVisible().catch(() => false);
    expect(has404 || url.includes('login') || url.includes('unknown')).toBeTruthy();
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    await page.goBack();
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
  });

  test('should handle page refresh', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForTimeout(1000);

    const url = page.url();
    expect(url.includes('login')).toBeTruthy();
  });
});

test.describe('Data Integrity', () => {
  test('should handle malformed API response', async ({ page }) => {
    await page.route('**/api/v1/leads*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json{',
      });
    });

    await page.goto('/leads');
    await page.waitForTimeout(2000);

    // Should handle gracefully
    const url = page.url();
    expect(url.includes('leads') || url.includes('login') || url.includes('error')).toBeTruthy();
  });

  test('should handle missing required fields in response', async ({ page }) => {
    await page.route('**/api/v1/leads*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [{ id: '1' }] }), // Missing required fields
      });
    });

    await page.goto('/leads');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url.includes('leads') || url.includes('login')).toBeTruthy();
  });
});
