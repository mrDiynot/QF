'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type AdminTheme = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: AdminTheme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const ADMIN_THEME_STORAGE_KEY = 'admin-theme';

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(ADMIN_THEME_STORAGE_KEY) as AdminTheme | null;
    if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Resolve system theme and apply to document
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      const resolved = theme === 'system' ? systemTheme : (theme as ResolvedTheme);
      setResolvedTheme(resolved);
      
      // Apply to document
      document.documentElement.setAttribute('data-admin-theme', resolved);
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Remove no-transition class after mount to enable smooth transitions
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('no-transition');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    // Simple toggle: dark -> light -> dark (skips system)
    setTheme(theme === 'dark' || theme === 'system' ? 'light' : 'dark');
  };

  // Prevent hydration mismatch by not rendering until mounted
  // Apply no-transition class initially to prevent flash
  if (!mounted) {
    return (
      <div data-admin-theme="dark" className="no-transition min-h-screen bg-[hsl(222.2_47.4%_11.2%)]">
        {children}
      </div>
    );
  }

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <div data-admin-theme={resolvedTheme}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
