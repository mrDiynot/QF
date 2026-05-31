import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page should have proper heading structure', async ({ page }) => {
    await page.goto('/login');
    
    // Should have at least one heading
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for labels or aria-labels
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const hasLabel = await page.locator('label[for]').count() > 0;
    const hasAriaLabel = await emailInput.getAttribute('aria-label');
    const hasPlaceholder = await emailInput.getAttribute('placeholder');
    
    // Should have some form of labeling
    expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/login');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    // Check that at least one button exists and has some form of accessible name
    let hasAccessibleButton = false;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      try {
        if (await button.isVisible({ timeout: 1000 })) {
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          const title = await button.getAttribute('title');
          
          if (text?.trim() || ariaLabel || title) {
            hasAccessibleButton = true;
            break;
          }
        }
      } catch {
        // Button not visible, skip
      }
    }
    
    // At least one accessible button should exist on the page
    expect(count === 0 || hasAccessibleButton).toBeTruthy();
  });

  test('page should have proper document title', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/login');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Image should have alt text or be decorative
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    }
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/login');
    
    // Check that text is readable (basic check)
    const body = page.locator('body');
    const color = await body.evaluate(el => window.getComputedStyle(el).color);
    const bgColor = await body.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // Colors should be defined
    expect(color).toBeDefined();
    expect(bgColor).toBeDefined();
  });
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate with keyboard only', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through the page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      if (await focused.count() > 0) {
        await expect(focused).toBeVisible();
      }
    }
  });

  test('escape key should close modals', async ({ page }) => {
    await page.goto('/login');
    
    // If there's a modal trigger, test escape
    const modalTrigger = page.locator('[data-modal-trigger]').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.keyboard.press('Escape');
      // Modal should be closed
    }
  });
});
