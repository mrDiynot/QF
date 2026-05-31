'use client';

import { Bell, Search, Settings, Shield, LogOut, Menu, AlertTriangle, Users, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AdminUser } from '@/types/admin';
import { AdminThemeToggle } from './AdminThemeToggle';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  adminUser: AdminUser | null;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export function AdminHeader({ adminUser, onLogout, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PlatformAdmin':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'SupportAdmin':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'BillingAdmin':
        return 'bg-[#FF6900]/15 text-orange-400 border-[#FF6900]/30';
      case 'ContentAdmin':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <header className="h-16 bg-admin-card border-b border-admin-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left Side - Mobile Menu + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="xl:hidden h-9 w-9 text-admin-muted-foreground hover:text-admin-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 w-80 h-10 px-3 bg-admin-muted border border-admin-border rounded-md text-sm text-admin-muted-foreground hover:bg-admin-muted/80 hover:border-[#FF6900]/40 transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search... </span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-admin-card text-admin-muted-foreground border border-admin-border">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-admin-card text-admin-muted-foreground border border-admin-border">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AdminThemeToggle />
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF6900] animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-admin-card border-admin-border p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#FF6900]" />
                <span className="font-semibold text-sm text-admin-foreground">Notifications</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-[#FF6900]/10 text-[#FF6900] border-[#FF6900]/30">
                3 new
              </Badge>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-admin-border">
              <div className="flex gap-3 px-4 py-3 hover:bg-admin-muted/50 cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-foreground">New business registered</p>
                  <p className="text-xs text-admin-muted-foreground mt-0.5">Acme Corp just signed up for SmartFlow</p>
                  <p className="text-[10px] text-admin-muted-foreground mt-1">2 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-3 px-4 py-3 hover:bg-admin-muted/50 cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-[#FF6900]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="h-4 w-4 text-[#FF6900]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-foreground">Payment received</p>
                  <p className="text-xs text-admin-muted-foreground mt-0.5">$699 from TechStart Inc (UltraFlow)</p>
                  <p className="text-[10px] text-admin-muted-foreground mt-1">15 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-3 px-4 py-3 hover:bg-admin-muted/50 cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-foreground">Trial expiring soon</p>
                  <p className="text-xs text-admin-muted-foreground mt-0.5">3 businesses have trials ending in 2 days</p>
                  <p className="text-[10px] text-admin-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-admin-border">
              <Button
                variant="ghost"
                className="w-full text-xs text-[#FF6900] hover:text-[#FF6900] hover:bg-[#FF6900]/5 h-8"
                onClick={() => { setNotifOpen(false); router.push('/admin/audit-logs'); }}
              >
                View audit logs
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-8 w-px bg-admin-border mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-auto py-1.5 px-2 hover:bg-admin-muted"
            >
              <Avatar className="h-8 w-8 border border-admin-border">
                <AvatarFallback className="bg-gradient-to-br from-[#FF6900] to-orange-500 text-white text-xs font-medium">
                  {adminUser?.fullName ? getInitials(adminUser.fullName) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-admin-foreground leading-none">
                  {adminUser?.fullName || 'Admin User'}
                </p>
                <p className="text-xs text-admin-muted-foreground leading-none mt-1">
                  {adminUser?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-admin-card border-admin-border">
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-admin-border">
                  <AvatarFallback className="bg-gradient-to-br from-[#FF6900] to-orange-500 text-white text-sm font-medium">
                    {adminUser?.fullName ? getInitials(adminUser.fullName) : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-admin-foreground truncate">
                    {adminUser?.fullName}
                  </p>
                  <p className="text-xs text-admin-muted-foreground truncate">
                    {adminUser?.email}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={cn('mt-1 text-[10px] px-1.5 py-0', getRoleBadgeColor(adminUser?.role || ''))}
                  >
                    {adminUser?.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            {adminUser?.role !== 'ContentAdmin' && (
              <>
                <DropdownMenuSeparator className="bg-admin-border" />
                <DropdownMenuItem
                  onClick={() => router.push('/admin/settings')}
                  className="text-admin-foreground focus:bg-admin-muted focus:text-admin-foreground cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/admin/settings?tab=security')}
                  className="text-admin-foreground focus:bg-admin-muted focus:text-admin-foreground cursor-pointer"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-admin-border" />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

