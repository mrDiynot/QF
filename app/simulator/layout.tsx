'use client';

/**
 * Simulator Layout
 * Professional testing environment shell with navigation and controls
 */

import { SimulatorThemeProvider, useSimulatorTheme } from './SimulatorThemeContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { SimulatorErrorBoundary } from '@/components/simulator/SimulatorErrorBoundary';
import {
  Monitor,
  MessageSquare,
  FileText,
  QrCode,
  Phone,
  Webhook,
  Brain,
  ChevronLeft,
  Sun,
  Moon,
  Home,
  LayoutGrid,
  Radio,
  Building2,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SimulatorLogo, LogoMark } from '@/components/shared/logo';

interface SimulatorLayoutProps {
  children: React.ReactNode;
}

const simulatorNavItems = [
  {
    title: 'Dashboard',
    href: '/simulator',
    icon: LayoutGrid,
    description: 'Simulator overview',
  },
  {
    title: 'Website',
    href: '/simulator/website',
    icon: Monitor,
    description: 'Website simulator',
    badge: 'Core',
  },
  {
    title: 'Chat Widget',
    href: '/simulator/chat-widget',
    icon: MessageSquare,
    description: 'Test chat widgets',
    badge: 'Core',
  },
  {
    title: 'Forms',
    href: '/simulator/forms',
    icon: FileText,
    description: 'Test lead forms',
  },
  {
    title: 'QR Codes',
    href: '/simulator/qr-codes',
    icon: QrCode,
    description: 'QR code testing',
  },
  {
    title: 'SMS',
    href: '/simulator/channels/sms',
    icon: Phone,
    description: 'SMS simulator',
  },
  {
    title: 'WhatsApp',
    href: '/simulator/channels/whatsapp',
    icon: MessageSquare,
    description: 'WhatsApp simulator',
  },
  {
    title: 'Voice',
    href: '/simulator/channels/voice',
    icon: Radio,
    description: 'Voice call testing',
  },
  {
    title: 'Webhooks',
    href: '/simulator/webhooks',
    icon: Webhook,
    description: 'Webhook inspector',
  },
  {
    title: 'AI Qualification',
    href: '/simulator/ai-qualification',
    icon: Brain,
    description: 'Test BANT scoring',
    badge: 'AI',
  },
  {
    title: 'AI Monitor',
    href: '/simulator/ai-monitor',
    icon: Brain,
    description: 'AI qualification monitor',
  },
];

function SimulatorLayoutContent({ children }: SimulatorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: onboardingStatus } = useOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, setDarkMode } = useSimulatorTheme();

  // Enforce authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
          <p className="text-slate-400">Loading simulator...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // Get actual business name from onboarding status, with fallback
  const businessName = onboardingStatus?.businessName && 
    onboardingStatus.businessName.trim() !== '' &&
    !onboardingStatus.businessName.toLowerCase().includes('your business')
      ? onboardingStatus.businessName
      : session?.user?.firstName 
        ? `${session.user.firstName}'s Business`
        : 'Testing Environment';
  const userName = session?.user?.firstName && session?.user?.lastName 
    ? `${session.user.firstName} ${session.user.lastName}`
    : session?.user?.email || 'User';

  return (
    <TooltipProvider>
      <div className={cn(
        'min-h-screen flex',
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      )}>
        {/* Sidebar */}
        <aside className={cn(
          'flex flex-col border-r transition-all duration-300',
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}>
          {/* Logo & Business Context */}
          <div className={cn(
            'p-4 border-b space-y-3',
            darkMode ? 'border-slate-800' : 'border-slate-200'
          )}>
            <div className="flex items-center gap-3">
              {sidebarCollapsed ? (
                <LogoMark size={36} className="mx-auto" />
              ) : (
                <SimulatorLogo size="md" darkBg={darkMode} />
              )}
            </div>
            {!sidebarCollapsed && (
              <div className={cn(
                'px-3 py-2 rounded-lg space-y-1',
                darkMode ? 'bg-slate-800/50' : 'bg-slate-100'
              )}>
                <div className="flex items-center gap-2">
                  <Building2 className={cn(
                    'w-3.5 h-3.5',
                    darkMode ? 'text-violet-400' : 'text-violet-600'
                  )} />
                  <span className={cn(
                    'text-xs font-semibold truncate',
                    darkMode ? 'text-slate-200' : 'text-slate-900'
                  )}>
                    {businessName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className={cn(
                    'w-3.5 h-3.5',
                    darkMode ? 'text-slate-500' : 'text-slate-400'
                  )} />
                  <span className={cn(
                    'text-xs truncate',
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {userName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {simulatorNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                        isActive
                          ? darkMode
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-violet-50 text-violet-600'
                          : darkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                        sidebarCollapsed && 'justify-center px-2'
                      )}
                    >
                      <item.icon className={cn(
                        'w-5 h-5 shrink-0',
                        isActive && 'text-violet-500'
                      )} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Bottom Controls */}
          <div className={cn(
            'p-3 border-t space-y-2',
            darkMode ? 'border-slate-800' : 'border-slate-200'
          )}>
            {/* Back to Dashboard */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                    darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <Home className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm">Back to App</span>}
                </Link>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Back to Dashboard</TooltipContent>
              )}
            </Tooltip>

            {/* Theme Toggle */}
            <div className={cn(
              'flex items-center gap-2',
              sidebarCollapsed ? 'justify-center' : 'px-3'
            )}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  'w-8 h-8',
                  darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600'
                )}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              {!sidebarCollapsed && (
                <span className={cn(
                  'text-xs',
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                )}>
                  {darkMode ? 'Dark' : 'Light'} Mode
                </span>
              )}
            </div>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                'w-full justify-center',
                darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600'
              )}
            >
              <ChevronLeft className={cn(
                'w-4 h-4 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )} />
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <SimulatorErrorBoundary darkMode={darkMode}>
            {children}
          </SimulatorErrorBoundary>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default function SimulatorLayout({ children }: SimulatorLayoutProps) {
  return (
    <SimulatorThemeProvider>
      <SimulatorLayoutContent>{children}</SimulatorLayoutContent>
    </SimulatorThemeProvider>
  );
}
