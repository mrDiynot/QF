'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import { cn } from '@/lib/utils';

export function AdminThemeToggle() {
  const { theme, setTheme } = useAdminTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-admin-card border-admin-border shadow-dropdown"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer text-admin-foreground hover:bg-admin-muted focus:bg-admin-muted transition-colors duration-200',
            theme === 'light' && 'bg-admin-muted'
          )}
        >
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
          {theme === 'light' && (
            <span className="ml-auto text-admin-primary font-medium">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer text-admin-foreground hover:bg-admin-muted focus:bg-admin-muted transition-colors duration-200',
            theme === 'dark' && 'bg-admin-muted'
          )}
        >
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
          {theme === 'dark' && (
            <span className="ml-auto text-admin-primary font-medium">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
