'use client';

/**
 * Step 9: Business Hours
 * Display and allow editing of business hours
 * Per Figma: Shows current hours with Edit button
 */

import { useState, useEffect } from 'react';
import { BusinessHoursConfig } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { Clock, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step9BusinessHoursProps {
  value: BusinessHoursConfig | null;
  onChange: (value: BusinessHoursConfig) => void;
}

const defaultSchedule = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function Step9BusinessHours({ value, onChange }: Step9BusinessHoursProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(value?.schedule || defaultSchedule);

  // Initialize with default if no value
  const currentSchedule = value?.schedule || defaultSchedule;
  const timezone = value?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSave = () => {
    onChange({ timezone, schedule: editedSchedule });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSchedule(currentSchedule);
    setIsEditing(false);
  };

  const toggleDayClosed = (day: keyof typeof defaultSchedule) => {
    setEditedSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  const updateDayTime = (day: keyof typeof defaultSchedule, field: 'open' | 'close', time: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: time },
    }));
  };

  // Initialize with default values on first mount if no value provided
  // Using useEffect to avoid setState during render
  useEffect(() => {
    if (!value) {
      onChange({ timezone, schedule: defaultSchedule });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="heading-2 text-text-navy">Your business hours</h2>
          <p className="body-text mt-2 text-gray-text">
            Set when your AI assistant should be active and book appointments.
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      {/* Timezone */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Timezone: {timezone}</span>
      </div>

      {/* Schedule Display/Edit */}
      <div className="space-y-2">
        {(Object.entries(isEditing ? editedSchedule : currentSchedule) as [keyof typeof defaultSchedule, { open: string; close: string; closed: boolean }][]).map(([day, hours]) => (
          <div key={day} className={cn(
            'flex items-center justify-between p-3 rounded-lg border transition-all',
            hours.closed ? 'bg-muted/20 border-border' : 'bg-white border-border'
          )}>
            <span className="font-medium text-foreground w-24">{dayLabels[day]}</span>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleDayClosed(day)}
                  className={cn('px-3 py-1 rounded text-xs font-medium transition-all',
                    hours.closed ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700')}>
                  {hours.closed ? 'Closed' : 'Open'}
                </button>
                {!hours.closed && (
                  <>
                    <input type="time" value={hours.open} onChange={(e) => updateDayTime(day, 'open', e.target.value)}
                      className="px-2 py-1 border rounded text-sm" />
                    <span className="text-muted-foreground/60">to</span>
                    <input type="time" value={hours.close} onChange={(e) => updateDayTime(day, 'close', e.target.value)}
                      className="px-2 py-1 border rounded text-sm" />
                  </>
                )}
              </div>
            ) : (
              <span className={cn('text-sm', hours.closed ? 'text-muted-foreground/60' : 'text-foreground/80')}>
                {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}><X className="w-4 h-4 mr-2" /> Cancel</Button>
          <Button onClick={handleSave}><Check className="w-4 h-4 mr-2" /> Save Hours</Button>
        </div>
      )}
    </div>
  );
}

