'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminSession } from '@/hooks/admin/useAdminSession';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { AdminThemeProvider } from '@/contexts/AdminThemeContext';
import { Toaster } from '@/components/ui/sonner';
import { ModalProvider } from '@/components/modals';

// Pages that don't require authentication (ring-fenced admin auth flow)
const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/verify-mfa',
  '/admin/setup-mfa',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/change-password',
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, mustChangePassword, adminUser } = useAdminSession();

  const isPublicPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  // Determine the default landing page based on role
  const getDefaultLandingPage = (role?: string) => {
    if (role === 'ContentAdmin') return '/admin/cms';
    return '/admin';
  };

  useEffect(() => {
    // Redirect to admin login if not authenticated and not on a public path
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/admin/login');
      return;
    }

    // Force redirect to change-password if mustChangePassword is set
    // This survives browser refresh because the flag is persisted in localStorage
    if (!isLoading && isAuthenticated && mustChangePassword && pathname !== '/admin/change-password') {
      router.replace('/admin/change-password');
      return;
    }

    // Redirect ContentAdmin away from pages they shouldn't access
    if (!isLoading && isAuthenticated && !mustChangePassword && adminUser?.role === 'ContentAdmin') {
      const contentAdminAllowedPrefixes = ['/admin/cms'];
      const isAllowed = contentAdminAllowedPrefixes.some(prefix => pathname.startsWith(prefix));
      if (!isAllowed) {
        router.replace(getDefaultLandingPage(adminUser.role));
      }
    }
  }, [isAuthenticated, isLoading, isPublicPath, mustChangePassword, router, adminUser, pathname]);

  // For public paths (login, MFA), render without layout
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6900]" />
      </div>
    );
  }

  // Don't render layout for unauthenticated users (they'll be redirected)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <ImpersonationBanner />
      <AdminLayout adminUser={adminUser}>
        {children}
      </AdminLayout>
      <CommandPalette />
    </>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <PostHogProvider>
        <ModalProvider>
          <AdminErrorBoundary>
            <AdminLayoutInner>
              {children}
            </AdminLayoutInner>
            <Toaster position="top-right" richColors />
          </AdminErrorBoundary>
        </ModalProvider>
      </PostHogProvider>
    </AdminThemeProvider>
  );
}

