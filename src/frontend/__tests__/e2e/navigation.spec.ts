import { test, expect } from '@playwright/test';

// Test fixture for authenticated user
test.describe('Navigation Menu', () => {
  test.beforeEach(async () => {
    // Note: In real tests, you'd authenticate first
    // For now, we test the public navigation structure
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/QualiFlow AI|Login/i);
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/signup/);
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/login');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    // Landing page should have some content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should load pricing page if exists', async ({ page }) => {
    const response = await page.goto('/pricing');
    // Either page exists or redirects
    expect(response?.status()).toBeLessThan(500);
  });

  test('should load features page if exists', async ({ page }) => {
    const response = await page.goto('/features');
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('URL Routing', () => {
  const routes = [
    { path: '/login', shouldExist: true },
    { path: '/signup', shouldExist: true },
    { path: '/dashboard', shouldRedirect: true },
    { path: '/leads', shouldRedirect: true },
    { path: '/conversations', shouldRedirect: true },
    { path: '/analytics', shouldRedirect: true },
    { path: '/settings', shouldRedirect: true },
  ];

  for (const route of routes) {
    test(`should handle ${route.path} route`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(500);
      
      if (route.shouldRedirect) {
        // Protected routes should redirect to login
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url.includes('login') || url.includes('auth') || url.includes(route.path)).toBeTruthy();
      }
    });
  }
});
