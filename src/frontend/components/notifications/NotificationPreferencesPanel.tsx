/**
 * Notification Preferences Panel
 * User interface for configuring notification preferences
 */

'use client';

import { useState } from 'react';
import { Bell, Volume2, VolumeX, Smartphone, MessageSquare, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { NotificationPreferences, NotificationCategory } from '@/types/notification-preferences';

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => void;
  pushPermission: NotificationPermission | 'unsupported';
  onRequestPushPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

const CATEGORY_CONFIG: Record<NotificationCategory, { label: string; description: string; icon: React.ReactNode }> = {
  leads: { label: 'Leads', description: 'New leads, qualifications, assignments', icon: <Bell className="size-4" /> },
  messages: { label: 'Messages', description: 'New messages, conversation updates', icon: <MessageSquare className="size-4" /> },
  bookings: { label: 'Bookings', description: 'Scheduled meetings, reminders', icon: <Clock className="size-4" /> },
  billing: { label: 'Billing', description: 'Payment updates, usage alerts', icon: <Settings2 className="size-4" /> },
  team: { label: 'Team', description: 'Member updates, invitations', icon: <Bell className="size-4" /> },
  system: { label: 'System', description: 'Maintenance, announcements', icon: <Settings2 className="size-4" /> },
};

export function NotificationPreferencesPanel({
  preferences,
  onUpdate,
  pushPermission,
  onRequestPushPermission,
}: NotificationPreferencesPanelProps) {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleRequestPush = async () => {
    setIsRequestingPermission(true);
    await onRequestPushPermission();
    setIsRequestingPermission(false);
  };

  const updateCategoryChannel = (category: NotificationCategory, channel: string, enabled: boolean) => {
    const updatedCategories = preferences.categories.map(cat => {
      if (cat.category !== category) return cat;
      return {
        ...cat,
        channels: {
          ...cat.channels,
          [channel]: { ...cat.channels[channel as keyof typeof cat.channels], enabled },
        },
      };
    });
    onUpdate({ categories: updatedCategories });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Configure how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-4">
            {/* Master toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
              </div>
              <Switch checked={preferences.enabled} onCheckedChange={(enabled) => onUpdate({ enabled })} />
            </div>

            {/* Browser Push */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified even when the tab is in background</p>
                </div>
              </div>
              {pushPermission === 'unsupported' ? (
                <Badge variant="outline" className="text-muted-foreground">Not Supported</Badge>
              ) : pushPermission === 'granted' ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700">Enabled</Badge>
              ) : pushPermission === 'denied' ? (
                <Badge variant="secondary" className="bg-red-100 text-red-700">Blocked</Badge>
              ) : (
                <Button size="sm" onClick={handleRequestPush} disabled={isRequestingPermission}>
                  {isRequestingPermission ? 'Requesting...' : 'Enable'}
                </Button>
              )}
            </div>

            {/* Sound */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.soundEnabled ? <Volume2 className="size-5 text-muted-foreground" /> : <VolumeX className="size-5 text-muted-foreground/60" />}
                  <div>
                    <Label className="text-base font-medium">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for incoming notifications</p>
                  </div>
                </div>
                <Switch checked={preferences.soundEnabled} onCheckedChange={(soundEnabled) => onUpdate({ soundEnabled })} />
              </div>
              {preferences.soundEnabled && (
                <div className="pl-8">
                  <Label className="text-sm text-muted-foreground">Volume</Label>
                  <Slider
                    value={[preferences.soundVolume * 100]}
                    onValueChange={([v]) => onUpdate({ soundVolume: v / 100 })}
                    max={100}
                    step={10}
                    className="w-full max-w-xs mt-2"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <div className="space-y-4">
              {preferences.categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat.category];
                return (
                  <div key={cat.category} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {config.icon}
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Push</Label>
                        <Switch
                          checked={cat.channels.push?.enabled}
                          onCheckedChange={(e) => updateCategoryChannel(cat.category, 'push', e)}
                          disabled={pushPermission !== 'granted'}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Sound</Label>
                        <Switch
                          checked={cat.channels.sound?.enabled}
                          onCheckedChange={(e) => updateCategoryChannel(cat.category, 'sound', e)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Email</Label>
                        <Switch
                          checked={cat.channels.email?.enabled}
                          onCheckedChange={(e) => updateCategoryChannel(cat.category, 'email', e)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Mute non-urgent notifications during these hours</p>
              </div>
              <Switch
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(quietHoursEnabled) => onUpdate({ quietHoursEnabled })}
              />
            </div>
            {preferences.quietHoursEnabled && (
              <div className="flex items-center gap-4 pl-4">
                <div>
                  <Label className="text-sm">Start</Label>
                  <Input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => onUpdate({ quietHoursStart: e.target.value })}
                    className="w-32 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">End</Label>
                  <Input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => onUpdate({ quietHoursEnd: e.target.value })}
                    className="w-32 mt-1"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

