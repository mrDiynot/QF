'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Shield, LogOut, ChevronRight, Key, Bell, HelpCircle } from 'lucide-react';
import { cn, getAbsoluteUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserPopoverProps {
  user: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    profilePictureUrl?: string | null;
  } | null | undefined;
  sessionUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null | undefined;
  role: string | null | undefined;
  collapsed: boolean;
  onLogout?: () => void;
}

const roleStyles: Record<string, string> = {
  Owner: 'bg-amber-100 text-amber-700',
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Viewer: 'bg-gray-200 text-gray-600',
};

export function UserPopover({ user, sessionUser, role, collapsed, onLogout }: UserPopoverProps) {
  const [open, setOpen] = useState(false);

  const fullName = user?.fullName ||
    (sessionUser?.firstName && sessionUser?.lastName
      ? `${sessionUser.firstName} ${sessionUser.lastName}`
      : sessionUser?.firstName || sessionUser?.email?.split('@')[0] || 'User');

  const initials = (user?.firstName?.[0] || sessionUser?.firstName?.[0] || 'U').toUpperCase() +
                   (user?.lastName?.[0] || sessionUser?.lastName?.[0] || '').toUpperCase();

  const email = sessionUser?.email || '';
  const profilePictureUrl = getAbsoluteUrl(user?.profilePictureUrl);

  const triggerContent = (
    <button
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer",
        collapsed ? "justify-center size-10 p-0" : "p-2"
      )}
    >
      <Avatar className={cn("ring-2 ring-purple-300/50", collapsed ? "size-7" : "size-9")}>
        {profilePictureUrl && (
          <AvatarImage src={profilePictureUrl} alt={fullName} />
        )}
        <AvatarFallback className="bg-gradient-to-br from-[#1a0a2e] to-[#c23a00] text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[#1a0a2e] truncate">{fullName}</p>
              {role && (
                <Badge className={cn("shrink-0 text-[9px] h-4 px-1.5", roleStyles[role] || roleStyles.Viewer)}>
                  {role}
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#1a0a2e]/50 truncate">{email}</p>
          </div>
          <ChevronRight className="size-3.5 text-[#1a0a2e]/40 shrink-0" />
        </>
      )}
    </button>
  );

  const popoverContent = (
    <div className="w-64 p-3">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <Avatar className="size-12 ring-2 ring-purple-100">
          {profilePictureUrl && (
            <AvatarImage src={profilePictureUrl} alt={fullName} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-orange-500 text-white font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
          </div>
          {role && (
            <Badge className={cn("mt-0.5 text-[10px] h-4 px-1.5", roleStyles[role] || roleStyles.Viewer)}>
              {role}
            </Badge>
          )}
          <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2 space-y-0.5 border-b border-gray-100">
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <User className="size-4" />
          <span>My Profile</span>
        </Link>
        <Link
          href="/settings/security"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Shield className="size-4" />
          <span>Security</span>
        </Link>
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Bell className="size-4" />
          <span>Notifications</span>
        </Link>
        <Link
          href="/settings/api-keys"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Key className="size-4" />
          <span>API Keys</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="pt-2 space-y-0.5">
        <Link
          href="/support"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HelpCircle className="size-4" />
          <span>Help & Support</span>
        </Link>
        {onLogout && (
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                {triggerContent}
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <div>
                {fullName}
                {role && <span className="ml-1 text-xs opacity-70">({role})</span>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

