"use client";

import React from 'react'
import { usePathname } from "next/navigation";
import { useSession } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { getBusinessMenuList, filterMenuByPermissions, MenuOptions } from "@/lib/business-menu";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";

interface BusinessMenuProps {
  collapsed?: boolean;
  /** Unread conversation count for badge */
  unreadCount?: number;
  /** Translation function (for i18n support) */
  t?: (key: string) => string;
  /** Show all items regardless of permissions (for admin view) */
  showAll?: boolean;
}

/**
 * Business Portal Navigation Menu
 *
 * Displays the main navigation for the Business Portal with:
 * - 7 menu groups (Dashboard, Engagement, Channels, Leads & CRM, Automation, Analytics, Settings)
 * - Role-based access control
 * - Feature-based access control
 * - Notification badges
 * - Expandable submenus
 * - Tooltip support when collapsed
 *
 * @example
 * ```tsx
 * <BusinessMenu collapsed={false} unreadCount={5} />
 * ```
 */
export function BusinessMenu({
  collapsed = false,
  unreadCount = 0,
  t,
  showAll = false
}: BusinessMenuProps) {
    const pathname = usePathname();
    const { data: _session } = useSession();
    const { role } = usePermissions();

    // Get menu options for role/feature filtering
    const menuOptions: MenuOptions = {
        unreadCount,
        userRole: role ?? undefined,
        showAll,
    };

    // Get the full menu list
    const allMenus = getBusinessMenuList(pathname, t, menuOptions);

    // Filter by permissions (unless showAll is true)
    const menuList = showAll ? allMenus : filterMenuByPermissions(allMenus, menuOptions);

    return (
        <ScrollArea className="flex-1">
            <nav className="mt-4 h-full w-full">
                <ul className="h-full flex flex-col items-start space-y-1 px-4">
                    {menuList?.map(({ groupLabel, menus }, index) => (
                        <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
                            {(!collapsed && groupLabel) && (
                                <MenuLabel label={groupLabel} />
                            )}

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
                                                            {badge && (
                                                                <span className="ml-2 text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                                                                    {badge}
                                                                </span>
                                                            )}
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
                </ul>
            </nav>
        </ScrollArea>
    );
}
