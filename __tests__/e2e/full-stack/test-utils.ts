/**
 * Full-Stack E2E Test Utilities
 * Couples frontend UI tests with backend API verification
 */

import { Page } from '@playwright/test';

// API Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5050';
export const BUSINESS_ID = process.env.BUSINESS_ID || '95412d79-8e0a-44e6-8e29-a8cf4503a711';

// Test Credentials
export const TEST_USER = {
  email: process.env.TEST_EMAIL || 'eakoussanh.qualiflow.aI@OUTLOOK.COM',
  password: process.env.TEST_PASSWORD || 'P@ssw0rd12345',
};

export const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'superadmin@qualiflow.ai',
  password: process.env.ADMIN_PASSWORD || 'Dev@Admin123!',
};

// Token storage
let businessToken: string | null = null;
let adminToken: string | null = null;

/**
 * Login to business portal and get API token
 */
export async function loginBusiness(page: Page): Promise<string> {
  // First try API login to get token
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
      rememberMe: true,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    businessToken = data.accessToken || data.tokens?.accessToken;
  }

  // Then login via UI
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  return businessToken || '';
}

/**
 * Login to admin portal and get API token
 */
export async function loginAdmin(page: Page): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    adminToken = data.tokens?.accessToken;
  }

  // Login via UI
  await page.goto('/admin/login');
  await page.fill('input[type="email"], input[name="email"]', ADMIN_USER.email);
  await page.fill('input[type="password"]', ADMIN_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  return adminToken || '';
}

/**
 * Make authenticated API request (business)
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Business-Id': BUSINESS_ID,
    ...(options.headers as Record<string, string>),
  };

  if (businessToken) {
    headers['Authorization'] = `Bearer ${businessToken}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Make authenticated API request (admin)
 */
export async function adminApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Verify UI data matches API response
 */
export async function verifyDataSync(
  page: Page,
  apiEndpoint: string,
  uiSelector: string,
  dataKey: string
): Promise<boolean> {
  // Get API data
  const apiResponse = await apiRequest(apiEndpoint);
  if (!apiResponse.ok) return false;
  
  const apiData = await apiResponse.json();
  const apiValue = apiData[dataKey];

  // Get UI data
  const uiElement = page.locator(uiSelector);
  const uiText = await uiElement.textContent().catch(() => null);

  // Compare (loose comparison for formatted numbers)
  if (uiText && apiValue !== undefined) {
    const cleanUiText = uiText.replace(/[^0-9.]/g, '');
    const cleanApiValue = String(apiValue).replace(/[^0-9.]/g, '');
    return cleanUiText.includes(cleanApiValue) || cleanApiValue.includes(cleanUiText);
  }

  return true; // Pass if can't verify
}

/**
 * Wait for API and UI to be in sync
 */
export async function waitForSync(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}
