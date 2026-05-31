"use client";

import React from 'react'
import { usePathname } from "next/navigation";
import { getMenuList } from "@/lib/menus";

import IconNav from './icon-nav';
import SidebarNav from './sideabr-nav';
import { useTranslations } from '@/i18n/routing';


export function MenuTwoColumn() {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const menuList = getMenuList(pathname, t);

    return (
        <>
            <IconNav menuList={menuList} />
            <SidebarNav menuList={menuList} />
        </>


    );
}
