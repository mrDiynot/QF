import type { Meta, StoryObj } from '@storybook/react';
import DashCodeSidebar from '@/components/dashcode/sidebar';

/**
 * DashCode Sidebar Component
 *
 * Extracted from DashCode template and adapted for Qualiflow AI.
 *
 * Features:
 * - Collapsible sidebar with animation
 * - Nested menu items with icons
 * - Active route highlighting
 * - Badge counts for notifications
 * - Hover to expand when collapsed
 * - Responsive mobile menu
 * - Dark theme support
 *
 * ## Usage
 *
 * ```tsx
 * import DashCodeSidebar from '@/components/dashcode/sidebar';
 *
 * function Layout() {
 *   return (
 *     <div className="flex">
 *       <DashCodeSidebar />
 *       <main className="flex-1">
 *         {children}
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Accessibility
 *
 * - Keyboard navigation with Tab/Arrow keys
 * - ARIA labels on all interactive elements
 * - Focus indicators clearly visible
 * - Screen reader announcements for state changes
 */
const meta = {
  title: 'DashCode/Navigation/Sidebar',
  component: DashCodeSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced sidebar component extracted from DashCode template with full Qualiflow AI integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Add any props here if the component accepts them
  },
} satisfies Meta<typeof DashCodeSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default sidebar state - expanded with all menu items visible
 */
export const Default: Story = {
  render: () => (
    <div className="relative h-screen">
      <DashCodeSidebar />
      <div className="ml-[248px] p-8">
        <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
        <p className="text-gray-600">
          This is how the sidebar looks in its default expanded state.
          Hover over menu items to see interactions.
        </p>
      </div>
    </div>
  ),
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  render: () => (
    <div className="relative h-screen dark">
      <DashCodeSidebar />
      <div className="ml-[248px] p-8 bg-gray-900 text-white h-full">
        <h1 className="text-2xl font-bold mb-4">Dark Theme</h1>
        <p className="text-gray-400">
          Sidebar supports dark theme for better visibility in low-light environments.
        </p>
      </div>
    </div>
  ),
};

/**
 * Mobile view - sidebar is hidden by default, can be toggled
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div className="relative h-screen">
      <DashCodeSidebar />
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Mobile View</h1>
        <p className="text-gray-600 text-sm">
          On mobile devices, the sidebar is hidden by default.
          Click the menu icon to open it.
        </p>
      </div>
    </div>
  ),
};

/**
 * With active navigation - shows highlighted menu item
 */
export const WithActiveRoute: Story = {
  render: () => (
    <div className="relative h-screen">
      <DashCodeSidebar />
      <div className="ml-[248px] p-8">
        <h1 className="text-2xl font-bold mb-4">Active Route Highlighting</h1>
        <p className="text-gray-600">
          The current route is highlighted in the sidebar.
          Navigate to different pages to see the active state change.
        </p>
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-900">
            <strong>Current Route:</strong> /dashboard
          </p>
        </div>
      </div>
    </div>
  ),
};
