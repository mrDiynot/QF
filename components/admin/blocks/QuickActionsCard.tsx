'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

interface QuickActionsCardProps {
  title?: string;
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsCard({
  title = 'Quick Actions',
  actions,
  className,
}: QuickActionsCardProps) {
  return (
    <Card className={cn('shadow-base', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-admin-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 hover:bg-admin-muted group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-admin-muted group-hover:bg-[#FF6900]/10 transition-colors">
                  <action.icon className="h-4 w-4 text-admin-muted-foreground group-hover:text-[#FF6900] transition-colors" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-admin-foreground">
                      {action.label}
                    </span>
                    {action.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#FF6900]/10 text-[#FF6900]">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  {action.description && (
                    <span className="text-xs text-admin-muted-foreground">
                      {action.description}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-admin-muted-foreground group-hover:text-admin-foreground transition-colors" />
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
