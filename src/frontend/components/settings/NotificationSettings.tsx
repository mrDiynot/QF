'use client';

/**
 * Notification Settings Component
 * Configure email, push, and in-app notification preferences
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Users,
  Calendar,
  FileText,
  Zap,
  Save,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationCategory[] = [
  {
    id: 'leads',
    name: 'New Leads',
    description: 'When a new lead is captured',
    icon: <Users className="size-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'conversations',
    name: 'New Messages',
    description: 'When you receive a new message',
    icon: <MessageSquare className="size-4" />,
    email: false,
    push: true,
    inApp: true,
  },
  {
    id: 'calls',
    name: 'Incoming Calls',
    description: 'When a call comes in',
    icon: <Phone className="size-4" />,
    email: false,
    push: true,
    inApp: true,
  },
  {
    id: 'appointments',
    name: 'Appointments',
    description: 'Booking confirmations and reminders',
    icon: <Calendar className="size-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'proposals',
    name: 'Proposals',
    description: 'When proposals are viewed or accepted',
    icon: <FileText className="size-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'automations',
    name: 'Automation Alerts',
    description: 'Workflow errors and completions',
    icon: <Zap className="size-4" />,
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: 'team',
    name: 'Team Activity',
    description: 'When team members join or are mentioned',
    icon: <Users className="size-4" />,
    email: false,
    push: false,
    inApp: true,
  },
];

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('daily');

  // Toggle notification
  const toggleNotification = (
    categoryId: string, 
    channel: 'email' | 'push' | 'inApp'
  ) => {
    setNotifications(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, [channel]: !cat[channel] } 
        : cat
    ));
  };

  // Enable all for channel
  const enableAll = (channel: 'email' | 'push' | 'inApp') => {
    setNotifications(prev => prev.map(cat => ({ ...cat, [channel]: true })));
  };

  // Disable all for channel
  const disableAll = (channel: 'email' | 'push' | 'inApp') => {
    setNotifications(prev => prev.map(cat => ({ ...cat, [channel]: false })));
  };

  const handleSave = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Manage how and when you receive notifications
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-purple-700">
          <Save className="size-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Notifications */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Notification Channels</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Mail className="size-3" />
                Email
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Smartphone className="size-3" />
                Push
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Bell className="size-3" />
                In-App
              </Badge>
            </div>
          </div>

          {/* Channel Headers */}
          <div className="grid grid-cols-[1fr_80px_80px_80px] gap-4 pb-4 border-b text-sm font-medium text-muted-foreground">
            <div>Category</div>
            <div className="text-center">Email</div>
            <div className="text-center">Push</div>
            <div className="text-center">In-App</div>
          </div>

          {/* Notification Items */}
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="grid grid-cols-[1fr_80px_80px_80px] gap-4 py-4 items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                    {notification.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{notification.name}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={notification.email}
                    onCheckedChange={() => toggleNotification(notification.id, 'email')}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={notification.push}
                    onCheckedChange={() => toggleNotification(notification.id, 'push')}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={notification.inApp}
                    onCheckedChange={() => toggleNotification(notification.id, 'inApp')}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button variant="outline" size="sm" onClick={() => enableAll('email')}>
              Enable All Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => enableAll('push')}>
              Enable All Push
            </Button>
            <Button variant="ghost" size="sm" onClick={() => disableAll('push')}>
              Disable All Push
            </Button>
          </div>
        </Card>

        {/* Additional Settings */}
        <div className="space-y-6">
          {/* Sound Settings */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              {soundEnabled ? <Volume2 className="size-5 text-primary" /> : <VolumeX className="size-5 text-muted-foreground/60" />}
              Sound
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notification Sounds</p>
                <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              Quiet Hours
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Quiet Hours</p>
                  <p className="text-xs text-muted-foreground">Pause notifications during set times</p>
                </div>
                <Switch
                  checked={quietHoursEnabled}
                  onCheckedChange={setQuietHoursEnabled}
                />
              </div>

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Start Time</Label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Time</Label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Email Digest */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Email Digest
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Receive a summary of activity instead of individual emails
              </p>
              <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time (No digest)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
