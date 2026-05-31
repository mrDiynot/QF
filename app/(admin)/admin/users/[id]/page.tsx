'use client';

import { use, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Key,
  Activity,
  Globe,
  RefreshCw,
  LogIn,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAdminUser, useSuspendUser, useReactivateUser, useResetUserPassword, useAdminBusiness } from '@/hooks/admin';
import { useImpersonation } from '@/hooks/admin/useImpersonation';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [impersonateReason, setImpersonateReason] = useState('');

  // API hooks - fetch real data
  const { data: user, isLoading, isError, error, refetch, isRefetching } = useAdminUser(id);
  const { data: business } = useAdminBusiness(user?.businessId || '');
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const resetPasswordMutation = useResetUserPassword();
  const { startImpersonation } = useImpersonation();

  const loading = isLoading;
  const refreshing = isRefetching;

  const handleRefresh = () => {
    refetch();
  };

  const handleDeactivate = () => {
    suspendMutation.mutate({ userId: id, reason: 'Admin action' });
    setShowDeactivateDialog(false);
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(id);
  };

  const handleResetPassword = () => {
    resetPasswordMutation.mutate(id);
  };

  const handleImpersonate = () => {
    setImpersonateReason('');
    setShowImpersonateDialog(true);
  };

  const handleConfirmImpersonate = () => {
    if (!user || !impersonateReason.trim()) return;
    startImpersonation.mutate(
      {
        userId: id,
        userEmail: user.email,
        businessId: user.businessId,
        businessName: user.businessName,
        reason: impersonateReason.trim(),
      },
      {
        onSuccess: () => {
          setShowImpersonateDialog(false);
          // Open the business portal in a new tab so admin portal stays accessible
          window.open('/dashboard', '_blank');
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48 bg-admin-muted" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-48 bg-admin-muted" />
            <Skeleton className="h-64 bg-admin-muted" />
          </div>
          <Skeleton className="h-96 bg-admin-muted" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-medium text-admin-foreground">User Details</h1>
        </div>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Globe className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-400">Failed to load user</h3>
                <p className="text-red-300/80 text-sm">
                  {error instanceof Error ? error.message : 'Unable to fetch user details from the server.'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-admin-muted flex items-center justify-center">
              <span className="text-lg font-medium text-admin-foreground">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-medium text-admin-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-admin-muted-foreground">{user.email}</p>
            </div>
          </div>
          {user.isActive ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-admin-border text-admin-foreground hover:bg-admin-muted"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Email</p>
                    <p className={`text-lg font-bold ${user.emailConfirmed ? 'text-green-400' : 'text-amber-400'}`}>
                      {user.emailConfirmed ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Role</p>
                    <p className="text-lg font-bold text-admin-foreground">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Key className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Subscription</p>
                    <p className="text-lg font-bold text-blue-400">
                      {user.subscriptionTier || 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Plan</p>
                    <p className="text-lg font-bold text-admin-foreground">{business?.planName || 'Loading...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Security */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-admin-border">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    <p className="text-sm font-medium text-admin-foreground">Account Status</p>
                  </div>
                  <p className={`text-sm ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-admin-border">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${user.oauthProvider ? 'bg-blue-400' : 'bg-gray-400'}`} />
                    <p className="text-sm font-medium text-admin-foreground">Auth Provider</p>
                  </div>
                  <p className="text-sm text-admin-foreground">{user.oauthProvider || 'Email/Password'}</p>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center justify-between py-2 border-b border-admin-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <p className="text-sm font-medium text-admin-foreground">Last Login</p>
                    </div>
                    <p className="text-xs text-admin-muted-foreground">
                      {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-admin-muted-foreground" />
                  <span className="text-sm text-admin-foreground">{user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-admin-muted-foreground" />
                <Link href={`/admin/businesses/${user.businessId}`} className="text-sm text-blue-400 hover:underline">
                  {user.businessName}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-3">
                  <LogIn className="h-4 w-4 text-admin-muted-foreground" />
                  <span className="text-sm text-admin-foreground">
                    Last login {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleImpersonate} className="w-full bg-[#FF6900] hover:bg-orange-600">
                <User className="h-4 w-4 mr-2" />
                Impersonate User
              </Button>

              <Button onClick={handleResetPassword} variant="outline" className="w-full border-admin-border text-admin-foreground hover:bg-admin-muted">
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>

              {user.isActive ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeactivateDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Deactivate User
                </Button>
              ) : (
                <Button onClick={handleReactivate} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivate User
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AdminModal open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>Deactivate User</AdminModalTitle>
            <AdminModalDescription>
              This will prevent the user from logging in. They can be reactivated later.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700 text-white">
              Deactivate
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Impersonation Confirmation Dialog */}
      <AdminModal open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FF6900]" />
              Impersonate User
            </AdminModalTitle>
            <AdminModalDescription>
              You are about to view the platform as this user. All actions will be logged for audit purposes.
            </AdminModalDescription>
          </AdminModalHeader>

          <div className="px-6 py-4 space-y-4">
            {/* User being impersonated */}
            <div className="p-3 rounded-lg bg-admin-muted/50 border border-admin-border space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-admin-foreground font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-admin-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-admin-muted-foreground">{user.businessName}</span>
              </div>
            </div>

            {/* Reason input (required) */}
            <div className="space-y-2">
              <Label htmlFor="impersonate-reason" className="text-sm font-medium text-admin-foreground">
                Reason for impersonation <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="impersonate-reason"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                placeholder="e.g., Investigating support ticket #1234, troubleshooting billing issue..."
                className="bg-admin-muted border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground min-h-[80px]"
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300/80">
                The business portal will open in a new tab. Your session expires in 1 hour. All actions taken during impersonation are recorded.
              </p>
            </div>
          </div>

          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowImpersonateDialog(false)}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImpersonate}
              disabled={!impersonateReason.trim() || startImpersonation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {startImpersonation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Impersonation
                </>
              )}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
