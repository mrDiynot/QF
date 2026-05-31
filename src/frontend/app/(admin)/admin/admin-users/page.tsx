'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Pencil,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Mail,
  Copy,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
  Network,
  AlertCircle,
} from 'lucide-react';
import { PageHeader, FilterBar, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  useAdminAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUserRole,
  useUpdateAdminUserIpWhitelist,
  useDeactivateAdminUser,
  useReactivateAdminUser,
  useResetAdminPassword,
} from '@/hooks/admin';
import type { AdminUser } from '@/types/admin';

export default function AdminUsersPage() {
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [ipWhitelistDialogOpen, setIpWhitelistDialogOpen] = useState(false);
  const [ipWhitelistUser, setIpWhitelistUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'SupportAdmin',
    ipWhitelist: [] as string[],
  });
  const [ipInput, setIpInput] = useState('');
  const [tempIpList, setTempIpList] = useState<string[]>([]);

  // Success states for displaying passwords
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Build query object
  const query = useMemo(() => ({
    page,
    pageSize,
    searchTerm: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  }), [page, pageSize, search, roleFilter, statusFilter]);

  // Use React Query hooks
  const { data, isLoading: loading, isError, refetch, isRefetching: refreshing } = useAdminAdminUsers(query);
  const createMutation = useCreateAdminUser();
  const updateRoleMutation = useUpdateAdminUserRole();
  const updateIpWhitelistMutation = useUpdateAdminUserIpWhitelist();
  const deactivateMutation = useDeactivateAdminUser();
  const reactivateMutation = useReactivateAdminUser();
  const resetPasswordMutation = useResetAdminPassword();

  const adminUsers = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  // Helper functions
  const getInitials = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : fullName.substring(0, 2);
  };

  const openDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ipWhitelist: [],
      });
    } else {
      setEditingUser(null);
      setFormData({ email: '', firstName: '', lastName: '', role: 'SupportAdmin', ipWhitelist: [] });
      setCreatedAdmin(null);
    }
    setDialogOpen(true);
  };

  const openIpWhitelistDialog = (user: AdminUser) => {
    setIpWhitelistUser(user);
    setTempIpList([...user.ipWhitelist]);
    setIpInput('');
    setIpWhitelistDialogOpen(true);
  };

  const saveUser = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      // Update role if changed
      if (formData.role !== editingUser.role) {
        updateRoleMutation.mutate({ id: editingUser.id, role: formData.role });
      }
      setDialogOpen(false);
    } else {
      // Create new admin user
      createMutation.mutate(
        {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          ipWhitelist: formData.ipWhitelist.length > 0 ? formData.ipWhitelist : undefined,
        },
        {
          onSuccess: (data) => {
            setCreatedAdmin({
              email: formData.email,
              temporaryPassword: data.temporaryPassword,
            });
            setShowPassword(false);
          },
        }
      );
    }
  };

  const saveIpWhitelist = () => {
    if (!ipWhitelistUser) return;
    
    updateIpWhitelistMutation.mutate(
      { id: ipWhitelistUser.id, ipWhitelist: tempIpList },
      {
        onSuccess: () => {
          setIpWhitelistDialogOpen(false);
          setIpWhitelistUser(null);
          setTempIpList([]);
        },
      }
    );
  };

  const addIpAddress = () => {
    if (ipInput.trim() && isValidIpAddress(ipInput.trim())) {
      setTempIpList(prev => [...prev, ipInput.trim()]);
      setIpInput('');
    } else {
      toast.error('Please enter a valid IP address');
    }
  };

  const removeIpAddress = (ip: string) => {
    setTempIpList(prev => prev.filter(i => i !== ip));
  };

  const isValidIpAddress = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => parseInt(part) <= 255);
    }
    
    return ipv6Regex.test(ip) || cidrRegex.test(ip);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (_err) {
      toast.error('Failed to copy');
    }
  };

  const closeSuccessModal = () => {
    setCreatedAdmin(null);
    setDialogOpen(false);
    setFormData({ email: '', firstName: '', lastName: '', role: 'SupportAdmin', ipWhitelist: [] });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordData(null);
    setResetPasswordUser(null);
    setShowResetPassword(false);
  };

  const handleResetPassword = (user: AdminUser) => {
    resetPasswordMutation.mutate(user.id, {
      onSuccess: (data) => {
        setResetPasswordData({
          email: user.email,
          temporaryPassword: data.temporaryPassword,
        });
        setShowResetPassword(false);
      },
    });
  };

  const getRoleDescription = (role: string): string => {
    const descriptions: Record<string, string> = {
      SuperAdmin: 'Full access — All menus including Admin Users management',
      PlatformAdmin: 'Full access — All menus except Admin Users management',
      SupportAdmin: 'Menu access: Dashboard, Businesses, Users, Support Tickets, Approval Requests, Business Workflows',
      BillingAdmin: 'Menu access: Dashboard, Subscriptions, Billing, AI Usage, Revenue Analytics',
      ContentAdmin: 'Menu access: Dashboard, CMS only',
    };
    return descriptions[role] || '';
  };

  const toggleUserStatus = (user: AdminUser) => {
    if (user.isActive) {
      setUserToDelete(user);
    } else {
      reactivateMutation.mutate(user.id);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { className: string; icon: React.ReactNode }> = {
      SuperAdmin: { className: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <ShieldAlert className="h-3 w-3 mr-1" /> },
      PlatformAdmin: { className: 'bg-gray-100 text-purple-600 border-purple-200', icon: <ShieldCheck className="h-3 w-3 mr-1" /> },
      SupportAdmin: { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Shield className="h-3 w-3 mr-1" /> },
      BillingAdmin: { className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <ShieldCheck className="h-3 w-3 mr-1" /> },
      ContentAdmin: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Shield className="h-3 w-3 mr-1" /> },
    };
    const style = styles[role] || styles.SupportAdmin;
    return (
      <Badge className={style.className}>
        {style.icon}
        {role.replace(/([A-Z])/g, ' $1').trim()}
      </Badge>
    );
  };

  // Define table columns
  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'admin',
      label: 'Admin',
      sortable: true,
      width: 'min-w-[280px]',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-admin-muted flex items-center justify-center">
            <span className="text-sm font-medium text-admin-foreground">{getInitials(user.fullName)}</span>
          </div>
          <div>
            <p className="font-medium text-admin-foreground flex items-center gap-2">
              {user.fullName}
              {user.mustChangePassword && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Must Change Password</Badge>
              )}
            </p>
            <p className="text-sm text-admin-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />{user.email}
            </p>
            {user.ipWhitelist.length > 0 && (
              <p className="text-xs text-admin-muted-foreground flex items-center gap-1 mt-0.5">
                <Network className="h-3 w-3" />{user.ipWhitelist.length} IP{user.ipWhitelist.length !== 1 ? 's' : ''} whitelisted
              </p>
            )}
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortable: true, render: (user) => getRoleBadge(user.role) },
    {
      key: 'mfa', label: 'MFA',
      render: (user) => user.twoFactorEnabled
        ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Key className="h-3 w-3 mr-1" />Enabled</Badge>
        : <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Disabled</Badge>,
    },
    {
      key: 'status', label: 'Status',
      render: (user) => user.isActive
        ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
        : <Badge className="bg-gray-100 text-gray-500 border-gray-200">Inactive</Badge>,
    },
    {
      key: 'lastLogin', label: 'Last Login', hideOnMobile: true,
      render: (user) => (
        <div className="text-admin-muted-foreground">
          <div>{user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'Never'}</div>
          {user.lastLoginIp && <div className="text-xs text-admin-muted-foreground/70">from {user.lastLoginIp}</div>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openDialog(user)} className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground" title="Edit role"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => openIpWhitelistDialog(user)} className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground" title="Manage IP whitelist"><Network className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setResetPasswordUser(user)} className="h-8 w-8 text-blue-400 hover:text-blue-500" title="Reset password"><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => toggleUserStatus(user)} className={`h-8 w-8 ${user.isActive ? 'text-amber-400 hover:text-amber-500' : 'text-green-400 hover:text-green-500'}`} title={user.isActive ? 'Deactivate' : 'Reactivate'}>
            {user.isActive ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Admin Users"
        description="Manage administrator accounts and permissions"
        isError={isError}
        onRefresh={() => refetch()}
        isRefreshing={refreshing}
        actions={
          <Button onClick={() => openDialog()} className="bg-[#FF6900] hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            key: 'role', label: 'Role', value: roleFilter,
            onChange: (v) => { setRoleFilter(v); setPage(1); },
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'SuperAdmin', label: 'Super Admin' },
              { value: 'PlatformAdmin', label: 'Platform Admin' },
              { value: 'SupportAdmin', label: 'Support Admin' },
              { value: 'BillingAdmin', label: 'Billing Admin' },
              { value: 'ContentAdmin', label: 'Content Admin' },
            ],
          },
          {
            key: 'status', label: 'Status', value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
      />

      {/* Admin Users Table */}
      <DataTable
        columns={columns}
        data={adminUsers}
        loading={loading}
        emptyMessage="No admin users found"
        emptyDescription="Create your first admin user to get started"
        getRowId={(row) => row.id}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Add/Edit Dialog */}
      <AdminModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>
              {editingUser ? 'Edit Admin User' : 'Add Admin User'}
            </AdminModalTitle>
            <AdminModalDescription>
              {editingUser ? 'Update admin user role and permissions.' : 'Create a new admin user with specific role and permissions.'}
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                  disabled={!!editingUser}
                />
              </div>
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                disabled={!!editingUser}
              />
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Role *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
                <SelectTrigger className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground hover:bg-admin-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-background border-admin-border shadow-lg backdrop-blur-none">
                  <SelectItem 
                    value="SuperAdmin" 
                    className="text-admin-foreground hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Super Admin</div>
                        <div className="text-xs text-admin-muted-foreground">All menus including Admin Users management</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="PlatformAdmin" 
                    className="text-admin-foreground hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Platform Admin</div>
                        <div className="text-xs text-admin-muted-foreground">All menus except Admin Users management</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="SupportAdmin" 
                    className="text-admin-foreground hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Support Admin</div>
                        <div className="text-xs text-admin-muted-foreground">Dashboard, Businesses, Users, Support Tickets, Approvals, Business Workflows, Audit Logs</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="BillingAdmin" 
                    className="text-admin-foreground hover:bg-green-500/20 focus:bg-green-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Billing Admin</div>
                        <div className="text-xs text-admin-muted-foreground">Dashboard, Subscriptions, Billing, AI Usage, Revenue Analytics</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="ContentAdmin" 
                    className="text-admin-foreground hover:bg-amber-500/20 focus:bg-amber-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Content Admin</div>
                        <div className="text-xs text-admin-muted-foreground">CMS only</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-admin-muted-foreground mt-2">
                <Info className="h-3 w-3 inline mr-1" />
                {getRoleDescription(formData.role)}
              </p>
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button 
              onClick={saveUser} 
              disabled={createMutation.isPending || updateRoleMutation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {createMutation.isPending || updateRoleMutation.isPending ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Admin'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Temporary Password Success Modal */}
      {createdAdmin && (
        <AdminModal open={true} onOpenChange={() => closeSuccessModal()}>
          <AdminModalContent size="md">
            <AdminModalHeader>
              <AdminModalTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Admin User Created Successfully
              </AdminModalTitle>
            </AdminModalHeader>
            <AdminModalBody>
              <div className="space-y-5">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-400">Important Security Notice</p>
                      <p className="text-sm text-admin-muted-foreground mt-1">
                        This temporary password will only be shown once. Make sure to copy it and send it to the admin user securely. They will be required to change it on first login.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Email</Label>
                  <div className="mt-1.5 p-3 bg-admin-background border border-admin-border rounded-lg">
                    <p className="text-admin-foreground font-mono">{createdAdmin.email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Temporary Password</Label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="flex-1 p-3 bg-admin-background border border-admin-border rounded-lg">
                      <p className="text-admin-foreground font-mono break-all">
                        {showPassword ? createdAdmin.temporaryPassword : '••••••••••••••••'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="border-admin-border flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(createdAdmin.temporaryPassword)}
                      className="border-admin-border flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AdminModalBody>
            <AdminModalFooter>
              <Button onClick={closeSuccessModal} className="bg-[#FF6900] hover:bg-orange-600 w-full">
                I&apos;ve Saved the Password
              </Button>
            </AdminModalFooter>
          </AdminModalContent>
        </AdminModal>
      )}

      {/* Password Reset Success Modal */}
      {resetPasswordData && (
        <AdminModal open={true} onOpenChange={() => closeResetPasswordModal()}>
          <AdminModalContent size="md">
            <AdminModalHeader>
              <AdminModalTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Password Reset Successfully
              </AdminModalTitle>
            </AdminModalHeader>
            <AdminModalBody>
              <div className="space-y-5">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-400">Important Security Notice</p>
                      <p className="text-sm text-admin-muted-foreground mt-1">
                        This temporary password will only be shown once. The admin user will be required to change it on next login.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Email</Label>
                  <div className="mt-1.5 p-3 bg-admin-background border border-admin-border rounded-lg">
                    <p className="text-admin-foreground font-mono">{resetPasswordData.email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-admin-foreground text-sm font-medium">New Temporary Password</Label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="flex-1 p-3 bg-admin-background border border-admin-border rounded-lg">
                      <p className="text-admin-foreground font-mono break-all">
                        {showResetPassword ? resetPasswordData.temporaryPassword : '••••••••••••••••'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="border-admin-border flex-shrink-0"
                    >
                      {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(resetPasswordData.temporaryPassword)}
                      className="border-admin-border flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AdminModalBody>
            <AdminModalFooter>
              <Button onClick={closeResetPasswordModal} className="bg-[#FF6900] hover:bg-orange-600 w-full">
                I&apos;ve Saved the Password
              </Button>
            </AdminModalFooter>
          </AdminModalContent>
        </AdminModal>
      )}

      {/* IP Whitelist Management Dialog */}
      <AdminModal open={ipWhitelistDialogOpen} onOpenChange={setIpWhitelistDialogOpen}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Manage IP Whitelist
            </AdminModalTitle>
            <AdminModalDescription>
              Configure allowed IP addresses for {ipWhitelistUser?.fullName}. Leave empty to allow access from any IP.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Add IP Address</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                  placeholder="192.168.1.1 or 2001:db8::1 or 10.0.0.0/24"
                  className="flex-1 bg-admin-background border-admin-border text-admin-foreground"
                />
                <Button
                  onClick={addIpAddress}
                  className="bg-[#FF6900] hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                Supports IPv4, IPv6, and CIDR notation
              </p>
            </div>

            {tempIpList.length > 0 && (
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Whitelisted IPs ({tempIpList.length})</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {tempIpList.map((ip, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-admin-background border border-admin-border rounded-lg"
                    >
                      <span className="text-admin-foreground font-mono text-sm">{ip}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIpAddress(ip)}
                        className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tempIpList.length === 0 && (
              <div className="p-4 bg-admin-muted/30 border border-admin-border rounded-lg text-center">
                <Network className="h-8 w-8 text-admin-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-admin-muted-foreground">
                  No IP restrictions - access allowed from any IP address
                </p>
              </div>
            )}
          </AdminModalBody>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setIpWhitelistDialogOpen(false)}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={saveIpWhitelist}
              disabled={updateIpWhitelistMutation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {updateIpWhitelistMutation.isPending ? 'Saving...' : 'Save IP Whitelist'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Password Reset Confirmation Dialog */}
      <AdminModal open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>Reset Password</AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to reset the password for {resetPasswordUser?.fullName}? A new temporary password will be generated.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordUser(null)}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (resetPasswordUser) {
                  handleResetPassword(resetPasswordUser);
                }
              }}
              disabled={resetPasswordMutation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Deactivate Confirmation Dialog */}
      <AdminModal open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>Deactivate Admin User</AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to deactivate {userToDelete?.fullName}? They will no longer be able to access the admin portal.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (userToDelete) {
                  deactivateMutation.mutate(userToDelete.id);
                  setUserToDelete(null);
                }
              }}
              disabled={deactivateMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
