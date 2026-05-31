'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminLogout } from '@/hooks/admin/useAdminAuth';
import type { AdminUser } from '@/types/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
  adminUser: AdminUser | null;
}

export function AdminLayout({ children, adminUser }: AdminLayoutProps) {
  const logoutMutation = useAdminLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-admin-background font-inter">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        adminUser={adminUser} 
        onLogout={handleLogout}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content - responsive margin */}
      <div className="transition-all duration-300 xl:ml-[280px]">
        {/* Header */}
        <AdminHeader 
          adminUser={adminUser} 
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content - pt-16 accounts for sticky header height (h-16 = 4rem) */}
        <main className="min-h-[calc(100vh-4rem)] pt-16 bg-admin-background">
          {children}
        </main>
      </div>
    </div>
  );
}

