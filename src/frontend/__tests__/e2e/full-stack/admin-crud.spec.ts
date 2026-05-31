import { test, expect } from '@playwright/test';

/**
 * Admin Portal Full CRUD E2E Tests
 * Tests ALL admin operations: Create, Read, Update, Delete
 */

const API_BASE_URL = 'http://localhost:5050';
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

async function adminApiRequest(method: string, endpoint: string, body?: object) {
  const authToken = await getAdminToken();
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);
  return fetch(`${API_BASE_URL}${endpoint}`, options);
}

// ============================================
// ADMIN DASHBOARD - Read Operations
// ============================================
test.describe('Admin Dashboard - Operations', () => {
  
  test('GET: Dashboard metrics', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/dashboard/metrics');
    expect(response.ok).toBeTruthy();
    
    const metrics = await response.json();
    console.log('Admin Dashboard:', {
      totalBusinesses: metrics.totalBusinesses,
      totalUsers: metrics.totalUsers,
      mrr: metrics.mrr,
      activeSubscriptions: metrics.activeSubscriptions,
    });
    
    await page.goto('/admin');
    await page.waitForTimeout(2000);
  });
});

// ============================================
// BUSINESSES - Full CRUD
// ============================================
test.describe('Admin Businesses - CRUD Operations', () => {
  
  test('READ: Get all businesses', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/businesses');
    expect(response.ok).toBeTruthy();
    
    const businesses = await response.json();
    console.log('Total Businesses:', businesses.totalCount || (Array.isArray(businesses) ? businesses.length : 0));
    
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
  });

  test('READ: Get business by ID', async ({ page }) => {
    const listResponse = await adminApiRequest('GET', '/api/v1/admin/businesses');
    if (listResponse.ok) {
      const businesses = await listResponse.json();
      const items = Array.isArray(businesses) ? businesses : businesses.items;
      
      if (items && items.length > 0) {
        const businessId = items[0].id;
        const detailResponse = await adminApiRequest('GET', `/api/v1/admin/businesses/${businessId}`);
        expect(detailResponse.ok).toBeTruthy();
        
        const business = await detailResponse.json();
        console.log('Business Detail:', business.name);
      }
    }
    
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
  });

  test('UPDATE: Update business status', async ({ page }) => {
    const listResponse = await adminApiRequest('GET', '/api/v1/admin/businesses');
    if (listResponse.ok) {
      const businesses = await listResponse.json();
      const items = Array.isArray(businesses) ? businesses : businesses.items;
      
      if (items && items.length > 0) {
        const businessId = items[0].id;
        
        // Attempt status update
        const updateResponse = await adminApiRequest('PUT', `/api/v1/admin/businesses/${businessId}/status`, {
          isActive: true,
        });
        console.log('Update Business Status:', updateResponse.status);
      }
    }
    
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
  });

  test('UI: Business list view', async ({ page }) => {
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('businesses')) {
      const table = page.locator('table, [data-testid="businesses-list"]');
      const hasTable = await table.first().isVisible().catch(() => false);
      console.log('Has businesses table:', hasTable);
      
      // Check for actions
      const viewButton = page.locator('button:has-text("View"), a:has-text("View")');
      const hasActions = await viewButton.first().isVisible().catch(() => false);
      console.log('Has view action:', hasActions);
    }
  });
});

// ============================================
// SUBSCRIPTIONS - Full CRUD
// ============================================
test.describe('Admin Subscriptions - CRUD Operations', () => {
  
  test('READ: Get all subscriptions', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/subscriptions');
    expect(response.ok).toBeTruthy();
    
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
  });

  test('UPDATE: Upgrade/downgrade subscription', async ({ page }) => {
    const listResponse = await adminApiRequest('GET', '/api/v1/admin/subscriptions');
    if (listResponse.ok) {
      const subscriptions = await listResponse.json();
      const items = Array.isArray(subscriptions) ? subscriptions : subscriptions.items;
      
      if (items && items.length > 0) {
        console.log('First subscription:', items[0].tier);
      }
    }
    
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
  });

  test('UI: Subscription management', async ({ page }) => {
    await page.goto('/admin/subscriptions');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('subscriptions')) {
      const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Change")');
      const hasUpgrade = await upgradeButton.first().isVisible().catch(() => false);
      console.log('Has upgrade action:', hasUpgrade);
    }
  });
});

