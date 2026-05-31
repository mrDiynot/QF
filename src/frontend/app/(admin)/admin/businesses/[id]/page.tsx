'use client';

import { use, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  Activity,
  Ban,
  CheckCircle,
  Search,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { useAdminBusiness, useSuspendBusiness, useReactivateBusiness, useAdminBusinessUsers, useAdminBusinessActivity, type BusinessActivity } from '@/hooks/admin';
import type { AdminUserListItem } from '@/types/admin';

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [suspendReason, setSuspendReason] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // API hooks - real data only
  const { data: business, isLoading, isError, error, refetch, isRefetching } = useAdminBusiness(id);
  const { data: usersData } = useAdminBusinessUsers(id);
  const { data: activityData } = useAdminBusinessActivity(id);
  const suspendMutation = useSuspendBusiness();
  const reactivateMutation = useReactivateBusiness();

  const loading = isLoading;
  const refreshing = isRefetching;

  const handleRefresh = () => {
    refetch();
  };

  const handleSuspend = () => {
    suspendMutation.mutate({ businessId: id, reason: suspendReason });
    setSuspendReason('');
    setShowSuspendDialog(false);
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(id);
  };

  // Filter users by business — getBusinessUsers returns AdminUserListItem[] directly
  const businessUsers = usersData ?? [];
  const filteredUsers = businessUsers.filter((user: AdminUserListItem) =>
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Activity data
  const activities: BusinessActivity[] = activityData ?? [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Owner</Badge>;
      case 'Admin':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Admin</Badge>;
      case 'Manager':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Manager</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-500 border-gray-200">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      case 'trial':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Trial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-500 border-gray-200">{status}</Badge>;
    }
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

  if (isError || !business) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/businesses">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-medium text-admin-foreground">Business Details</h1>
        </div>
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h2 className="text-lg font-medium text-admin-foreground mb-2">Failed to load business</h2>
              <p className="text-admin-muted-foreground mb-4">
                {error?.message || 'Business not found or you do not have permission to view it.'}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="border-admin-border">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
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
          <Link href="/admin/businesses">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-admin-foreground">{business.name}</h1>
            <p className="text-admin-muted-foreground">{business.email}</p>
          </div>
          {getStatusBadge(business.status)}
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
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Users</p>
                    <p className="text-2xl font-bold text-admin-foreground">{business.userCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold text-green-400">{business.totalMessages || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-admin-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold text-admin-foreground">{business.totalLeads}</p>
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
                    <p className="text-lg font-bold text-admin-foreground">{business.planName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-admin-muted">
              <TabsTrigger value="users" className="data-[state=active]:bg-admin-card">Users</TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-admin-card">Subscription</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-admin-card">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-admin-card border-admin-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-admin-foreground">Team Members</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 bg-admin-background border-admin-border text-admin-foreground"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-admin-border hover:bg-transparent">
                        <TableHead className="text-admin-muted-foreground">Name</TableHead>
                        <TableHead className="text-admin-muted-foreground">Email</TableHead>
                        <TableHead className="text-admin-muted-foreground">Role</TableHead>
                        <TableHead className="text-admin-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow className="border-admin-border">
                          <TableCell colSpan={4} className="text-center text-admin-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: AdminUserListItem) => (
                          <TableRow key={user.id} className="border-admin-border hover:bg-admin-muted/50">
                            <TableCell className="font-medium text-admin-foreground">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell className="text-admin-muted-foreground">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                              {user.isActive ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="bg-admin-card border-admin-border">
                <CardHeader>
                  <CardTitle className="text-admin-foreground">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-admin-muted-foreground">Plan</p>
                      <p className="text-lg font-medium text-admin-foreground">{business.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-admin-muted-foreground">Status</p>
                      <p className="text-lg font-medium text-admin-foreground capitalize">{business.subscriptionStatus || business.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-admin-muted-foreground">Subscription Start</p>
                      <p className="text-lg font-medium text-admin-foreground">
                        {business.subscriptionStartDate ? new Date(business.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-admin-muted-foreground">Total Messages</p>
                      <p className="text-lg font-medium text-green-400">{business.totalMessages || 0}</p>
                    </div>
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="pt-4 border-t border-admin-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-admin-muted-foreground">Total Leads</p>
                        <p className="text-lg font-medium text-admin-foreground">{business.totalLeads || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-admin-muted-foreground">Total Conversations</p>
                        <p className="text-lg font-medium text-admin-foreground">{business.totalConversations || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-admin-card border-admin-border">
                <CardHeader>
                  <CardTitle className="text-admin-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <p className="text-center text-admin-muted-foreground py-8">No recent activity</p>
                    ) : (
                      activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-2 border-b border-admin-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-admin-foreground">{activity.action}</p>
                            <p className="text-xs text-admin-muted-foreground">{activity.actorEmail || activity.action}</p>
                          </div>
                          <p className="text-xs text-admin-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Business Info */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">{business.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">{business.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">
                  Joined {formatDistanceToNow(new Date(business.createdAt), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {business.status === 'active' ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowSuspendDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Business
                </Button>
              ) : (
                <Button onClick={handleReactivate} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivate Business
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full border-admin-border text-admin-foreground hover:bg-admin-muted"
                onClick={() => router.push(`/admin/subscriptions?search=${encodeURIComponent(business.name)}`)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>

              {/* Suspend Dialog */}
              <AdminModal open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                <AdminModalContent size="sm">
                  <AdminModalHeader>
                    <AdminModalTitle>Suspend Business</AdminModalTitle>
                    <AdminModalDescription>
                      This will immediately suspend the business and all its users will lose access.
                    </AdminModalDescription>
                  </AdminModalHeader>
                  <AdminModalBody>
                    <Textarea
                      placeholder="Reason for suspension (optional)"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      className="bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    />
                  </AdminModalBody>
                  <AdminModalFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowSuspendDialog(false)}
                      className="border-admin-border text-admin-foreground hover:bg-admin-muted"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSuspend} className="bg-red-500 hover:bg-red-600 text-white">
                      Suspend
                    </Button>
                  </AdminModalFooter>
                </AdminModalContent>
              </AdminModal>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
