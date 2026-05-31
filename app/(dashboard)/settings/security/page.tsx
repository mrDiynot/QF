'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Key, Smartphone, LogOut, Eye, EyeOff, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ConfirmModal,
} from '@/components/modals';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { securityService, type ActiveSession } from '@/services/api/security.service';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function SecuritySettingsPage() {
  const queryClient = useQueryClient();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showRevokeAll, setShowRevokeAll] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch security settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => securityService.getSecuritySettings(),
  });

  // Fetch active sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => securityService.getActiveSessions(),
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: securityService.changePassword,
    onSuccess: () => {
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password changed', {
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      // Don't close modal - let user retry
      toast.error('Failed to change password', {
        description: error.response?.data?.message || error.message || 'Please check your current password.',
      });
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: securityService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast.success('Session revoked', {
        description: 'The device has been signed out.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to revoke session', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: securityService.revokeAllSessions,
    onSuccess: () => {
      setShowRevokeAll(false);
      toast.success('All sessions revoked', {
        description: 'Redirecting to login...',
      });
      // Redirect to login after a short delay
      setTimeout(() => window.location.href = '/login', 1500);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setShowRevokeAll(false);
      toast.error('Failed to revoke sessions', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both password fields match.',
      });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security and active sessions</p>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Verified</CardTitle>
            {settings?.emailVerified ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate" title={settings?.email}>
              {settings?.email}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.emailVerified ? 'Verified' : 'Not verified'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings?.activeSessionCount || 0}</div>
            <p className="text-xs text-muted-foreground">Devices logged in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">OAuth Providers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {settings?.connectedOAuthProviders?.length ? (
                settings.connectedOAuthProviders.map((provider) => (
                  <Badge key={provider} variant="secondary">{provider}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None connected</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            {settings?.isOAuthUser && !settings?.hasPassword
              ? 'You signed up with OAuth. Set a password to enable email login.'
              : 'Change your password to keep your account secure'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings?.hasPassword ? (
            <Button onClick={() => setShowChangePassword(true)}>Change Password</Button>
          ) : (
            <Button onClick={() => setShowChangePassword(true)}>Set Password</Button>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices where you&apos;re logged in</CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowRevokeAll(true)}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out Everywhere
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sessions?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-4">
              {sessions?.map((session: ActiveSession) => (
                <div key={session.sessionId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Smartphone className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.deviceType}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.ipAddress || 'Unknown IP'} • {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isCurrentSession && <Badge variant="secondary">Current</Badge>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(session.sessionId)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Modal open={showChangePassword} onOpenChange={setShowChangePassword}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Change Password</ModalTitle>
            <ModalDescription>Enter your current password and choose a new one.</ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </AlertDescription>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Revoke All Sessions Dialog */}
      <ConfirmModal
        open={showRevokeAll}
        onOpenChange={setShowRevokeAll}
        title="Sign Out Everywhere"
        description="This will sign you out of all devices, including this one. You will need to log in again."
        variant="danger"
        confirmLabel="Sign Out Everywhere"
        loading={revokeAllMutation.isPending}
        onConfirm={() => revokeAllMutation.mutate()}
        onCancel={() => setShowRevokeAll(false)}
      />
    </div>
  );
}

