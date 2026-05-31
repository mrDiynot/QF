'use client';

/**
 * Onboarding Sidebar - Dashboard Preview
 * Shows future dashboard navigation with 'Setup' active
 * Matches SimplifiedSidebar structure
 */

import { Target, MessageSquare, Users, Settings, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface OnboardingSidebarProps {
  currentStep: number;
  totalSteps: number;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  planName?: string;
}

const menuItems = [
  {
    id: 'setup',
    label: 'Setup',
    icon: Target,
    active: true,
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: MessageSquare,
    disabled: true,
    tooltip: 'Available after setup',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Users,
    disabled: true,
    tooltip: 'Available after setup',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    disabled: true,
    tooltip: 'Available after setup',
  },
];

export function OnboardingSidebar({
  currentStep,
  totalSteps,
  userName = 'User',
  userEmail = '',
  userInitials = 'U',
  planName = 'Free Plan',
}: OnboardingSidebarProps) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Logo showText size="md" variant="dark" />
      </div>

      {/* Progress Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-brand-orange" />
          <span className="text-sm font-semibold text-gray-900">Setup Progress</span>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {currentStep} of {totalSteps} steps complete
        </p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4">
        <TooltipProvider>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              const menuButton = (
                <button
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-brand-orange text-white'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.active && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-white/20 text-white border-white/30">
                      Active
                    </Badge>
                  )}
                </button>
              );

              if (item.disabled && item.tooltip) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {menuButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.id}>{menuButton}</div>;
            })}
          </div>
        </TooltipProvider>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs w-full justify-center">
            {planName}
          </Badge>
        </div>
      </div>
    </aside>
  );
}
