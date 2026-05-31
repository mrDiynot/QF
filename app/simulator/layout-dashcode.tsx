'use client';

/**
 * Simulator Portal Layout with DashCode Sidebar Integration
 *
 * This layout integrates DashCode sidebar components into the Simulator portal while
 * preserving Simulator-specific features like dark mode, business context, and navigation.
 */

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Building2,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSimulatorTheme } from './SimulatorThemeContext';
import { Logo } from '@/components/shared/logo';
import { SimulatorMenu } from '@/components/dashcode/sidebar/menu/simulator-menu';

interface SimulatorLayoutProps {
  children: ReactNode;
}

export default function SimulatorLayout({ children }: SimulatorLayoutProps) {
  const { darkMode, toggleDarkMode } = useSimulatorTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const _pathname = usePathname();
  const params = useParams();

  // Extract business context from URL params
  const businessId = params?.businessId as string | undefined;

  return (
    <div className={cn('flex h-screen', darkMode && 'dark')}>
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r transition-all duration-300',
          darkMode
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Header */}
        <div className="shrink-0 px-4 py-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Logo />
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex justify-center w-full">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
            </div>
          )}
        </div>

        <Separator className={darkMode ? 'bg-slate-800' : 'bg-slate-200'} />

        {/* Business Context */}
        {businessId && !sidebarCollapsed && (
          <div className="shrink-0 px-4 py-3">
            <div
              className={cn(
                'p-3 rounded-lg border',
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium">Testing Business</span>
              </div>
              <p className="text-[10px] opacity-60">ID: {businessId.slice(0, 8)}...</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SimulatorMenu collapsed={sidebarCollapsed} />

        {/* Bottom Controls */}
        <div className="shrink-0 border-t px-4 py-3 space-y-2">
          {/* Back to Dashboard */}
          {!sidebarCollapsed && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start',
                  darkMode
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-slate-100'
                    : 'hover:bg-slate-100'
                )}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            size={sidebarCollapsed ? 'icon' : 'sm'}
            onClick={toggleDarkMode}
            className={cn(
              'transition-colors',
              darkMode
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'border-slate-300 hover:bg-slate-100',
              sidebarCollapsed && 'w-full'
            )}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!sidebarCollapsed && (
              <span className="ml-2">{darkMode ? 'Light' : 'Dark'}</span>
            )}
          </Button>

          {/* Collapse Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'w-full transition-colors',
              darkMode
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'border-slate-300 hover:bg-slate-100'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 flex flex-col overflow-hidden',
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        )}
      >
        {children}
      </main>
    </div>
  );
}
