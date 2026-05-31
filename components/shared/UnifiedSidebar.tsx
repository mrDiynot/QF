'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo, LogoMark } from '@/components/shared/logo';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
  items?: {
    label: string;
    href: string;
    badge?: string | number;
  }[];
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

interface UnifiedSidebarProps {
  navigation: SidebarNavGroup[];
  onLogout?: () => void;
  variant?: 'business' | 'admin' | 'simulator';
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
  userInfo?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

export function UnifiedSidebar({
  navigation,
  onLogout,
  variant = 'business',
  mobileOpen = false,
  onMobileClose,
  className,
  userInfo,
}: UnifiedSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand active item on mount
  useEffect(() => {
    const activeGroup = navigation
      .flatMap(group => group.items)
      .find(item => 
        item.href === pathname || 
        item.items?.some(subItem => pathname.startsWith(subItem.href))
      );
    
    if (activeGroup) {
      setExpandedItems(new Set([activeGroup.label]));
    }
  }, [navigation, pathname]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin' || href === '/simulator') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const variantStyles = {
    business: 'bg-white border-border',
    admin: 'bg-[hsl(222.2_84%_4.9%)] border-white/10',
    simulator: 'bg-gradient-to-b from-emerald-900 to-teal-900 border-emerald-700/30',
  };

  const textStyles = {
    business: 'text-foreground',
    admin: 'text-white',
    simulator: 'text-white',
  };

  const mutedTextStyles = {
    business: 'text-muted-foreground',
    admin: 'text-white/60',
    simulator: 'text-emerald-100/70',
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex flex-col h-screen border-r',
          variantStyles[variant],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <LogoMark size={44} />
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="md" darkBg={variant === 'admin'} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              variant === 'business' 
                ? 'hover:bg-muted' 
                : 'hover:bg-white/10'
            )}
          >
            {collapsed ? (
              <ChevronRight className={cn('size-4', textStyles[variant])} />
            ) : (
              <ChevronLeft className={cn('size-4', textStyles[variant])} />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((group, groupIndex) => (
              <div key={groupIndex} className={cn(groupIndex > 0 && 'mt-6')}>
                {/* Group Label */}
                {group.label && !collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'px-3 mb-2 text-xs font-semibold uppercase tracking-wider',
                      mutedTextStyles[variant]
                    )}
                  >
                    {group.label}
                  </motion.p>
                )}

                {/* Nav Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const expanded = expandedItems.has(item.label);
                    const hasSubItems = item.items && item.items.length > 0;

                    return (
                      <div key={item.label}>
                        {/* Main Item */}
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={hasSubItems ? '#' : item.href}
                                onClick={(e) => {
                                  if (hasSubItems) {
                                    e.preventDefault();
                                    toggleExpand(item.label);
                                  }
                                }}
                                className={cn(
                                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                  active && !hasSubItems
                                    ? 'gradient-brand text-white shadow-brand'
                                    : variant === 'business'
                                      ? 'hover:bg-muted text-foreground/80 hover:text-foreground'
                                      : 'hover:bg-white/10 text-white/70 hover:text-white'
                                )}
                              >
                                <Icon className={cn(
                                  'size-5 shrink-0 transition-transform',
                                  active && 'scale-110'
                                )} />
                                
                                {!collapsed && (
                                  <>
                                    <span className="flex-1 font-medium text-sm truncate">
                                      {item.label}
                                    </span>
                                    
                                    {item.badge && (
                                      <Badge variant="secondary" className="ml-auto">
                                        {item.badge}
                                      </Badge>
                                    )}
                                    
                                    {hasSubItems && (
                                      <ChevronRight className={cn(
                                        'size-4 transition-transform',
                                        expanded && 'rotate-90'
                                      )} />
                                    )}
                                  </>
                                )}
                              </Link>
                            </TooltipTrigger>
                            {collapsed && (
                              <TooltipContent side="right" className="flex items-center gap-2">
                                {item.label}
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-1">
                                    {item.badge}
                                  </Badge>
                                )}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        {/* Sub Items */}
                        {hasSubItems && expanded && !collapsed && item.items && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-11 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.items.map((subItem) => {
                              const subActive = isActive(subItem.href);
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={cn(
                                    'block px-3 py-2 rounded-lg text-sm transition-all',
                                    subActive
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : variant === 'business'
                                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{subItem.label}</span>
                                    {subItem.badge && (
                                      <Badge variant="secondary" className="ml-2 shrink-0">
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer - User Info & Logout */}
        {(userInfo || onLogout) && (
          <div className="p-4 border-t border-border/50">
            {userInfo && !collapsed && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-muted/30">
                <p className={cn('text-sm font-semibold truncate', textStyles[variant])}>
                  {userInfo.name}
                </p>
                {userInfo.email && (
                  <p className={cn('text-xs truncate', mutedTextStyles[variant])}>
                    {userInfo.email}
                  </p>
                )}
                {userInfo.role && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {userInfo.role}
                  </Badge>
                )}
              </div>
            )}
            
            {onLogout && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className={cn(
                        'w-full justify-start gap-3',
                        variant === 'business'
                          ? 'hover:bg-destructive/10 hover:text-destructive'
                          : 'hover:bg-white/10 text-white/70 hover:text-white'
                      )}
                    >
                      <LogOut className="size-5" />
                      {!collapsed && <span>Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">Logout</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn(
                'fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col lg:hidden border-r',
                variantStyles[variant]
              )}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <Logo size="md" darkBg={variant === 'admin'} />
                <button
                  onClick={onMobileClose}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    variant === 'business' 
                      ? 'hover:bg-muted' 
                      : 'hover:bg-white/10'
                  )}
                >
                  <ChevronLeft className={cn('size-5', textStyles[variant])} />
                </button>
              </div>

              {/* Mobile Navigation - Same as desktop */}
              <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                  {navigation.map((group, groupIndex) => (
                    <div key={groupIndex} className={cn(groupIndex > 0 && 'mt-6')}>
                      {group.label && (
                        <p className={cn(
                          'px-3 mb-2 text-xs font-semibold uppercase tracking-wider',
                          mutedTextStyles[variant]
                        )}>
                          {group.label}
                        </p>
                      )}
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);
                          const expanded = expandedItems.has(item.label);
                          const hasSubItems = item.items && item.items.length > 0;

                          return (
                            <div key={item.label}>
                              <Link
                                href={hasSubItems ? '#' : item.href}
                                onClick={(e) => {
                                  if (hasSubItems) {
                                    e.preventDefault();
                                    toggleExpand(item.label);
                                  }
                                }}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                                  active && !hasSubItems
                                    ? 'gradient-brand text-white shadow-brand'
                                    : variant === 'business'
                                      ? 'hover:bg-muted text-foreground/80 hover:text-foreground'
                                      : 'hover:bg-white/10 text-white/70 hover:text-white'
                                )}
                              >
                                <Icon className="size-5 shrink-0" />
                                <span className="flex-1 font-medium text-sm">{item.label}</span>
                                {item.badge && (
                                  <Badge variant="secondary">{item.badge}</Badge>
                                )}
                                {hasSubItems && (
                                  <ChevronRight className={cn(
                                    'size-4 transition-transform',
                                    expanded && 'rotate-90'
                                  )} />
                                )}
                              </Link>

                              {hasSubItems && expanded && item.items && (
                                <div className="ml-11 mt-1 space-y-1">
                                  {item.items.map((subItem) => {
                                    const subActive = isActive(subItem.href);
                                    return (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={cn(
                                          'block px-3 py-2 rounded-lg text-sm transition-all',
                                          subActive
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : variant === 'business'
                                              ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                              : 'text-white/60 hover:text-white hover:bg-white/5'
                                        )}
                                      >
                                        {subItem.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </ScrollArea>

              {/* Mobile Footer */}
              {(userInfo || onLogout) && (
                <div className="p-4 border-t border-border/50">
                  {userInfo && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-muted/30">
                      <p className={cn('text-sm font-semibold', textStyles[variant])}>
                        {userInfo.name}
                      </p>
                      {userInfo.email && (
                        <p className={cn('text-xs', mutedTextStyles[variant])}>
                          {userInfo.email}
                        </p>
                      )}
                    </div>
                  )}
                  {onLogout && (
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className={cn(
                        'w-full justify-start gap-3',
                        variant === 'business'
                          ? 'hover:bg-destructive/10 hover:text-destructive'
                          : 'hover:bg-white/10 text-white/70 hover:text-white'
                      )}
                    >
                      <LogOut className="size-5" />
                      <span>Logout</span>
                    </Button>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