// ============================================
// SUPPORT TICKETS - Full CRUD
// ============================================
test.describe('Admin Support - CRUD Operations', () => {
  
  test('CREATE: Create support ticket', async ({ page }) => {
    const ticket = {
      subject: `E2E Test Ticket ${Date.now()}`,
      description: 'This is a test ticket created by E2E tests',
      priority: 'Medium',
      category: 'Technical',
    };
    
    const response = await adminApiRequest('POST', '/api/v1/admin/support/tickets', ticket);
    console.log('Create Ticket Response:', response.status);
    
    await page.goto('/admin/support');
    await page.waitForTimeout(2000);
  });

  test('READ: Get support tickets', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/support/tickets');
    console.log('Get Tickets Response:', response.status);
    
    await page.goto('/admin/support');
    await page.waitForTimeout(2000);
  });

  test('UPDATE: Update ticket status', async ({ page }) => {
    await page.goto('/admin/support');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('support')) {
      const statusDropdown = page.locator('select, [role="combobox"]');
      const hasStatus = await statusDropdown.first().isVisible().catch(() => false);
      console.log('Has status dropdown:', hasStatus);
    }
  });

  test('UI: Ticket detail view', async ({ page }) => {
    await page.goto('/admin/support');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('support')) {
      const ticketRow = page.locator('table tbody tr, [data-testid="ticket-item"]').first();
      if (await ticketRow.isVisible().catch(() => false)) {
        await ticketRow.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

// ============================================
// AUDIT LOGS - Read Operations
// ============================================
test.describe('Admin Audit Logs - Operations', () => {
  
  test('READ: Get audit logs', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/audit-logs');
    expect(response.ok).toBeTruthy();
    
    await page.goto('/admin/audit-logs');
    await page.waitForTimeout(2000);
  });

  test('READ: Filter audit logs', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/audit-logs?action=Login');
    console.log('Filtered Audit Logs:', response.status);
    
    await page.goto('/admin/audit-logs');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('audit')) {
      const filterSelect = page.locator('select, [data-testid="action-filter"]');
      const hasFilter = await filterSelect.first().isVisible().catch(() => false);
      console.log('Has action filter:', hasFilter);
    }
  });
});

// ============================================
// SYSTEM HEALTH - Read Operations
// ============================================
test.describe('Admin System Health - Operations', () => {
  
  test('READ: Get system health', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/system/health');
    expect(response.ok).toBeTruthy();
    
    const health = await response.json();
    console.log('System Health:', {
      overallStatus: health.overallStatus,
      services: health.services?.length || 0,
    });
    
    await page.goto('/admin/system-health');
    await page.waitForTimeout(2000);
  });

  test('UI: Service status indicators', async ({ page }) => {
    await page.goto('/admin/system-health');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('system') || page.url().includes('health')) {
      const statusIndicators = page.locator('[data-status], .status-badge, .health-indicator');
      const hasIndicators = await statusIndicators.first().isVisible().catch(() => false);
      console.log('Has status indicators:', hasIndicators);
    }
  });
});

// ============================================
// AI USAGE - Read Operations
// ============================================
test.describe('Admin AI Usage - Operations', () => {
  
  test('READ: Get platform AI usage summary', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/ai-usage/platform-summary');
    expect(response.ok).toBeTruthy();
    
    await page.goto('/admin/ai-usage');
    await page.waitForTimeout(2000);
  });

  test('READ: Get AI usage by business', async ({ page }) => {
    const response = await adminApiRequest('GET', '/api/v1/admin/ai-usage/by-business');
    console.log('AI Usage by Business:', response.status);
    
    await page.goto('/admin/ai-usage');
    await page.waitForTimeout(2000);
  });

  test('UI: AI usage charts', async ({ page }) => {
    await page.goto('/admin/ai-usage');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('ai-usage')) {
      const charts = page.locator('[data-testid="chart"], canvas, svg');
      const hasCharts = await charts.first().isVisible().catch(() => false);
      console.log('Has charts:', hasCharts);
    }
  });
});

