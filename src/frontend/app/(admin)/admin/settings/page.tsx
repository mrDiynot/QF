'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Save,
  Zap,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

// Platform settings - these are configured via environment variables on the backend
const platformConfig = {
  general: {
    platformName: 'QualiFlow AI',
    supportEmail: 'support@qualiflow.ai',
    defaultTimezone: 'America/New_York',
    maintenanceMode: false,
  },
  security: {
    requireMfa: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    requireSpecialChars: true,
    requireUppercase: true,
    requireDigit: true,
  },
  notifications: {
    emailNewBusiness: true,
    emailSubscriptionChange: true,
    emailSupportTicket: true,
    slackEnabled: false,
    slackWebhook: '',
  },
  email: {
    provider: 'Resend',
    fromEmail: 'noreply@qualiflow.ai',
    fromName: 'QualiFlow AI',
    replyTo: 'support@qualiflow.ai',
  },
  api: {
    rateLimit: 1000,
    webhookTimeout: 30,
    enablePublicApi: true,
  },
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState(platformConfig);

  const handleSave = () => {
    toast.info('Platform settings are managed via environment variables. Changes here are for preview only.');
  };

  const updateSetting = (category: keyof typeof settings, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-admin-foreground">Platform Settings</h1>
          <p className="text-admin-muted-foreground mt-1">
            Configure global platform settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#FF6900] hover:bg-orange-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue={searchParams.get('tab') || 'general'} className="space-y-6">
        <TabsList className="bg-admin-muted">
          <TabsTrigger value="general" className="data-[state=active]:bg-admin-card">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-admin-card">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-admin-card">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-admin-card">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-admin-card">
            <Zap className="h-4 w-4 mr-2" />
            API
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">General Settings</CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Basic platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-admin-foreground">Platform Name</Label>
                  <Input
                    value={settings.general.platformName}
                    onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">Support Email</Label>
                  <Input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
              </div>
              <div>
                <Label className="text-admin-foreground">Default Timezone</Label>
                <Select
                  value={settings.general.defaultTimezone}
                  onValueChange={(v) => updateSetting('general', 'defaultTimezone', v)}
                >
                  <SelectTrigger className="mt-1 bg-admin-background border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border">
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Maintenance Mode</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Enable to show maintenance page to users
                  </p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(v) => updateSetting('general', 'maintenanceMode', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Security Settings</CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Authentication and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Require MFA for Admins</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    All admin users must enable two-factor authentication
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireMfa}
                  onCheckedChange={(v) => updateSetting('security', 'requireMfa', v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-admin-foreground">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Require Special Characters</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Passwords must contain special characters
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireSpecialChars}
                  onCheckedChange={(v) => updateSetting('security', 'requireSpecialChars', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Notification Settings</CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Configure admin notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">New Business Registration</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Email when a new business signs up
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailNewBusiness}
                  onCheckedChange={(v) => updateSetting('notifications', 'emailNewBusiness', v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Subscription Changes</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Email on plan upgrades, downgrades, or cancellations
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailSubscriptionChange}
                  onCheckedChange={(v) => updateSetting('notifications', 'emailSubscriptionChange', v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Support Tickets</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Email when new support tickets are created
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailSupportTicket}
                  onCheckedChange={(v) => updateSetting('notifications', 'emailSupportTicket', v)}
                />
              </div>
              <div className="pt-4 border-t border-admin-border">
                <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg mb-4">
                  <div>
                    <Label className="text-admin-foreground">Slack Integration</Label>
                    <p className="text-sm text-admin-muted-foreground">
                      Send notifications to Slack channel
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.slackEnabled}
                    onCheckedChange={(v) => updateSetting('notifications', 'slackEnabled', v)}
                  />
                </div>
                {settings.notifications.slackEnabled && (
                  <div>
                    <Label className="text-admin-foreground">Slack Webhook URL</Label>
                    <Input
                      value={settings.notifications.slackWebhook}
                      onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                Email Configuration
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              </CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Email delivery powered by Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Info */}
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <Label className="text-admin-foreground font-medium">Email Provider</Label>
                    <p className="text-sm text-admin-muted-foreground">
                      {settings.email.provider} - Transactional email service
                    </p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-500 border-gray-200">
                  <Lock className="h-3 w-3 mr-1" />
                  API Key Configured
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-admin-foreground">From Email</Label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">From Name</Label>
                  <Input
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">Reply-To Email</Label>
                  <Input
                    type="email"
                    value={settings.email.replyTo}
                    onChange={(e) => updateSetting('email', 'replyTo', e.target.value)}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-admin-muted-foreground">
                  <span className="font-medium text-admin-foreground">Note:</span> Email provider API keys are securely stored in environment variables and cannot be viewed or modified here. Contact your system administrator to update API credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">API Settings</CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                API rate limits and webhook configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-admin-foreground">Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    value={settings.api.rateLimit}
                    onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground">Webhook Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.api.webhookTimeout}
                    onChange={(e) => updateSetting('api', 'webhookTimeout', parseInt(e.target.value))}
                    className="mt-1 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-admin-muted rounded-lg">
                <div>
                  <Label className="text-admin-foreground">Enable Public API</Label>
                  <p className="text-sm text-admin-muted-foreground">
                    Allow businesses to access the public API
                  </p>
                </div>
                <Switch
                  checked={settings.api.enablePublicApi}
                  onCheckedChange={(v) => updateSetting('api', 'enablePublicApi', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
