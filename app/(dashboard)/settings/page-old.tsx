'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, Building, Bell, Lock, CreditCard, Users, 
  Zap, Save, Camera
} from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  // setIsLoading will be used when implementing save functionality
  void setIsLoading;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-text-navy">General Settings</h1>
        <p className="text-base mt-3 text-text-secondary">
          Manage your profile, company information, and personal preferences
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-2xl font-semibold mb-4 text-text-navy">Settings</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm bg-gradient-to-r from-orange-500 to-pink-600 text-white">
              <User className="size-4" />
              <span>My Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-text-secondary hover:bg-gray-50">
              <Building className="size-4" />
              <span>Company Info</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-text-secondary hover:bg-gray-50">
              <Bell className="size-4" />
              <span>Preferences</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-text-secondary hover:bg-gray-50">
              <Bell className="size-4" />
              <span>Notifications</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-text-secondary hover:bg-gray-50">
              <Lock className="size-4" />
              <span>Security</span>
            </button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Header with Save Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text-navy">My Profile</h2>
            <Button 
              className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
              disabled={isLoading}
            >
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>

          {/* Profile Photo */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="size-24 bg-gradient-to-br from-purple-500 to-pink-500 text-2xl">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {session?.user?.firstName?.[0] || 'J'}{session?.user?.lastName?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                <Camera className="size-4" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text-navy mb-1">Profile Photo</h3>
              <p className="text-sm text-text-secondary mb-3">Update your profile picture</p>
              <button className="text-sm font-medium text-orange-500 hover:text-orange-600">
                Upload New Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm text-text-secondary">First Name</Label>
                <Input 
                  id="firstName" 
                  defaultValue={session?.user?.firstName || "John"}
                  className="h-12 rounded-lg border-border bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-text-secondary">Last Name</Label>
                <Input 
                  id="lastName" 
                  defaultValue={session?.user?.lastName || "Smith"}
                  className="h-12 rounded-lg border-border bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-text-secondary">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={session?.user?.email || "john.smith@acmecorp.com"}
                className="h-12 rounded-lg border-border bg-white"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-text-secondary">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                defaultValue="+1 (555) 123-4567"
                className="h-12 rounded-lg border-border bg-white"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm text-text-secondary">Job Title</Label>
              <Input 
                id="jobTitle" 
                defaultValue="Sales Manager"
                className="h-12 rounded-lg border-border bg-white"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm text-text-secondary">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself..."
                className="min-h-[120px] rounded-lg border-border bg-white resize-none"
              />
            </div>
          </div>

          {/* Other Tabs Content (Preserved) */}
          <div className="pt-8 border-t border-border">
            <Tabs defaultValue="business" className="space-y-6">
              <TabsList className="bg-white">
                <TabsTrigger value="business" className="gap-2">
                  <Building className="size-4" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="team" className="gap-2">
                  <Users className="size-4" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="size-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="size-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <CreditCard className="size-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Zap className="size-4" />
                  Integrations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="business">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-text-navy">Business Information</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="Acme Corporation" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <select id="industry" className="w-full rounded-lg border border-border bg-white px-4 py-2">
                        <option>Technology</option>
                        <option>Healthcare</option>
                        <option>Finance</option>
                        <option>Retail</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" defaultValue="https://acme.com" />
                    </div>
                    <Button className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                      <Save className="size-4" />
                      Save Changes
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-text-navy">Team Members</h2>
                    <Button className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                      <Users className="size-4" />
                      Invite Member
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Owner' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
                      { name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
                    ].map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="text-sm font-normal text-text-navy">{member.name}</p>
                          <p className="text-xs text-text-secondary">{member.email}</p>
                        </div>
                        <span className="text-xs rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-text-navy">Notification Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { label: 'Email Notifications', description: 'Receive email updates about your account' },
                      { label: 'New Lead Alerts', description: 'Get notified when new leads are captured' },
                      { label: 'Appointment Reminders', description: 'Receive reminders for upcoming appointments' },
                      { label: 'Weekly Reports', description: 'Get weekly performance summary emails' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-normal text-text-navy">{item.label}</p>
                          <p className="text-xs text-text-secondary">{item.description}</p>
                        </div>
                        <Switch defaultChecked={idx < 2} />
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-text-navy">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                      Update Password
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-text-navy">Billing & Subscription</h2>
                  <div className="space-y-6">
                    <div className="rounded-lg border border-border bg-bg-page p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-normal text-text-navy">Current Plan</p>
                          <p className="text-2xl font-normal text-brand-purple">Free Plan</p>
                        </div>
                        <Button className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-4 text-text-navy">Payment Method</h3>
                      <p className="text-sm text-text-secondary">No payment method on file</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="integrations">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-text-navy">Integrations</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { name: 'Salesforce', status: 'Connected', color: 'bg-blue-50 text-blue-600' },
                      { name: 'Google Calendar', status: 'Not Connected', color: 'bg-gray-100 text-gray-600' },
                      { name: 'Stripe', status: 'Not Connected', color: 'bg-gray-100 text-gray-600' },
                      { name: 'Twilio', status: 'Connected', color: 'bg-green-50 text-green-600' },
                    ].map((integration, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="text-sm font-normal text-text-navy">{integration.name}</p>
                          <span className={`text-xs rounded-full px-2 py-1 ${integration.color}`}>
                            {integration.status}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}