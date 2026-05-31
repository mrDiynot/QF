"use client";

import React from 'react';
import { Ellipsis, LogOut, Zap } from "lucide-react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getBusinessMenuList, filterMenuByPermissions, type MenuOptions } from "@/lib/business-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useConfig } from "@/hooks/use-config";
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useCurrentSubscription, isValidSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { signOut, useSession } from 'next-auth/react';
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import TeamSwitcher from '../common/team-switcher';
import SearchBar from '../common/search-bar';
import { Logo } from '@/components/shared/logo';
import SidebarHoverToggle from '../sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTranslations } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { getLangDir } from 'rtl-detect';

interface DashCodeBusinessMenuProps {
  /** Unread conversation count for badge */
  unreadCount?: number;
}

/**
 * Business Portal Navigation Menu with DashCode Styling
 *
 * Integrates DashCode sidebar components with Business Portal navigation.
 * Features:
 * - 7 menu groups matching existing sidebar
 * - Role-based and feature-based access control
 * - Notification badges
 * - Subscription status display
 * - User profile section
 * - Logout functionality
 *
 * @example
 * ```tsx
 * <DashCodeBusinessMenu unreadCount={5} />
 * ```
 */
export function DashCodeBusinessMenu({ unreadCount = 0 }: DashCodeBusinessMenuProps) {
    // i18n
    const t = useTranslations("Menu");
    const pathname = usePathname();
    const params = useParams<{ locale: string }>();
    const direction = getLangDir(params?.locale ?? '');

    // Hooks
    const isDesktop = useMediaQuery('(min-width: 1280px)');
    const { data: session } = useSession();
    const { role } = usePermissions();
    const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription();
    const [config] = useConfig();
    const collapsed = config.collapsed;
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;

    // Menu options for filtering
    const menuOptions: MenuOptions = {
        unreadCount,
        userRole: role ?? undefined,
    };

    // Get filtered menu list
    const allMenus = getBusinessMenuList(pathname, t, menuOptions);
    const menuList = filterMenuByPermissions(allMenus, menuOptions);

    // Subscription status
    const isPaidPlan = subscription && isValidSubscription(subscription);
    const displayPlanName = subscription?.planName || (isPaidPlan ? 'Pro' : null);

    // Logout handler
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    // Scroll tracking for shadow effect
    const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
    const [_scroll, setScroll] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current?.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    return (
        <>
            {/* Logo and Toggle */}
            {isDesktop && (
                <div className="flex items-center justify-between px-4 py-4">
                    <Logo />
                    <SidebarHoverToggle />
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!" dir={direction} ref={scrollableNodeRef}>
                {/* Team Switcher and Search Bar */}
                {isDesktop && (
                    <div className={cn('space-y-3 mt-6', {
                        'px-4': !collapsed || hovered,
                        'text-center': collapsed || !hovered
                    })}>
                        <TeamSwitcher />
                        <SearchBar />
                    </div>
                )}

                {/* Main Navigation */}
                <nav className="mt-8 h-full w-full">
                    <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        {menuList?.map(({ groupLabel, menus }, index) => (
                            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
                                {/* Group Label */}
                                {(!collapsed || hovered) && groupLabel ? (
                                    <MenuLabel label={groupLabel} />
                                ) : collapsed && !hovered && groupLabel ? (
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger className="w-full">
                                                <div className="w-full flex justify-center items-center">
                                                    <Ellipsis className="h-5 w-5 text-default-700" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{groupLabel}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : null}

                                {/* Menu Items */}
                                {menus.map(
                                    ({ href, label, icon, active, id, submenus, badge }, menuIndex) =>
                                        !submenus || submenus.length === 0 ? (
                                            <div className="w-full mb-2 last:mb-0" key={menuIndex}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <MenuItem
                                                                    label={label}
                                                                    icon={icon}
                                                                    href={href}
                                                                    active={active || false}
                                                                    id={id}
                                                                    collapsed={collapsed}
                                                                    badge={badge}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {collapsed && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            <div className="w-full mb-2" key={menuIndex}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active || false}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}
                                                    badge={badge}
                                                />
                                            </div>
                                        )
                                )}
                            </li>
                        ))}

                        {/* Bottom Section - Subscription & Profile */}
                        {(!collapsed || hovered) && (
                            <li className="w-full grow flex flex-col justify-end gap-4 pb-4">
                                {/* Subscription Status */}
                                {isPaidPlan ? (
                                    /* Paid Plan - Show success banner */
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-4 shadow-lg">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                                                    <Zap className="size-3.5 text-amber-300" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                                                    {displayPlanName}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                                                Full access to AI-powered features
                                            </p>
                                            <Link
                                                href="/settings/billing"
                                                className="block w-full rounded-lg bg-white/20 px-4 py-2 text-center text-sm font-bold text-white shadow-md hover:bg-white/30 transition-all tracking-wide border border-white/20"
                                            >
                                                Manage Plan
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    /* Free/Trial Plan - Show upgrade banner */
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 p-4 shadow-lg">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                                                    <Zap className="size-3.5 text-white" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                                                    {displayPlanName || 'Free Plan'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                                                Unlock unlimited leads & AI power
                                            </p>
                                            <Link
                                                href="/settings/billing"
                                                className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-bold text-cyan-700 shadow-md hover:bg-white/95 transition-all tracking-wide"
                                            >
                                                Upgrade Now
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* User Profile */}
                                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-cyan-500/10">
                                    <Avatar className="size-10 ring-2 ring-cyan-500/20">
                                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold text-sm">
                                            {session?.user?.firstName?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                                            {session?.user?.lastName?.[0]?.toUpperCase() || ''}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate tracking-wide">
                                            {session?.user?.firstName && session?.user?.lastName
                                                ? `${session.user.firstName} ${session.user.lastName}`
                                                : session?.user?.firstName || session?.user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            isPaidPlan ? "text-purple-300" : "text-slate-400"
                                        )}>
                                            {displayPlanName || (isLoadingSubscription ? 'Loading...' : 'Free Plan')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <NotificationCenter className="text-slate-400 hover:text-white" />
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="group flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-300/80 transition-all hover:bg-red-500/15 hover:text-red-300 border border-red-400/20 hover:border-red-400/30 tracking-wide"
                                >
                                    <LogOut className="size-4 group-hover:-rotate-6 transition-transform" />
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
}
