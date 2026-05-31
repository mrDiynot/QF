'use client';

/**
 * Device Frame Component
 * Renders device-specific frames for mobile, tablet, and desktop preview
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, Battery, Signal } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeMode = 'light' | 'dark';

interface DeviceFrameProps {
  device: DeviceType;
  theme: ThemeMode;
  children: ReactNode;
}

const deviceStyles = {
  desktop: {
    wrapper: 'w-full max-w-[1200px] h-full',
    frame: 'rounded-lg border-8 border-slate-700 bg-slate-800 shadow-2xl',
    screen: 'rounded overflow-hidden',
  },
  tablet: {
    wrapper: 'w-[768px] h-[1024px]',
    frame: 'rounded-[2.5rem] border-[12px] border-slate-700 bg-slate-800 shadow-2xl',
    screen: 'rounded-[1.5rem] overflow-hidden',
  },
  mobile: {
    wrapper: 'w-[375px] h-[812px]',
    frame: 'rounded-[3rem] border-[14px] border-slate-700 bg-slate-800 shadow-2xl',
    screen: 'rounded-[2rem] overflow-hidden',
  },
};

export function DeviceFrame({ device, theme, children }: DeviceFrameProps) {
  const styles = deviceStyles[device];

  if (device === 'desktop') {
    return (
      <div className={cn(styles.wrapper, 'flex flex-col')}>
        {/* Browser Chrome */}
        <div className="bg-slate-800 rounded-t-lg border-b border-slate-700 px-4 py-2 flex items-center gap-4">
          {/* Window Controls */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          {/* Tab */}
          <div className="flex-1 flex items-center">
            <div className="bg-slate-700 rounded-t px-4 py-1.5 flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
              <span className="text-slate-300 max-w-[200px] truncate">Customer Website</span>
            </div>
          </div>
        </div>

        {/* Browser Content */}
        <div className={cn(
          'flex-1 rounded-b-lg overflow-hidden',
          theme === 'dark' ? 'bg-slate-900' : 'bg-white'
        )}>
          {children}
        </div>
      </div>
    );
  }

  // Mobile & Tablet Frame
  return (
    <div className={cn(styles.wrapper, 'flex flex-col')}>
      <div className={cn(styles.frame, 'flex flex-col h-full')}>
        {/* Status Bar */}
        <div className={cn(
          'shrink-0 px-6 py-2 flex items-center justify-between text-xs',
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        )}>
          <span className="font-medium">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-3.5" />
          </div>
        </div>

        {/* Screen Content */}
        <div className={cn(
          styles.screen,
          'flex-1 overflow-auto',
          theme === 'dark' ? 'bg-slate-900' : 'bg-white'
        )}>
          {children}
        </div>

        {/* Home Indicator (Mobile only) */}
        {device === 'mobile' && (
          <div className={cn(
            'shrink-0 py-2 flex justify-center',
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          )}>
            <div className={cn(
              'w-32 h-1 rounded-full',
              theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
