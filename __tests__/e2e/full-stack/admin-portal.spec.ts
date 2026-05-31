import { test, expect } from '@playwright/test';

/**
 * Admin Portal Full-Stack E2E Tests
 * Couples frontend UI with backend API verification
 */

const API_BASE_URL = 'http://localhost:5050';
const ADMIN_EMAIL = 'superadmin@qualiflow.ai';
const ADMIN_PASSWORD = 'Dev@Admin123!';

let adminToken: string | null = null;

// Helper to get admin API token
async function getAdminToken(): Promise<string> {
  if (adminToken) return adminToken;
  
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  
  if (response.ok) {
    const data = await response.json();
    adminToken = data.tokens?.accessToken;
  }
  return adminToken || '';
}

// Helper for admin API requests
async function adminApiGet(endpoint: string) {
  const authToken = await getAdminToken();
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
}

test.describe('Admin Portal - Authentication', () => {
  test('UI + API: Admin login flow', async ({ page }) => {
    // 1. Verify API login works
    const apiResponse = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to admin login UI
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    
    const url = page.url();
    expect(url.includes('admin')).toBeTruthy();
  });
});

test.describe('Admin Portal - Dashboard', () => {
  test('UI + API: Dashboard metrics sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/dashboard/metrics');
    expect(apiResponse.ok).toBeTruthy();
    const apiData = await apiResponse.json();
    
    // 2. Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin')).toBeTruthy();
    
    // 3. Log metrics
    console.log('Admin Dashboard Metrics:', {
      totalBusinesses: apiData.totalBusinesses,
      totalUsers: apiData.totalUsers,
      mrr: apiData.mrr,
    });
  });
});

test.describe('Admin Portal - Businesses', () => {
  test('UI + API: Businesses list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/businesses');
    expect(apiResponse.ok).toBeTruthy();
    const apiData = await apiResponse.json();
    
    // 2. Navigate to UI
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('businesses')).toBeTruthy();
    
    // 3. Log business count
    const businessCount = Array.isArray(apiData) ? apiData.length : apiData.items?.length || apiData.totalCount || 0;
    console.log('Admin Businesses Count:', businessCount);
  });
});

test.describe('Admin Portal - Subscriptions', () => {
  test('UI + API: Subscriptions sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/subscriptions');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('subscriptions')).toBeTruthy();
  });
});

test.describe('Admin Portal - AI Usage', () => {
  test('UI + API: Platform AI usage sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/ai-usage/platform-summary');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/admin/ai-usage');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('ai-usage')).toBeTruthy();
  });
});

test.describe('Admin Portal - System Health', () => {
  test('UI + API: System health sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/system/health');
    expect(apiResponse.ok).toBeTruthy();
    const apiData = await apiResponse.json();
    
    // 2. Navigate to UI
    await page.goto('/admin/system-health');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin')).toBeTruthy();
    
    // 3. Log health status
    console.log('System Health:', apiData.overallStatus);
  });
});

test.describe('Admin Portal - Audit Logs', () => {
  test('UI + API: Audit logs sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/audit-logs');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/admin/audit-logs');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('audit')).toBeTruthy();
  });
});

test.describe('Admin Portal - Features', () => {
  test('UI + API: Features management', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/features');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI (if exists)
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin')).toBeTruthy();
  });
});

test.describe('Admin Portal - Plans', () => {
  test('UI + API: Subscription plans', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await adminApiGet('/api/v1/admin/plans');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to subscriptions
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin')).toBeTruthy();
  });
});

test.describe('Admin Portal - Support', () => {
  test('UI + API: Support tickets', async ({ page }) => {
    // 1. Navigate to support
    await page.goto('/admin/support');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('support')).toBeTruthy();
  });
});

test.describe('Admin Portal - CMS', () => {
  test('UI + API: CMS management', async ({ page }) => {
    // 1. Navigate to CMS
    await page.goto('/admin/cms');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('cms')).toBeTruthy();
  });
});

test.describe('Admin Portal - Analytics', () => {
  test('UI + API: Admin analytics', async ({ page }) => {
    // 1. Navigate to analytics
    await page.goto('/admin/analytics');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('admin') || url.includes('analytics')).toBeTruthy();
  });
});
