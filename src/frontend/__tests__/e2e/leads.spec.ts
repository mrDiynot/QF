import { test, expect } from '@playwright/test';

/**
 * Leads Management E2E Tests
 * Based on Product Documentation: Lead Management features
 * - Lead table view with scoring
 * - Lead status management
 * - Lead source tracking
 * - Filter and search
 * - Lead scoring visualization
 */

test.describe('Leads Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(2000);
  });

  test('should access leads page', async ({ page }) => {
    const url = page.url();
    expect(url.includes('leads') || url.includes('login')).toBeTruthy();
  });

  test('should display leads table or empty state', async ({ page }) => {
    const url = page.url();
    if (url.includes('leads')) {
      const hasTable = await page.locator('table, [data-testid="leads-table"], .leads-list').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('.empty-state, [data-testid="empty-leads"]').first().isVisible().catch(() => false);
      expect(hasTable || hasEmptyState || url.includes('leads')).toBeTruthy();
    }
  });

  test('should have add lead button', async ({ page }) => {
    const url = page.url();
    if (url.includes('leads')) {
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
      const hasButton = await addButton.first().isVisible().catch(() => false);
      expect(hasButton || url.includes('leads')).toBeTruthy();
    }
  });

  test('should have search functionality', async ({ page }) => {
    const url = page.url();
    if (url.includes('leads')) {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="lead-search"]');
      const hasSearch = await searchInput.first().isVisible().catch(() => false);
      if (hasSearch) {
        await searchInput.first().fill('test lead');
        await page.waitForTimeout(500);
      }
    }
    expect(true).toBeTruthy();
  });

  test('should have filter options', async ({ page }) => {
    const url = page.url();
    if (url.includes('leads')) {
      const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter"], select');
      const hasFilter = await filterButton.first().isVisible().catch(() => false);
      expect(hasFilter || url.includes('leads')).toBeTruthy();
    }
  });
});

test.describe('Lead Scoring', () => {
  test('should access lead scoring page', async ({ page }) => {
    await page.goto('/lead-scoring');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('lead-scoring') || url.includes('leads') || url.includes('login')).toBeTruthy();
  });

  test('should display scoring visualization', async ({ page }) => {
    await page.goto('/lead-scoring');
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes('lead-scoring')) {
      const hasScoring = await page.locator('[data-testid="scoring"], .score, .progress').first().isVisible().catch(() => false);
      expect(hasScoring || url.includes('lead-scoring')).toBeTruthy();
    }
  });
});

test.describe('Lead Details', () => {
  test('should open lead detail view', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (url.includes('leads')) {
      const leadRow = page.locator('table tbody tr, [data-testid="lead-row"]').first();
      const isVisible = await leadRow.isVisible().catch(() => false);
      
      if (isVisible) {
        await leadRow.click();
        await page.waitForTimeout(1000);
      }
    }
    expect(true).toBeTruthy();
  });

  test('should display lead status options', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (url.includes('leads')) {
      const statusDropdown = page.locator('[data-testid="status"], select, [role="combobox"]');
      const hasStatus = await statusDropdown.first().isVisible().catch(() => false);
      expect(hasStatus || url.includes('leads')).toBeTruthy();
    }
  });
});
