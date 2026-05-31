'use client';

/**
 * User Profile Settings Component
 * Manage personal profile, avatar, and account settings
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Lock,
  Shield,
  Globe,
  Key,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  bio?: string;
  timezone: string;
  language: string;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@company.com',
  phone: '+1 (555) 123-4567',
  jobTitle: 'Sales Manager',
  bio: '',
  timezone: 'America/New_York',
  language: 'en',
};

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
];

interface ProfileSettingsProps {
  initialProfile?: Partial<UserProfile>;
  onSave?: (profile: UserProfile) => void;
  className?: string;
}

export function ProfileSettings({ initialProfile, onSave, className }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({
    ...DEFAULT_PROFILE,
    ...initialProfile,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateProfile = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(profile);
    setIsEditing(false);
    toast.success('Profile updated');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <Avatar className="size-24">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 size-8 rounded-full"
            >
              <Camera className="size-4" />
            </Button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground">{profile.jobTitle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="size-4" />
                {profile.email}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-4" />
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={cn(
              "gap-2",
              isEditing ? "bg-primary hover:bg-purple-700" : ""
            )}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? <Save className="size-4" /> : <User className="size-4" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="size-5 text-primary" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => updateProfile('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => updateProfile('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => updateProfile('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={profile.jobTitle || ''}
                onChange={(e) => updateProfile('jobTitle', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={profile.bio || ''}
                onChange={(e) => updateProfile('bio', e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={profile.timezone}
                onValueChange={(v) => updateProfile('timezone', v)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={profile.language}
                onValueChange={(v) => updateProfile('language', v)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            Security
          </h3>
          <div className="space-y-4">
            {showPasswordChange ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} className="bg-primary hover:bg-purple-700">
                    Update Password
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <Key className="size-4" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield className="size-4" />
                  Enable Two-Factor Auth
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Lock className="size-4" />
                  Active Sessions
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-2">
            <Trash2 className="size-4" />
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  );
}
