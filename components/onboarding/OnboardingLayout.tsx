'use client';

/**
 * Onboarding Layout - Dashboard Native
 * Matches dashboard layout structure exactly for seamless transition
 * Features: Same sidebar, same padding, same background as dashboard
 */

import { ReactNode, useState } from 'react';
import { OnboardingSidebar } from './OnboardingSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  planName?: string;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  userName,
  userEmail,
  userInitials,
  planName,
}: OnboardingLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Background gradient (same as dashboard) */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-orange-50/20 pointer-events-none -z-10" />

      {/* Mobile: Hamburger + Sidebar Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="gap-2"
          >
            <Menu className="size-5" />
            <span className="text-sm font-medium">Menu</span>
          </Button>
          <div className="text-xs text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <OnboardingSidebar
            currentStep={currentStep}
            totalSteps={totalSteps}
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            planName={planName}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop: Fixed Sidebar */}
      <div className="hidden lg:block">
        <OnboardingSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          planName={planName}
        />
      </div>

      {/* Main Content - Same spacing as dashboard */}
      <main className="lg:ml-72 min-h-screen flex flex-col pt-16 lg:pt-0">
        <div className="flex-1 w-full">
          <div className="w-full px-6 sm:px-8 lg:px-10 xl:px-12 pt-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
