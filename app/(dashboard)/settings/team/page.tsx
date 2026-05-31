'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Search,
  Mail,
  Shield,
  Clock,
  Loader2,
  RefreshCw,
  X,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Download,
  UserCog,
  ShieldCheck,
  Activity,
  UserX,
  UserCheck,
  Filter,
  RotateCcw,
  Crown,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { teamService, BusinessRole, TeamMember, Invitation } from '@/services/api/team.service';
import { securityService } from '@/services/api/security.service';
import { formatDistanceToNow, differenceInMinutes, format } from 'date-fns';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { cn } from '@/lib/utils';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';

const ROLE_COLORS: Record<BusinessRole, string> = {
  Owner: 'bg-purple-100 text-purple-800 border-purple-200',
  Admin: 'bg-blue-100 text-blue-800 border-blue-200',
  Manager: 'bg-green-100 text-green-800 border-green-200',
  Viewer: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ROLE_DESCRIPTIONS: Record<BusinessRole, string> = {
  Owner: 'Full access to all features including billing and team management',
  Admin: 'Can manage team members, settings, and all business operations',
  Manager: 'Can manage leads, conversations, and view reports',
  Viewer: 'Read-only access to view data and reports',
};

const ROLE_ICONS: Record<BusinessRole, React.ReactNode> = {
  Owner: <Crown className="size-4" />,
  Admin: <ShieldCheck className="size-4" />,
  Manager: <UserCog className="size-4" />,
  Viewer: <Eye className="size-4" />,
};

// Permissions matrix for role comparison
const PERMISSIONS_MATRIX = [
  { permission: 'View Dashboard & Reports', Owner: true, Admin: true, Manager: true, Viewer: true },
  { permission: 'View Leads & Conversations', Owner: true, Admin: true, Manager: true, Viewer: true },
  { permission: 'Manage Leads & Conversations', Owner: true, Admin: true, Manager: true, Viewer: false },
  { permission: 'Create & Edit Workflows', Owner: true, Admin: true, Manager: true, Viewer: false },
  { permission: 'Manage Channels & Integrations', Owner: true, Admin: true, Manager: false, Viewer: false },
  { permission: 'Manage Team Members', Owner: true, Admin: true, Manager: false, Viewer: false },
  { permission: 'View Audit Logs', Owner: true, Admin: true, Manager: false, Viewer: false },
  { permission: 'Manage Business Settings', Owner: true, Admin: true, Manager: false, Viewer: false },
  { permission: 'Manage Billing & Subscription', Owner: true, Admin: false, Manager: false, Viewer: false },
  { permission: 'Transfer Ownership', Owner: true, Admin: false, Manager: false, Viewer: false },
];

// Activity status helper
const getActivityStatus = (lastLoginAt: string | null): { status: 'online' | 'away' | 'offline'; label: string } => {
  if (!lastLoginAt) return { status: 'offline', label: 'Never logged in' };
  
  const minutesAgo = differenceInMinutes(new Date(), new Date(lastLoginAt));
  
  if (minutesAgo < 5) return { status: 'online', label: 'Online now' };
  if (minutesAgo < 30) return { status: 'away', label: 'Active recently' };
  return { status: 'offline', label: formatDistanceToNow(new Date(lastLoginAt), { addSuffix: true }) };
};

const ACTIVITY_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

export default function TeamSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role: currentUserRole } = usePermissions();
  const { checkLimit } = useSubscriptionEnforcement();
  const [, setShowUpgradeDialog] = useState(false);
  const [, setUpgradeReason] = useState('');
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<BusinessRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  // Reset password modal state reserved for future use
  useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Viewer' as BusinessRole,
    personalMessage: '',
  });
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

  // Fetch team members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamService.getTeamMembers({ pageSize: 100 }),
  });

  // Fetch invitations
  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => teamService.getInvitations({ pageSize: 100, status: 'Pending' }),
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: teamService.inviteTeamMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      setShowInviteModal(false);
      const sentEmail = variables.email;
      const sentRole = variables.role;
      setInviteForm({ email: '', role: 'Viewer', personalMessage: '' });
      toast.success('Invitation sent', {
        description: `${sentEmail} has been invited as ${sentRole}. They will receive an email with instructions to join your team.`,
        duration: 6000,
      });
    },
    onError: (error: Error & { response?: { status?: number; data?: { detail?: string; title?: string; message?: string } } }) => {
      const errorMessage = error.response?.data?.message || '';
      const isDuplicateInvite = errorMessage.includes('pending invitation already exists');
      const isExistingMember = errorMessage.includes('already a member');

      // Close modal and reset form for non-recoverable errors
      if (isDuplicateInvite || isExistingMember) {
        setShowInviteModal(false);
        setInviteForm({ email: '', role: 'Viewer', personalMessage: '' });
      }

      // Handle domain restriction error (403)
      if (error.response?.status === 403 && error.response?.data?.title === 'Email Domain Restriction') {
        setShowInviteModal(false);
        setInviteForm({ email: '', role: 'Viewer', personalMessage: '' });
        toast.error('Email domain not allowed', {
          description: error.response.data.detail || 'This email domain is restricted by your security policy.',
          duration: 8000,
        });
      } else if (error.response?.status === 402) {
        setShowInviteModal(false);
        toast.error('Team member limit reached', {
          description: 'Upgrade your plan to add more team members.',
          action: {
            label: 'Upgrade',
            onClick: () => router.push('/settings/billing'),
          },
          duration: 8000,
        });
      } else if (isDuplicateInvite) {
        toast.warning('Invitation already pending', {
          description: 'You can resend the invitation from the Pending Invites tab.',
          action: {
            label: 'View Pending',
            onClick: () => setActiveTab('invitations'),
          },
          duration: 6000,
        });
      } else if (isExistingMember) {
        toast.info('Already a team member', {
          description: 'This person is already part of your team.',
          duration: 5000,
        });
      } else if (errorMessage) {
        toast.error('Failed to send invitation', {
          description: errorMessage,
          duration: 5000,
        });
      } else {
        toast.error('Failed to send invitation', {
          description: 'Please try again or contact support if the issue persists.',
          duration: 5000,
        });
      }
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: BusinessRole }) =>
      teamService.updateTeamMemberRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowRoleModal(false);
      setSelectedMember(null);
      toast.success('Role updated', {
        description: 'Team member permissions have been updated.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setShowRoleModal(false);
      toast.error('Failed to update role', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: teamService.removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowRemoveModal(false);
      setSelectedMember(null);
      toast.success('Team member removed', {
        description: 'They will no longer have access to your workspace.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setShowRemoveModal(false);
      toast.error('Failed to remove team member', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: teamService.resendInvitation,
    onSuccess: () => {
      toast.success('Invitation resent', {
        description: 'A new invitation email has been sent.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to resend invitation', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: teamService.cancelInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation cancelled', {
        description: 'The invitation link is no longer valid.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to cancel invitation', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: securityService.changePassword,
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password changed', {
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      // Don't close modal on password errors - user needs to retry
      toast.error('Failed to change password', {
        description: error.response?.data?.message || error.message || 'Please check your current password and try again.',
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
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password too short', {
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  // Deactivate member mutation
  const deactivateMutation = useMutation({
    mutationFn: teamService.deactivateTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowDeactivateModal(false);
      setSelectedMember(null);
      toast.success('Team member deactivated', {
        description: 'They can no longer access the workspace.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setShowDeactivateModal(false);
      toast.error('Failed to deactivate', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Reactivate member mutation
  const reactivateMutation = useMutation({
    mutationFn: teamService.reactivateTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member reactivated', {
        description: 'They can now access the workspace again.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to reactivate', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Filter members based on search, role, and status
  const filteredMembers = useMemo(() => {
    return (membersData?.items ?? []).filter((member) => {
      const matchesSearch = 
        member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && member.isActive) ||
        (statusFilter === 'inactive' && !member.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [membersData?.items, searchTerm, roleFilter, statusFilter]);

  const pendingInvitations = invitationsData?.items ?? [];

  // Role distribution stats
  const roleStats = useMemo(() => {
    const items = membersData?.items ?? [];
    return {
      owners: items.filter(m => m.role === 'Owner').length,
      admins: items.filter(m => m.role === 'Admin').length,
      managers: items.filter(m => m.role === 'Manager').length,
      viewers: items.filter(m => m.role === 'Viewer').length,
    };
  }, [membersData?.items]);

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const toggleSelectMember = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  // Export team data to CSV
  const exportTeamData = () => {
    const items = membersData?.items ?? [];
    const headers = ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Joined'];
    const rows = items.map(m => [
      `${m.firstName} ${m.lastName}`,
      m.email,
      m.role,
      m.isActive ? 'Active' : 'Inactive',
      m.lastLoginAt ? format(new Date(m.lastLoginAt), 'yyyy-MM-dd HH:mm') : 'Never',
      m.createdAt ? format(new Date(m.createdAt), 'yyyy-MM-dd') : 'Unknown',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-members-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Team data exported');
  };

  const handleInvite = () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address');
      return;
    }

    // Check seat limit
    const seatLimit = checkLimit('maxSeats');
    if (!seatLimit.allowed) {
      setUpgradeReason(`You've reached your team seat limit (${seatLimit.limit} seats). Upgrade to add more team members.`);
      setShowUpgradeDialog(true);
      setShowInviteModal(false);
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  const handleUpdateRole = (role: BusinessRole) => {
    if (selectedMember) {
      updateRoleMutation.mutate({ id: selectedMember.id, role });
    }
  };

  const handleRemoveMember = () => {
    if (selectedMember) {
      removeMutation.mutate(selectedMember.id);
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-navy">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your team members, roles, and access permissions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPermissionsModal(true)}
                className="gap-2"
              >
                <Info className="size-4" />
                <span className="hidden sm:inline">Role Permissions</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View role permissions matrix</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={exportTeamData}
                className="gap-2"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export team data to CSV</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="gap-2"
          >
            <Key className="size-4" />
            <span className="hidden sm:inline">Change Password</span>
          </Button>
          <PermissionGate
            requireAdminOrOwner
            fallback={
              <Button disabled size="sm" className="gap-2 opacity-50">
                <Lock className="size-4" />
                Invite
              </Button>
            }
          >
            <Button
              size="sm"
              onClick={() => {
                const seatLimit = checkLimit('maxSeats');
                if (!seatLimit.allowed) {
                  setUpgradeReason(`You've reached your team seat limit (${seatLimit.limit} seats). Upgrade to add more team members.`);
                  setShowUpgradeDialog(true);
                  return;
                }
                setShowInviteModal(true);
              }}
              className="gap-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
            >
              <UserPlus className="size-4" />
              Invite Member
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold">{membersData?.totalCount || membersData?.items?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">
                {(membersData?.items ?? []).filter((m) => m.isActive).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Mail className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Invites</p>
              <p className="text-2xl font-bold">{pendingInvitations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <UserX className="size-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold">
                {(membersData?.items ?? []).filter((m) => !m.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Role Distribution</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPermissionsModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            View Permissions
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200">
            <Crown className="size-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">{roleStats.owners} Owner{roleStats.owners !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
            <ShieldCheck className="size-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{roleStats.admins} Admin{roleStats.admins !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <UserCog className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">{roleStats.managers} Manager{roleStats.managers !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <Eye className="size-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{roleStats.viewers} Viewer{roleStats.viewers !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" />
            Members ({membersData?.totalCount || membersData?.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="size-4" />
            Pending Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <Card>
            {/* Search and Filters */}
            <div className="p-4 border-b space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as BusinessRole | 'all')}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="size-4 mr-2" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger className="w-[130px]">
                      <Activity className="size-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRoleFilter('all');
                        setStatusFilter('all');
                        setSearchTerm('');
                      }}
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Bulk Actions Bar */}
              {selectedMembers.size > 0 && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Checkbox
                    checked={selectedMembers.size === filteredMembers.filter(m => m.role !== 'Owner').length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium text-blue-800">
                    {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMembers(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>

            {/* Members List */}
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No members found matching your filters' 
                  : 'No team members yet'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredMembers.map((member) => (
                  <TeamMemberRow
                    key={member.id}
                    member={member}
                    onChangeRole={() => {
                      setSelectedMember(member);
                      setShowRoleModal(true);
                    }}
                    onRemove={() => {
                      setSelectedMember(member);
                      setShowRemoveModal(true);
                    }}
                    onDeactivate={() => {
                      setSelectedMember(member);
                      setShowDeactivateModal(true);
                    }}
                    onReactivate={() => reactivateMutation.mutate(member.id)}
                    isSelected={selectedMembers.has(member.id)}
                    onToggleSelect={() => toggleSelectMember(member.id)}
                    showCheckbox={selectedMembers.size > 0 || (currentUserRole === 'Owner' || currentUserRole === 'Admin')}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="mt-4">
          <Card>
            {isLoadingInvitations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No pending invitations
              </div>
            ) : (
              <div className="divide-y">
                {pendingInvitations.map((invitation) => (
                  <InvitationRow
                    key={invitation.id}
                    invitation={invitation}
                    onResend={() => resendMutation.mutate(invitation.id)}
                    onCancel={() => cancelInvitationMutation.mutate(invitation.id)}
                    isResending={resendMutation.isPending}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Invite Team Member</ModalTitle>
            <ModalDescription>
              Send an invitation to join your team. They&apos;ll receive an email with instructions.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value: BusinessRole) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[inviteForm.role]}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal note to the invitation..."
                value={inviteForm.personalMessage}
                onChange={(e) => setInviteForm({ ...inviteForm, personalMessage: e.target.value })}
                rows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Role Modal */}
      <Modal open={showRoleModal} onOpenChange={setShowRoleModal}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Change Role</ModalTitle>
            <ModalDescription>
              Update the role for {selectedMember?.firstName} {selectedMember?.lastName}
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {(['Admin', 'Manager', 'Viewer'] as BusinessRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleUpdateRole(role)}
                disabled={updateRoleMutation.isPending || selectedMember?.role === role}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  selectedMember?.role === role
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${updateRoleMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{role}</p>
                    <p className="text-sm text-gray-500">{ROLE_DESCRIPTIONS[role]}</p>
                  </div>
                  {selectedMember?.role === role && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
              </button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Remove Member Modal */}
      <ConfirmModal
        open={showRemoveModal}
        onOpenChange={setShowRemoveModal}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${selectedMember?.firstName} ${selectedMember?.lastName} from your team? They will lose access to all business data immediately.`}
        variant="danger"
        confirmLabel="Remove Member"
        loading={removeMutation.isPending}
        onConfirm={handleRemoveMember}
        onCancel={() => setShowRemoveModal(false)}
      />

      {/* Change Password Modal */}
      <Modal open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Key className="size-5" />
              Change Password
            </ModalTitle>
            <ModalDescription>
              Enter your current password and choose a new one.
            </ModalDescription>
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
                  {showPasswords.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                  {showPasswords.new ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                  {showPasswords.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Permissions Matrix Modal */}
      <Modal open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <ModalContent size="xl">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Role Permissions Matrix
            </ModalTitle>
            <ModalDescription>
              Compare what each role can do in your organization
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-gray-700 w-[200px]">Permission</th>
                    {(['Owner', 'Admin', 'Manager', 'Viewer'] as BusinessRole[]).map((role) => (
                      <th key={role} className="text-center py-3 px-2 w-[100px]">
                        <Badge className={cn(ROLE_COLORS[role], 'gap-1 text-xs')}>
                          {ROLE_ICONS[role]}
                          {role}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_MATRIX.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-3 text-gray-700 text-sm">{row.permission}</td>
                      {(['Owner', 'Admin', 'Manager', 'Viewer'] as BusinessRole[]).map((role) => (
                        <td key={role} className="text-center py-2 px-2">
                          {row[role] ? (
                            <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="size-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Role Descriptions</h4>
              <div className="grid gap-2 text-sm">
                {(['Owner', 'Admin', 'Manager', 'Viewer'] as BusinessRole[]).map((role) => (
                  <div key={role} className="flex items-start gap-2">
                    <Badge className={cn(ROLE_COLORS[role], 'shrink-0 gap-1')}>
                      {ROLE_ICONS[role]}
                      {role}
                    </Badge>
                    <span className="text-blue-800">{ROLE_DESCRIPTIONS[role]}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Deactivate Member Modal */}
      <Modal open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-amber-600">
              <UserX className="size-5" />
              Deactivate Team Member
            </ModalTitle>
            <ModalDescription>
              Deactivating {selectedMember?.firstName} {selectedMember?.lastName} will revoke their access.
              They can be reactivated later without losing their data.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>What happens when you deactivate a member:</strong>
              </p>
              <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
                <li>They will be immediately logged out</li>
                <li>They cannot access the platform until reactivated</li>
                <li>Their data and history are preserved</li>
                <li>They will not count toward your seat limit</li>
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => selectedMember && deactivateMutation.mutate(selectedMember.id)}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Deactivate Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
    </TooltipProvider>
  );
}

// Helper Components
function TeamMemberRow({
  member,
  onChangeRole,
  onRemove,
  onDeactivate,
  onReactivate,
  isSelected,
  onToggleSelect,
  showCheckbox,
}: {
  member: TeamMember;
  onChangeRole: () => void;
  onRemove: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  showCheckbox: boolean;
}) {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || '??';
  const activityStatus = getActivityStatus(member.lastLoginAt);

  return (
    <div className={cn(
      "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
      isSelected && "bg-blue-50"
    )}>
      <div className="flex items-center gap-4">
        {showCheckbox && member.role !== 'Owner' && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="shrink-0"
          />
        )}
        <div className="relative">
          <Avatar className="size-10">
            <AvatarFallback className={cn(
              "font-semibold text-white",
              member.isActive 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600" 
                : "bg-gray-400"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Activity Status Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white",
                ACTIVITY_COLORS[activityStatus.status]
              )} />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {activityStatus.label}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-text-navy truncate">
              {member.firstName} {member.lastName}
            </p>
            {member.role === 'Owner' && (
              <Tooltip>
                <TooltipTrigger>
                  <Crown className="size-4 text-purple-500" />
                </TooltipTrigger>
                <TooltipContent>Business Owner</TooltipContent>
              </Tooltip>
            )}
            {!member.isActive && (
              <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                <UserX className="size-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{member.email}</p>
          {member.lastLoginAt && (
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              Last login: {format(new Date(member.lastLoginAt), 'MMM d, yyyy h:mm a')}
            </p>
          )}
          {!member.lastLoginAt && (
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              Never logged in
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Badge className={cn(ROLE_COLORS[member.role], 'gap-1 hidden sm:flex')}>
          {ROLE_ICONS[member.role]}
          {member.role}
        </Badge>
        <Badge className={cn(ROLE_COLORS[member.role], 'sm:hidden')}>
          {member.role}
        </Badge>
        {member.role !== 'Owner' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onChangeRole}>
                <Shield className="size-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {member.isActive ? (
                <DropdownMenuItem onClick={onDeactivate} className="text-amber-600">
                  <UserX className="size-4 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onReactivate} className="text-green-600">
                  <UserCheck className="size-4 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <X className="size-4 mr-2" />
                Remove from Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function InvitationRow({
  invitation,
  onResend,
  onCancel,
  isResending,
}: {
  invitation: Invitation;
  onResend: () => void;
  onCancel: () => void;
  isResending: boolean;
}) {
  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-orange-100">
          <Mail className="size-5 text-orange-600" />
        </div>
        <div>
          <p className="font-medium text-text-navy">{invitation.email}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Invited by {invitation.invitedByName}</span>
            <span>•</span>
            <Clock className="size-3" />
            <span>
              {isExpired ? 'Expired' : `Expires ${formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={ROLE_COLORS[invitation.role]}>{invitation.role}</Badge>
        <Button variant="outline" size="sm" onClick={onResend} disabled={isResending}>
          {isResending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          <span className="ml-2 hidden sm:inline">Resend</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-red-600 hover:text-red-700">
          <X className="size-4" />
          <span className="ml-2 hidden sm:inline">Cancel</span>
        </Button>
      </div>
    </div>
  );
}

