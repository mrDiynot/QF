"use client";

import React from 'react';
import SidebarContent from './sidebar-content';
import { DashCodeBusinessMenu } from './business';

interface DashCodeBusinessSidebarProps {
  /** Unread conversation count for badge */
  unreadCount?: number;
}

/**
 * DashCode-styled Business Portal Sidebar
 *
 * Complete sidebar component for the Business Portal using DashCode design system.
 * Integrates SidebarContent wrapper with BusinessMenu navigation.
 *
 * Features:
 * - 7-group navigation structure
 * - Role-based and feature-based access control
 * - Notification badges
 * - Subscription status display
 * - User profile section
 * - Logout functionality
 * - Responsive design (desktop only, mobile uses separate component)
 * - Collapsible with hover behavior
 *
 * @example
 * ```tsx
 * // In Business Portal layout
 * <DashCodeBusinessSidebar unreadCount={conversations.unreadCount} />
 * ```
 */
const DashCodeBusinessSidebar: React.FC<DashCodeBusinessSidebarProps> = ({
  unreadCount = 0
}) => {
  return (
    <SidebarContent>
      <DashCodeBusinessMenu unreadCount={unreadCount} />
    </SidebarContent>
  );
};

export default DashCodeBusinessSidebar;