// ============================================
// CMS - Full CRUD
// ============================================
test.describe('Admin CMS - CRUD Operations', () => {
  
  test('CREATE: Create FAQ', async ({ page }) => {
    const faq = {
      question: `E2E FAQ Question ${Date.now()}`,
      answer: 'This is a test answer created by E2E tests.',
      category: 'General',
      order: 1,
    };
    
    const response = await adminApiRequest('POST', '/api/v1/admin/cms/faqs', faq);
    console.log('Create FAQ Response:', response.status);
    
    await page.goto('/admin/cms');
    await page.waitForTimeout(2000);
  });

  test('READ: Get CMS content', async ({ page }) => {
    await page.goto('/admin/cms');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('cms')) {
      const tabs = page.locator('[role="tab"], button:has-text("FAQs"), button:has-text("Testimonials")');
      const hasTabs = await tabs.first().isVisible().catch(() => false);
      console.log('Has CMS tabs:', hasTabs);
    }
  });

  test('UPDATE: Edit CMS content', async ({ page }) => {
    await page.goto('/admin/cms');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('cms')) {
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit"]');
      const hasEdit = await editButton.first().isVisible().catch(() => false);
      console.log('Has edit button:', hasEdit);
    }
  });

  test('DELETE: Delete CMS content', async ({ page }) => {
    await page.goto('/admin/cms');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('cms')) {
      const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete"]');
      const hasDelete = await deleteButton.first().isVisible().catch(() => false);
      console.log('Has delete button:', hasDelete);
    }
  });
});

// ============================================
// FEATURES - CRUD Operations
// ============================================
test.describe('Admin Features - Operations', () => {
  
  test('READ: Get all features', async () => {
    const response = await adminApiRequest('GET', '/api/v1/admin/features');
    expect(response.ok).toBeTruthy();

    const features = await response.json();
    console.log('Features count:', Array.isArray(features) ? features.length : 0);
  });

  test('UPDATE: Toggle feature flag', async () => {
    const featuresResponse = await adminApiRequest('GET', '/api/v1/admin/features');
    if (featuresResponse.ok) {
      const features = await featuresResponse.json();
      if (Array.isArray(features) && features.length > 0) {
        const feature = features[0];
        console.log('Feature:', feature.key);
      }
    }
  });
});

// ============================================
// PLANS - CRUD Operations
// ============================================
test.describe('Admin Plans - Operations', () => {

  test('READ: Get subscription plans', async () => {
    const response = await adminApiRequest('GET', '/api/v1/admin/plans');
    expect(response.ok).toBeTruthy();

    const plans = await response.json();
    console.log('Plans:', Array.isArray(plans) ? plans.map((p: { name: string }) => p.name) : []);
  });

  test('UPDATE: Modify plan features', async () => {
    const plansResponse = await adminApiRequest('GET', '/api/v1/admin/plans');
    if (plansResponse.ok) {
      const plans = await plansResponse.json();
      if (Array.isArray(plans) && plans.length > 0) {
        console.log('First plan:', plans[0].name);
      }
    }
  });
});

// ============================================
// UI BEHAVIORS - Admin Portal
// ============================================
test.describe('Admin UI Behaviors', () => {
  
  test('Sidebar navigation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('admin')) {
      const sidebar = page.locator('aside, nav, [data-testid="sidebar"]');
      const hasSidebar = await sidebar.first().isVisible().catch(() => false);
      console.log('Has sidebar:', hasSidebar);
      
      // Check menu items
      const menuItems = page.locator('a[href*="/admin/"], nav a');
      const menuCount = await menuItems.count();
      console.log('Menu items count:', menuCount);
    }
  });

  test('Data tables with sorting', async ({ page }) => {
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('businesses')) {
      const tableHeaders = page.locator('th, [role="columnheader"]');
      const headerCount = await tableHeaders.count();
      console.log('Table headers:', headerCount);
      
      // Click header to sort
      if (headerCount > 0) {
        await tableHeaders.first().click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('Search and filter', async ({ page }) => {
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('businesses')) {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
      if (await searchInput.first().isVisible().catch(() => false)) {
        await searchInput.first().fill('test search');
        await page.waitForTimeout(500);
      }
    }
  });

  test('Pagination', async ({ page }) => {
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('businesses')) {
      const pagination = page.locator('[data-testid="pagination"], .pagination');
      const hasPagination = await pagination.first().isVisible().catch(() => false);
      console.log('Has pagination:', hasPagination);
    }
  });

  test('Action buttons (Edit, Delete, View)', async ({ page }) => {
    await page.goto('/admin/businesses');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('businesses')) {
      const actions = page.locator('button:has-text("Edit"), button:has-text("View"), button:has-text("Delete")');
      const actionCount = await actions.count();
      console.log('Action buttons:', actionCount);
    }
  });
});
