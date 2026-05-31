"use client";

import React from 'react'
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSimulatorMenuList } from "@/lib/simulator-menu";
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

interface SimulatorMenuProps {
  collapsed?: boolean;
}

export function SimulatorMenu({ collapsed = false }: SimulatorMenuProps) {
    const pathname = usePathname();
    const menuList = getSimulatorMenuList(pathname);

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
                                ({ href, label, icon, active, id, submenus }, menuIndex) =>
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
