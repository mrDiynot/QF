'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

// Map of route segments to display names
const routeNames: Record<string, string> = {
  // Main sections
  dashboard: 'Dashboard',
  conversations: 'Live Conversations',
  crm: 'CRM & Contacts',
  calendar: 'Calendar',
  proposals: 'Proposals',
  leads: 'Omnichannel Lead Capture',
  analytics: 'Analytics',
  'advanced-analytics': 'Advanced Analytics',
  'ai-voice': 'AI Voice',
  forms: 'Forms',
  surveys: 'Surveys',
  'email-templates': 'Email Templates',
  links: 'Links',
  'social-builder': 'Social Builder',
  'web-chat-builder': 'Web Chat Builder',
  journeys: 'Journey Automation',
  'lead-scoring': 'Lead Scoring',
  'testing-center': 'Testing Center',
  integrations: 'Integrations',
  articles: 'Articles & FAQ',
  settings: 'Settings',
  system: 'System Settings',
  support: 'Support',
  onboarding: 'Onboarding',
  bookings: 'Bookings',
  notifications: 'Notifications',
  'ai-templates': 'AI Templates',
  // Channels section
  channels: 'Channels',
  qrcode: 'QR Codes',
  social: 'Social Media',
  widget: 'Chat Widget',
  sms: 'SMS',
  voice: 'Voice',
  whatsapp: 'WhatsApp',
  webform: 'Web Forms',
  'sms-templates': 'SMS Templates',
  // Settings section
  'bulk-import': 'Bulk Import',
  'audit-logs': 'Audit Logs',
  'business-profile': 'Business Profile',
  'auto-assignment': 'Auto Assignment',
  'call-scripts': 'Call Scripts',
  security: 'Security',
  'two-factor': 'Two-Factor Auth',
  'quick-replies': 'Quick Replies',
  'ai-training': 'AI Training',
  'api-keys': 'API Keys',
  subscription: 'Subscription',
  exports: 'Exports',
  'source-tracking': 'Source Tracking',
  team: 'Team',
  roles: 'Roles',
  'knowledge-base': 'Knowledge Base',
  scoring: 'Scoring',
  'voice-agents': 'Voice Agents',
  webhooks: 'Webhooks',
  billing: 'Billing',
  // Leads section
  qualification: 'Qualification',
  // Workflows section
  workflows: 'Workflows',
  gallery: 'Gallery',
  custom: 'Custom',
  // Dashboard section
  'onboarding-call': 'Onboarding Call',
  'ai-readiness': 'AI Readiness',
  enhanced: 'Enhanced View',
  // Analytics section
  'ai-usage': 'Omnichannel Lead Capture',
  reports: 'Reports',
  // Forms section
  builder: 'Form Builder',
  // Other nested routes
  'chat-widget': 'Chat Widget',
  knowledge: 'Knowledge Base',
  'ai-studio': 'AI Studio',
  'my-work': 'My Work',
  prompts: 'Prompts',
  personas: 'Personas',
  training: 'Training',
  automations: 'Automations',
  templates: 'Templates',
  new: 'New',
  callback: 'OAuth Callback',
  meta: 'Meta',
};

// Map of query params to display names
const tabNames: Record<string, string> = {
  profile: 'My Profile',
  business: 'Business Settings',
  billing: 'Billing & Subscription',
  subscription: 'Subscription',
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on dashboard home
  if (segments.length === 1 && segments[0] === 'dashboard') {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    const displayName = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      href,
      label: displayName,
      isLast: isLast && !tab,
    };
  });

  // Add tab as last item if present
  if (tab && tabNames[tab]) {
    breadcrumbItems.push({
      href: `${pathname}?tab=${tab}`,
      label: tabNames[tab],
      isLast: true,
    });
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Home/Dashboard link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
              <Home className="size-3.5" />
              <span className="text-sm">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.map((item) => (
          <div key={item.href} className="flex items-center gap-1.5">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="text-gray-900 font-medium text-sm">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

