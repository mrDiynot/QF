/**
 * API Testing Utility
 * 
 * Use this to test API endpoints directly from browser console
 * or from test files.
 */

import { config } from './config';

export interface TestResult {
  success: boolean;
  status: number;
  data?: unknown;
  error?: string;
  duration: number;
}

/**
 * Test an admin API endpoint
 * Usage in browser console:
 * 
 * import { testAdminEndpoint } from '@/lib/test-api';
 * testAdminEndpoint('/admin/coming-soon-analytics/overview').then(console.log);
 */
export async function testAdminEndpoint(
  endpoint: string,
  options: RequestInit = {}
): Promise<TestResult> {
  const startTime = performance.now();
  const token = localStorage.getItem('admin_access_token');
  
  if (!token) {
    return {
      success: false,
      status: 0,
      error: 'No admin token found in localStorage. Please log in first.',
      duration: 0,
    };
  }

  const url = `${config.api.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const duration = performance.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }
      
      return {
        success: false,
        status: response.status,
        error: errorData,
        duration,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      status: response.status,
      data,
      duration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

/**
 * Test all Coming Soon Analytics endpoints
 */
export async function testComingSoonAnalytics() {
  console.group('🧪 Testing Coming Soon Analytics Endpoints');
  
  const endpoints = [
    '/api/v1/admin/coming-soon-analytics/overview',
    '/api/v1/admin/coming-soon-analytics/sessions?page=1&pageSize=20',
    '/api/v1/admin/coming-soon-analytics/waitlist/entries?page=1&pageSize=20',
    '/api/v1/admin/coming-soon-analytics/ai-usage',
    '/api/v1/admin/coming-soon-analytics/intents',
    '/api/v1/admin/coming-soon-analytics/funnel',
  ];

  const results: Record<string, TestResult> = {};

  for (const endpoint of endpoints) {
    const name = endpoint.split('/').pop() || endpoint;
    console.log(`Testing ${name}...`);
    results[name] = await testAdminEndpoint(endpoint);
    
    if (results[name].success) {
      console.log(`✅ ${name} - ${results[name].duration.toFixed(0)}ms`, results[name].data);
    } else {
      console.error(`❌ ${name} - Status ${results[name].status}`, results[name].error);
    }
  }

  console.groupEnd();
  return results;
}

/**
 * Check admin authentication status
 */
export function checkAdminAuth() {
  const token = localStorage.getItem('admin_access_token');
  const user = localStorage.getItem('admin_user');
  
  console.group('🔐 Admin Authentication Status');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User:', userData);
      console.log('Role:', userData.role);
      console.log('Email:', userData.email);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  } else {
    console.log('User: null');
  }
  
  console.groupEnd();
  
  return { hasToken: !!token, hasUser: !!user };
}

/**
 * Quick test - run this from browser console
 */
export async function quickTest() {
  console.clear();
  console.log('🚀 QualiFlow AI API Quick Test\n');
  
  // Check auth
  const auth = checkAdminAuth();
  
  if (!auth.hasToken) {
    console.error('❌ Not authenticated. Please log in at /admin/login');
    return;
  }
  
  console.log('\n');
  
  // Test endpoints
  await testComingSoonAnalytics();
  
  console.log('\n✨ Test complete!');
}

// Make available globally for easy console access
if (typeof window !== 'undefined') {
  (window as Window & typeof globalThis & { testAPI?: unknown }).testAPI = {
    test: quickTest,
    testEndpoint: testAdminEndpoint,
    testComingSoon: testComingSoonAnalytics,
    checkAuth: checkAdminAuth,
  };
  
  console.log('💡 API Testing tools loaded! Use window.testAPI.test() to run tests');
}
