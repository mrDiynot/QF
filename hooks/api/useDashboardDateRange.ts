/**
 * Dashboard Date Range Hook
 * Manages centralized date range state for all dashboard widgets
 */

import { create } from 'zustand';

export type DateRangePreset = 'today' | '7days' | '30days' | '90days' | 'custom';

interface DateRangeState {
  preset: DateRangePreset;
  startDate: Date;
  endDate: Date;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (startDate: Date, endDate: Date) => void;
}

function getPresetDates(preset: DateRangePreset): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  let startDate: Date;

  switch (preset) {
    case 'today':
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7days':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  return { startDate, endDate };
}

// Default to 30 days
const defaultDates = getPresetDates('30days');

export const useDashboardDateRange = create<DateRangeState>((set) => ({
  preset: '30days',
  startDate: defaultDates.startDate,
  endDate: defaultDates.endDate,
  setPreset: (preset) => {
    const dates = getPresetDates(preset);
    set({ preset, ...dates });
  },
  setCustomRange: (startDate, endDate) => {
    set({ preset: 'custom', startDate, endDate });
  },
}));

// Helper to get date range as ISO strings for API calls
export function useDateRangeParams() {
  const { startDate, endDate } = useDashboardDateRange();
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

// Preset labels for UI
export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: '90days', label: '90 Days' },
];
