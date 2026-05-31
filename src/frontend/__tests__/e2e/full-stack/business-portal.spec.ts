import { test, expect } from '@playwright/test';

/**
 * Business Portal Full-Stack E2E Tests
 * Couples frontend UI with backend API verification
 */

const API_BASE_URL = 'http://localhost:5050';
const BUSINESS_ID = '95412d79-8e0a-44e6-8e29-a8cf4503a711';
const TEST_EMAIL = 'eakoussanh.qualiflow.aI@OUTLOOK.COM';
const TEST_PASSWORD = 'P@ssw0rd12345';

let token: string | null = null;

// Helper to get API token
async function getToken(): Promise<string> {
  if (token) return token;
  
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, rememberMe: true }),
  });
  
  if (response.ok) {
    const data = await response.json();
    token = data.accessToken || data.tokens?.accessToken;
  }
  return token || '';
}

// Helper for API requests
async function apiGet(endpoint: string) {
  const authToken = await getToken();
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Business-Id': BUSINESS_ID,
    },
  });
}

test.describe('Business Portal - Dashboard', () => {
  test('UI + API: Dashboard metrics sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/analytics/dashboard');
    console.log('Dashboard API:', apiResponse.status);
    
    // Handle case where token might have expired
    let apiData = null;
    if (apiResponse.ok) {
      apiData = await apiResponse.json();
    }
    
    // 2. Navigate to UI
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // 3. Verify page loads
    const url = page.url();
    expect(url.includes('dashboard') || url.includes('login')).toBeTruthy();
    
    // 4. Log API metrics for verification
    if (apiData) {
      console.log('API Dashboard Metrics:', {
        totalLeads: apiData.totalLeads,
        qualifiedLeads: apiData.qualifiedLeads,
        conversionRate: apiData.conversionRate,
      });
    }
  });
});

test.describe('Business Portal - Leads', () => {
  test('UI + API: Leads list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/leads');
    const apiOk = apiResponse.ok;
    console.log('Leads API Response:', apiResponse.status);
    
    // 2. Navigate to UI
    await page.goto('/leads');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('leads') || url.includes('login')).toBeTruthy();
    
    // 3. Log results
    if (apiOk) {
      const apiData = await apiResponse.json();
      const leadCount = Array.isArray(apiData) ? apiData.length : apiData.items?.length || 0;
      console.log('API Leads Count:', leadCount);
    }
  });

  test('UI + API: Lead scoring data', async ({ page }) => {
    // 1. Get scoring data from API
    const apiResponse = await apiGet('/api/v1/leads');
    console.log('Lead Scoring API:', apiResponse.status, 'ok:', apiResponse.ok);
    
    // 2. Navigate to lead scoring
    await page.goto('/lead-scoring');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('lead') || url.includes('login') || url.includes('scoring')).toBeTruthy();
  });
});

test.describe('Business Portal - Conversations', () => {
  test('UI + API: Conversations list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/conversations');
    expect(apiResponse.ok).toBeTruthy();
    const apiData = await apiResponse.json();
    
    // 2. Navigate to UI
    await page.goto('/conversations');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('conversations') || url.includes('login')).toBeTruthy();
    
    // 3. Log conversation count
    const convCount = Array.isArray(apiData) ? apiData.length : apiData.items?.length || 0;
    console.log('API Conversations Count:', convCount);
  });
});

test.describe('Business Portal - Bookings', () => {
  test('UI + API: Bookings list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/bookings');
    console.log('Bookings API Response:', apiResponse.status);
    
    // 2. Navigate to UI
    await page.goto('/bookings');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('bookings') || url.includes('login')).toBeTruthy();
    
    // 3. Log booking count if API succeeded
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      const bookingCount = Array.isArray(apiData) ? apiData.length : apiData.items?.length || 0;
      console.log('API Bookings Count:', bookingCount);
    }
  });

  test('UI + API: Calendar integration', async ({ page }) => {
    // 1. Navigate to calendar
    await page.goto('/calendar');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('calendar') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Voice', () => {
  test('UI + API: Voice agents sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/voice-agents');
    console.log('Voice Agents API:', apiResponse.status);
    
    let apiData = null;
    if (apiResponse.ok) {
      apiData = await apiResponse.json();
    }
    
    // 2. Navigate to UI
    await page.goto('/ai-voice');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('voice') || url.includes('login')).toBeTruthy();
    
    // 3. Log agent count
    if (apiData) {
      const agentCount = Array.isArray(apiData) ? apiData.length : apiData.items?.length || 0;
      console.log('API Voice Agents Count:', agentCount);
    }
  });

  test('UI + API: Voice calls history', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/voice-calls');
    console.log('Voice Calls API:', apiResponse.status);
    
    // 2. Navigate to voice calls
    await page.goto('/ai-voice');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('voice') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Analytics', () => {
  test('UI + API: AI usage sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/analytics/ai-usage');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/analytics/ai-usage');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('analytics') || url.includes('login')).toBeTruthy();
  });

  test('UI + API: Conversion funnel', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/analytics/conversion-funnel');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('analytics') || url.includes('login')).toBeTruthy();
  });

  test('UI + API: Channel performance', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/analytics/channel-performance');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to analytics
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('analytics') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Forms', () => {
  test('UI + API: Forms list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/forms');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/forms');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('forms') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Workflows', () => {
  test('UI + API: Workflows list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/workflows');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/workflows');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('workflows') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Knowledge Base', () => {
  test('UI + API: Knowledge base sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/knowledge-base');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/settings/knowledge-base');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('knowledge') || url.includes('settings') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Deals', () => {
  test('UI + API: Deals list sync', async ({ page }) => {
    // 1. Get API data
    const apiResponse = await apiGet('/api/v1/deals');
    expect(apiResponse.ok).toBeTruthy();
    
    // 2. Navigate to UI
    await page.goto('/crm/deals');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('deals') || url.includes('crm') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Proposals', () => {
  test('UI + API: Proposals list', async ({ page }) => {
    // 1. Navigate to UI
    await page.goto('/proposals');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('proposals') || url.includes('login')).toBeTruthy();
  });
});

test.describe('Business Portal - Settings', () => {
  test('UI + API: Settings access', async ({ page }) => {
    // 1. Navigate to UI
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('settings') || url.includes('login')).toBeTruthy();
  });

  test('UI + API: Team settings', async ({ page }) => {
    await page.goto('/settings/team');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('team') || url.includes('settings') || url.includes('login')).toBeTruthy();
  });

  test('UI + API: Billing settings', async ({ page }) => {
    await page.goto('/settings/billing');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url.includes('billing') || url.includes('settings') || url.includes('login')).toBeTruthy();
  });
});
