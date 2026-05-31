"use client";

import DashCodeSidebar from "@/components/dashcode/sidebar";

/**
 * Test page for DashCode Sidebar component
 *
 * This page allows testing the sidebar component in isolation
 * without Storybook (due to Next.js 16 compatibility issues)
 *
 * Access at: http://localhost:3000/test-sidebar
 */
export default function TestSidebarPage() {
  return (
    <div className="relative h-screen flex">
      {/* Sidebar Component */}
      <DashCodeSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 lg:ml-[248px] p-8 bg-gray-50">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">DashCode Sidebar Test Page</h1>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-3">Test Instructions</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Verify sidebar is visible on the left</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test menu item click navigation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test sidebar collapse/expand toggle</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test submenu expansion (Analytics, Settings)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test responsive mobile menu</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Verify badge counts display correctly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test dark mode toggle (if available)</span>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h2 className="text-xl font-semibold mb-3 text-indigo-900">Menu Structure</h2>
            <div className="space-y-3 text-sm text-indigo-800">
              <div>
                <strong>Dashboard</strong> - Single item
              </div>
              <div>
                <strong>Engagement</strong> - Conversations (with badge), Leads, Calendar, Proposals
              </div>
              <div>
                <strong>Channels</strong> - Channels, Web Chat, SMS, Voice, Email
              </div>
              <div>
                <strong>Automation</strong> - Workflows, Journeys, Forms
              </div>
              <div>
                <strong>Analytics</strong> - Analytics (with submenus: Overview, AI Usage), CRM
              </div>
              <div>
                <strong>Settings</strong> - Settings (with submenus: Subscription, Billing, Team, AI Training, Calendar, Auto Assignment, Bulk Import)
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h2 className="text-xl font-semibold mb-3 text-yellow-900">Known Issues</h2>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>Storybook v10 has compatibility issues with Next.js 16 - using direct test page instead</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>Some icons may show as HelpCircle if mapping is missing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
