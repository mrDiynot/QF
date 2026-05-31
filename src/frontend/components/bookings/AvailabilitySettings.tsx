'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

export function AvailabilitySettings() {
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', enabled: false, start: '09:00', end: '17:00' },
  ]);

  const handleToggle = (index: number) => {
    const updated = [...availability];
    updated[index].enabled = !updated[index].enabled;
    setAvailability(updated);
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSave = async () => {
    try {
      // Convert availability to business hours format
      const enabledDays = availability.filter(a => a.enabled);
      const businessHoursStart = enabledDays.length > 0 ? enabledDays[0].start : '09:00';
      const businessHoursEnd = enabledDays.length > 0 ? enabledDays[0].end : '17:00';
      
      // Save via business settings API
      const { businessService } = await import('@/services/api/business.service');
      await businessService.updateBusinessSettings({
        businessHoursStart,
        businessHoursEnd,
      });
      toast.success('Availability settings saved');
    } catch {
      toast.error('Failed to save availability settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-info" />
            <CardTitle>Availability Settings</CardTitle>
          </div>
          <Button onClick={handleSave}>
            <Save className="size-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map((slot, index) => (
          <div key={slot.day} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3 min-w-[120px]">
              <Switch
                checked={slot.enabled}
                onCheckedChange={() => handleToggle(index)}
              />
              <Label className="font-semibold">{slot.day}</Label>
            </div>

            {slot.enabled && (
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-text-secondary">From</Label>
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-text-secondary">To</Label>
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}

            {!slot.enabled && (
              <span className="text-sm text-text-secondary">Unavailable</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
