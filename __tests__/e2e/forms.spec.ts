import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test('login form should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show validation error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('login');
  });

  test('signup form should validate required fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Click submit without filling form
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should stay on signup page
      await expect(page).toHaveURL(/signup/);
    }
  });

  test('signup form should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      // Enter weak password
      await passwordInput.fill('123');
      await page.click('button[type="submit"]');
      
      // Should show error or stay on page
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('signup');
    }
  });
});

test.describe('Button Actions', () => {
  test('submit buttons should be clickable', async ({ page }) => {
    await page.goto('/login');
    
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toBeVisible();
  });

  test('links should be clickable', async ({ page }) => {
    await page.goto('/login');
    
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        await expect(link).toBeEnabled();
      }
    }
  });

  test('form inputs should accept text', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });
});

test.describe('UI Components', () => {
  test('should have proper focus states', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.focus();
    
    // Input should be focused
    await expect(emailInput).toBeFocused();
  });

  test('should handle tab navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Press tab to navigate through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should move focus through elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle enter key submission', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.keyboard.press('Enter');
    
    // Form should submit (either error or redirect)
    await page.waitForTimeout(2000);
  });
});
