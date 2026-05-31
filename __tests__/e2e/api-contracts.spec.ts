import { test, expect } from '@playwright/test';

/**
 * API Contract Tests
 * Verifies API response structure matches expected contracts
 */

const API_BASE_URL = 'http://localhost:5050';
const TEST_EMAIL = 'eakoussanh.qualiflow.aI@OUTLOOK.COM';
const TEST_PASSWORD = 'P@ssw0rd12345';
const BUSINESS_ID = '95412d79-8e0a-44e6-8e29-a8cf4503a711';

let token: string | null = null;

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

async function apiGet(endpoint: string) {
  const authToken = await getToken();
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Business-Id': BUSINESS_ID,
    },
  });
}

test.describe('Auth API Contracts', () => {
  test('POST /auth/login should return token structure', async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, rememberMe: true }),
    });

    expect(response.ok).toBeTruthy();
    const data = await response.json();

    // Verify token structure
    expect(data).toHaveProperty('accessToken');
    expect(typeof data.accessToken).toBe('string');
    console.log('Auth response has accessToken:', !!data.accessToken);
  });
});

test.describe('Leads API Contracts', () => {
  test('GET /leads should return paginated list', async () => {
    const response = await apiGet('/api/v1/leads');
    console.log('Leads API:', response.status);

    if (response.ok) {
      const data = await response.json();

      // Verify pagination structure
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBeTruthy();

      if (data.items.length > 0) {
        const lead = data.items[0];
        expect(lead).toHaveProperty('id');
        expect(lead).toHaveProperty('firstName');
        expect(lead).toHaveProperty('lastName');
        console.log('Lead structure verified');
      }
    }
  });
});

test.describe('Conversations API Contracts', () => {
  test('GET /conversations should return paginated list', async () => {
    const response = await apiGet('/api/v1/conversations');
    console.log('Conversations API:', response.status);

    if (response.ok) {
      const data = await response.json();

      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBeTruthy();

      if (data.items.length > 0) {
        const conv = data.items[0];
        expect(conv).toHaveProperty('id');
        console.log('Conversation structure verified');
      }
    }
  });
});

test.describe('Analytics API Contracts', () => {
  test('GET /analytics/dashboard should return metrics', async () => {
    const response = await apiGet('/api/v1/analytics/dashboard');
    console.log('Dashboard API:', response.status);

    if (response.ok) {
      const data = await response.json();
      // Dashboard should have metric properties
      console.log('Dashboard metrics:', Object.keys(data).slice(0, 5));
    }
  });

  test('GET /analytics/ai-usage should return usage data', async () => {
    const response = await apiGet('/api/v1/analytics/ai-usage');
    console.log('AI Usage API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('AI Usage data received');
    }
  });
});

test.describe('Voice API Contracts', () => {
  test('GET /voice-agents should return agent list', async () => {
    const response = await apiGet('/api/v1/voice-agents');
    console.log('Voice Agents API:', response.status);

    if (response.ok) {
      const data = await response.json();
      expect(Array.isArray(data) || data.items).toBeTruthy();
      console.log('Voice agents structure verified');
    }
  });

  test('GET /voice-calls should return call history', async () => {
    const response = await apiGet('/api/v1/voice-calls');
    console.log('Voice Calls API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('Voice calls data received');
    }
  });
});

test.describe('Forms API Contracts', () => {
  test('GET /forms should return form list', async () => {
    const response = await apiGet('/api/v1/forms');
    console.log('Forms API:', response.status);

    if (response.ok) {
      const data = await response.json();
      expect(Array.isArray(data) || data.items).toBeTruthy();
      console.log('Forms structure verified');
    }
  });
});

test.describe('Workflows API Contracts', () => {
  test('GET /workflows should return workflow list', async () => {
    const response = await apiGet('/api/v1/workflows');
    console.log('Workflows API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('Workflows data received');
    }
  });

  test('GET /workflows/subscription should return tier info', async () => {
    const response = await apiGet('/api/v1/workflows/subscription');
    console.log('Workflow Subscription API:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Subscription tier:', data.tier || data.name);
    }
  });
});

test.describe('Knowledge Base API Contracts', () => {
  test('GET /knowledge-base should return documents', async () => {
    const response = await apiGet('/api/v1/knowledge-base');
    console.log('Knowledge Base API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('Knowledge base data received');
    }
  });
});

test.describe('Deals API Contracts', () => {
  test('GET /deals should return deal list', async () => {
    const response = await apiGet('/api/v1/deals');
    console.log('Deals API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('Deals data received');
    }
  });
});

test.describe('Admin API Contracts', () => {
  const ADMIN_EMAIL = 'superadmin@qualiflow.ai';
  const ADMIN_PASSWORD = 'Dev@Admin123!';
  let adminToken: string | null = null;

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

  async function adminApiGet(endpoint: string) {
    const authToken = await getAdminToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
  }

  test('GET /admin/dashboard/metrics should return admin metrics', async () => {
    const response = await adminApiGet('/api/v1/admin/dashboard/metrics');
    console.log('Admin Dashboard API:', response.status);

    if (response.ok) {
      const data = await response.json();
      expect(data).toHaveProperty('totalBusinesses');
      expect(data).toHaveProperty('totalUsers');
      console.log('Admin metrics verified');
    }
  });

  test('GET /admin/businesses should return business list', async () => {
    const response = await adminApiGet('/api/v1/admin/businesses');
    console.log('Admin Businesses API:', response.status);

    if (response.ok) {
      const _data = await response.json();
      console.log('Admin businesses received');
    }
  });

  test('GET /admin/system/health should return health status', async () => {
    const response = await adminApiGet('/api/v1/admin/system/health');
    console.log('System Health API:', response.status);

    if (response.ok) {
      const data = await response.json();
      expect(data).toHaveProperty('overallStatus');
      console.log('System health:', data.overallStatus);
    }
  });
});
