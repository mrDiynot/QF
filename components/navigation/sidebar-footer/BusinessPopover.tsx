'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Users, ChevronRight, Globe, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import type { BusinessProfile } from '@/hooks/api/useBusinessProfile';

interface BusinessPopoverProps {
  business: BusinessProfile | null | undefined;
  isLoading: boolean;
  collapsed: boolean;
}

export function BusinessPopover({ business, isLoading, collapsed }: BusinessPopoverProps) {
  const [open, setOpen] = useState(false);
  const businessName = business?.name || 'My Business';
  const hasValidBusinessName = businessName && 
    businessName.trim() !== '' && 
    !businessName.toLowerCase().includes('my business');
  const industry = business?.industry;
  const companySize = business?.companySize;
  const logoUrl = business?.logoUrl;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn(
        "animate-pulse rounded-lg bg-purple-100",
        collapsed ? "size-10" : "h-12"
      )} />
    );
  }

  const triggerContent = (
    <button
      className={cn(
        "w-full flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer",
        collapsed ? "justify-center size-10 p-0" : "px-2 py-1.5"
      )}
    >
      <Avatar className={cn("ring-1 ring-purple-300/50", collapsed ? "size-6" : "size-7")}>
        {logoUrl && <AvatarImage src={logoUrl} alt={businessName} />}
        <AvatarFallback className="bg-gradient-to-br from-[#1a0a2e] to-[#c23a00] text-white text-xs font-bold">
          {businessName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-[#1a0a2e] truncate">
              {hasValidBusinessName ? businessName : 'My Business'}
            </p>
            {industry && (
              <p className="text-[10px] text-[#1a0a2e]/50 truncate">{industry}</p>
            )}
          </div>
          <ChevronRight className="size-3.5 text-[#1a0a2e]/40" />
        </>
      )}
    </button>
  );

  const popoverContent = (
    <div className="w-64 p-3">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <Avatar className="size-10 ring-2 ring-purple-100">
          {logoUrl && <AvatarImage src={logoUrl} alt={businessName} />}
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-orange-500 text-white font-bold">
            {businessName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {hasValidBusinessName ? businessName : 'My Business'}
          </p>
          {industry && (
            <p className="text-xs text-gray-500 truncate">{industry}</p>
          )}
        </div>
      </div>

      {/* Business Details */}
      <div className="py-3 space-y-2 border-b border-gray-100">
        {industry && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Factory className="size-3.5 text-gray-400" />
            <span>Industry: {industry}</span>
          </div>
        )}
        {companySize && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="size-3.5 text-gray-400" />
            <span>Team Size: {companySize}</span>
          </div>
        )}
        {business?.website && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Globe className="size-3.5 text-gray-400" />
            <span className="truncate">{business.website}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 space-y-1">
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="size-4" />
          <span>Business Settings</span>
        </Link>
        <Link
          href="/settings/team"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Users className="size-4" />
          <span>Team Management</span>
        </Link>
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
              {hasValidBusinessName ? businessName : 'My Business'}
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

