'use client';

/**
 * Dashboard Date Range Picker
 * Allows users to select date range for all dashboard widgets
 */

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDashboardDateRange,
  DATE_RANGE_PRESETS
} from '@/hooks/api/useDashboardDateRange';

export function DateRangePicker() {
  const { preset, setPreset } = useDashboardDateRange();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="size-4 text-purple-400" />
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.06] border border-white/10 p-1">
        {DATE_RANGE_PRESETS.map((option) => (
          <button
            key={option.value}
            onClick={() => setPreset(option.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              preset === option.value
                ? "bg-gradient-to-r from-[#FF5722] to-[#FF6B35] text-white shadow-sm"
                : "text-purple-300 hover:text-white hover:bg-white/10"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
