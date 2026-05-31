'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building, Save, Camera, Loader2, Phone, Settings2, Shield, AlertTriangle, Info, Globe, MapPin, Palette, Clock, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { settingsService } from '@/services/api/settings.service';
import { usersService } from '@/services/api/users.service';
import { TwilioSettingsSection } from '@/components/settings/TwilioSettingsSection';
import { OnboardingPreferencesSection } from '@/components/settings/OnboardingPreferencesSection';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UpdateUserProfileRequest, UpdateBusinessSettingsRequest } from '@/types/api';
import { getAbsoluteUrl } from '@/lib/utils';

// Must match onboarding Step1Industry values exactly
const INDUSTRIES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'legal', label: 'Legal' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'finance', label: 'Finance' },
  { value: 'agency', label: 'Agency' },
  { value: 'saas', label: 'SaaS' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

// Must match onboarding Step2TeamSize values exactly
const TEAM_SIZES = [
  { value: 'solo', label: 'Just Me' },
  { value: 'small', label: '2-5 People' },
  { value: 'growing', label: '6-20 People' },
  { value: 'midsize', label: '21-50 People' },
  { value: 'enterprise', label: '50+ People' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const PRESET_COLORS = [
  '#FF7A3C', // Orange (Brand)
  '#3C0AFE', // Purple (Brand)
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: settingsService.getUserProfile,
  });

  // Fetch business settings
  const { data: businessSettings, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business', 'settings'],
    queryFn: settingsService.getBusinessSettings,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateUserProfileRequest>({});

  // Business form state
  const [businessForm, setBusinessForm] = useState<UpdateBusinessSettingsRequest>({});

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => settingsService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setProfileForm({});
      toast.success('Profile updated', {
        description: 'Your profile information has been saved.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to update profile', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Upload profile photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => usersService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile photo updated', {
        description: 'Your new profile picture has been saved.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to upload photo', {
        description: error.response?.data?.message || 'Please try again with a different image.',
      });
    },
  });

  // Handle profile photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file (JPEG, PNG, GIF, etc.).',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    uploadPhotoMutation.mutate(file);

    // Clear input so same file can be selected again
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = '';
    }
  };

  // Update business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: (data: UpdateBusinessSettingsRequest) => settingsService.updateBusinessSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'settings'] });
      setBusinessForm({});
      toast.success('Settings saved', {
        description: 'Your business settings have been updated.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string; detail?: string } } }) => {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.message
        || 'Unknown error';
      toast.error('Failed to save settings', {
        description: errorMessage,
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(profileForm).length === 0) {
      toast.info('No changes to save', {
        description: 'Make some changes first.',
      });
      return;
    }
    updateProfileMutation.mutate(profileForm);
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(businessForm).length === 0) {
      toast.info('No changes to save', {
        description: 'Make some changes first.',
      });
      return;
    }
    updateBusinessMutation.mutate(businessForm);
  };

  const isLoading = isLoadingProfile || isLoadingBusiness;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-text-navy">General Settings</h1>
        <p className="text-base mt-3 text-text-secondary">
          Manage your profile, company information, and personal preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building className="size-4" />
            Business Settings
          </TabsTrigger>
          <TabsTrigger value="twilio" className="gap-2">
            <Phone className="size-4" />
            Twilio
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="size-4" />
            Onboarding
          </TabsTrigger>

          <TabsTrigger value="widget" className="gap-2">
            <MessageSquare className="size-4" />
            Widget
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text-navy">My Profile</h2>
                <Button 
                  type="submit"
                  className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
                  disabled={updateProfileMutation.isPending || Object.keys(profileForm).length === 0}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Changes
                </Button>
              </div>

              {/* Profile Photo */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="size-24 bg-gradient-to-br from-purple-500 to-pink-500 text-2xl">
                    {userProfile?.profilePictureUrl && (
                      <AvatarImage src={getAbsoluteUrl(userProfile.profilePictureUrl)} alt="Profile" />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {userProfile?.firstName?.[0] || 'U'}{userProfile?.lastName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={uploadPhotoMutation.isPending}
                    className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {uploadPhotoMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-navy mb-1">Profile Photo</h3>
                  <p className="text-sm text-text-secondary mb-3">Update your profile picture</p>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={uploadPhotoMutation.isPending}
                    className="text-sm font-medium text-orange-500 hover:text-orange-600 disabled:opacity-50"
                  >
                    {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload New Photo'}
                  </button>
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName ?? userProfile?.firstName ?? ''}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName ?? userProfile?.lastName ?? ''}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-text-secondary">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={profileForm.phoneNumber ?? userProfile?.phoneNumber ?? ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* OAuth Info (if applicable) */}
                {userProfile?.isOAuthUser && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>OAuth Account:</strong> This account is connected via {userProfile.oAuthProvider}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Business Settings Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleBusinessSubmit} className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text-navy">Business Settings</h2>
                <Button
                  type="submit"
                  className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
                  disabled={updateBusinessMutation.isPending || Object.keys(businessForm).length === 0}
                >
                  {updateBusinessMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Changes
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessForm.name ?? businessSettings?.name ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                      placeholder="Acme Corporation"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={businessForm.industry ?? businessSettings?.industry ?? ''}
                      onValueChange={(v) => setBusinessForm({ ...businessForm, industry: v })}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size *</Label>
                    <Select
                      value={businessForm.teamSize ?? businessSettings?.teamSize ?? ''}
                      onValueChange={(v) => setBusinessForm({ ...businessForm, teamSize: v })}
                    >
                      <SelectTrigger id="teamSize">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Business Email */}
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessForm.email ?? businessSettings?.email ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                      placeholder="contact@acme.com"
                    />
                  </div>

                  {/* Business Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={businessForm.phone ?? businessSettings?.phone ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="size-4 text-gray-400" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={businessForm.website ?? businessSettings?.website ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-400" />
                      Timezone *
                    </Label>
                    <Select
                      value={businessForm.timezone ?? businessSettings?.timezone ?? ''}
                      onValueChange={(v) => setBusinessForm({ ...businessForm, timezone: v })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Color */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="size-4 text-gray-400" />
                      Brand Color
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBusinessForm({ ...businessForm, primaryColor: color })}
                          className={`size-8 rounded-full transition-all ${
                            (businessForm.primaryColor ?? businessSettings?.primaryColor) === color
                              ? 'ring-2 ring-offset-2 ring-gray-900'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={businessForm.primaryColor ?? businessSettings?.primaryColor ?? '#FF7A3C'}
                        onChange={(e) => setBusinessForm({ ...businessForm, primaryColor: e.target.value })}
                        className="size-10 rounded cursor-pointer"
                      />
                      <Input
                        value={businessForm.primaryColor ?? businessSettings?.primaryColor ?? ''}
                        onChange={(e) => setBusinessForm({ ...businessForm, primaryColor: e.target.value })}
                        placeholder="#FF7A3C"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={businessForm.description ?? businessSettings?.description ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                      placeholder="Brief description of your business..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-text-navy">Business Address</h3>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Street Address */}
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={businessForm.address ?? businessSettings?.address ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                      placeholder="123 Main Street, Suite 100"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={businessForm.city ?? businessSettings?.city ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                      placeholder="San Francisco"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      value={businessForm.state ?? businessSettings?.state ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })}
                      placeholder="California"
                    />
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={businessForm.zipCode ?? businessSettings?.zipCode ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, zipCode: e.target.value })}
                      placeholder="94102"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={businessForm.country ?? businessSettings?.country ?? ''}
                      onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              {/* Business Info */}
              {businessSettings && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Business ID:</span>
                      <p className="font-mono text-xs mt-1">{businessSettings.id}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Status:</span>
                      <p className={`mt-1 font-medium ${businessSettings.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {businessSettings.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Created:</span>
                      <p className="mt-1">
                        {businessSettings.createdAt
                          ? new Date(businessSettings.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Card>

          {/* Email Domain Restriction Card */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Shield className="size-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-navy">Email Domain Restriction</h3>
                  <p className="text-sm text-text-secondary">Control which email domains can be invited to your team</p>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-1">
                  <Label htmlFor="enforceEmailDomain" className="text-base font-medium">
                    Enforce Email Domain Restriction
                  </Label>
                  <p className="text-sm text-text-secondary">
                    When enabled, only users with emails matching your allowed domain can be invited
                  </p>
                </div>
                <Switch
                  id="enforceEmailDomain"
                  checked={businessForm.enforceEmailDomainRestriction ?? businessSettings?.enforceEmailDomainRestriction ?? false}
                  onCheckedChange={(checked) => setBusinessForm({ ...businessForm, enforceEmailDomainRestriction: checked })}
                />
              </div>

              {/* Domain Input */}
              <div className="space-y-2">
                <Label htmlFor="allowedEmailDomain">Allowed Email Domain</Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-text-secondary">@</span>
                  <Input
                    id="allowedEmailDomain"
                    placeholder="yourcompany.com"
                    value={businessForm.allowedEmailDomain ?? businessSettings?.allowedEmailDomain ?? ''}
                    onChange={(e) => setBusinessForm({ ...businessForm, allowedEmailDomain: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-text-secondary">
                  Enter the domain without @ symbol. Example: company.com
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">How it works</p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>When enabled, only emails ending with @{businessForm.allowedEmailDomain || businessSettings?.allowedEmailDomain || 'yourdomain.com'} can be invited</li>
                      <li>Violation attempts are logged in the audit log for security review</li>
                      <li>Existing team members are not affected by this setting</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Warning if enabled but no domain */}
              {(businessForm.enforceEmailDomainRestriction ?? businessSettings?.enforceEmailDomainRestriction) && 
               !(businessForm.allowedEmailDomain ?? businessSettings?.allowedEmailDomain) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-3">
                    <AlertTriangle className="size-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> Domain restriction is enabled but no domain is set. 
                      Please enter an allowed domain or disable the restriction.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={() => {
                  const updates: UpdateBusinessSettingsRequest = {};
                  if (businessForm.enforceEmailDomainRestriction !== undefined) {
                    updates.enforceEmailDomainRestriction = businessForm.enforceEmailDomainRestriction;
                  }
                  if (businessForm.allowedEmailDomain !== undefined) {
                    updates.allowedEmailDomain = businessForm.allowedEmailDomain;
                  }
                  if (Object.keys(updates).length === 0) {
                    toast.info('No changes to save');
                    return;
                  }
                  updateBusinessMutation.mutate(updates);
                }}
                className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
                disabled={updateBusinessMutation.isPending}
              >
                {updateBusinessMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Security Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Twilio Settings Tab */}
        <TabsContent value="twilio" className="space-y-6">
          <TwilioSettingsSection />
        </TabsContent>

        {/* Onboarding Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <OnboardingPreferencesSection />
        </TabsContent>



        {/* Widget Settings Tab */}
        <TabsContent value="widget" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-text-navy">Chat Widget Settings</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Customize how the chat widget appears on your website
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const widgetUpdates: UpdateBusinessSettingsRequest = {};
                    if (businessForm.widgetPosition !== undefined) widgetUpdates.widgetPosition = businessForm.widgetPosition;
                    if (businessForm.widgetWelcomeMessage !== undefined) widgetUpdates.widgetWelcomeMessage = businessForm.widgetWelcomeMessage;
                    if (businessForm.widgetOfflineMessage !== undefined) widgetUpdates.widgetOfflineMessage = businessForm.widgetOfflineMessage;
                    if (Object.keys(widgetUpdates).length === 0) {
                      toast.info('No changes to save');
                      return;
                    }
                    updateBusinessMutation.mutate(widgetUpdates);
                  }}
                  className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
                  disabled={updateBusinessMutation.isPending}
                >
                  {updateBusinessMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Widget Settings
                </Button>
              </div>

              {/* Widget Position */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Widget Position</Label>
                <p className="text-sm text-text-secondary">Where the chat widget appears on your website</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'bottom-right', label: 'Bottom Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'top-left', label: 'Top Left' },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setBusinessForm({ ...businessForm, widgetPosition: pos.value as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        (businessForm.widgetPosition ?? businessSettings?.widgetPosition ?? 'bottom-right') === pos.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-text-navy">{pos.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget Preview */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Widget Preview</Label>
                <div className="relative h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div
                    className={`absolute size-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                      (businessForm.widgetPosition ?? businessSettings?.widgetPosition ?? 'bottom-right').includes('bottom')
                        ? 'bottom-4'
                        : 'top-4'
                    } ${
                      (businessForm.widgetPosition ?? businessSettings?.widgetPosition ?? 'bottom-right').includes('right')
                        ? 'right-4'
                        : 'left-4'
                    }`}
                    style={{ backgroundColor: businessForm.primaryColor ?? businessSettings?.primaryColor ?? '#FF7A3C' }}
                  >
                    <MessageSquare className="size-6" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-400">Your website</p>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-2">
                <Label htmlFor="widgetWelcomeMessage" className="text-base font-medium">Welcome Message</Label>
                <p className="text-sm text-text-secondary">Greeting shown when visitors open the chat widget</p>
                <Textarea
                  id="widgetWelcomeMessage"
                  value={businessForm.widgetWelcomeMessage ?? businessSettings?.widgetWelcomeMessage ?? ''}
                  onChange={(e) => setBusinessForm({ ...businessForm, widgetWelcomeMessage: e.target.value })}
                  placeholder="👋 Hi there! How can we help you today?"
                  rows={2}
                />
              </div>

              {/* Offline Message */}
              <div className="space-y-2">
                <Label htmlFor="widgetOfflineMessage" className="text-base font-medium">Offline Message</Label>
                <p className="text-sm text-text-secondary">Message shown when chat is unavailable</p>
                <Textarea
                  id="widgetOfflineMessage"
                  value={businessForm.widgetOfflineMessage ?? businessSettings?.widgetOfflineMessage ?? ''}
                  onChange={(e) => setBusinessForm({ ...businessForm, widgetOfflineMessage: e.target.value })}
                  placeholder="We're currently offline. Leave a message and we'll get back to you!"
                  rows={2}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

