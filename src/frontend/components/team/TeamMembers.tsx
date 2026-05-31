'use client';

/**
 * Team Members Management Component
 * Displays and manages team members with roles and permissions
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import {
  Users,
  Search,
  MoreVertical,
  Mail,
  Shield,
  UserCog,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  UserPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  useTeamMembers,
  usePendingInvitations,
  useInviteTeamMember,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
  useResendInvitation,
  type TeamMember as ApiTeamMember,
} from '@/hooks/api/useTeamMembers';

interface DisplayTeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: Date;
  joinedAt: Date;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  owner: { label: 'Owner', color: 'bg-primary/10 text-primary', icon: <Crown className="size-3" /> },
  admin: { label: 'Admin', color: 'bg-muted/50 text-info', icon: <Shield className="size-3" /> },
  member: { label: 'Member', color: 'bg-green-100 text-green-700', icon: <Users className="size-3" /> },
  viewer: { label: 'Viewer', color: 'bg-muted/40 text-foreground/80', icon: <Users className="size-3" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'text-green-600', icon: <CheckCircle className="size-3" /> },
  pending: { label: 'Pending', color: 'text-amber-600', icon: <Clock className="size-3" /> },
  inactive: { label: 'Inactive', color: 'text-muted-foreground/60', icon: <XCircle className="size-3" /> },
};

// Transform API team member to display format
function transformTeamMember(member: ApiTeamMember): DisplayTeamMember {
  return {
    id: member.id,
    name: member.fullName,
    email: member.email,
    avatar: member.profilePictureUrl,
    role: member.role.toLowerCase(),
    status: member.isActive ? 'active' : 'inactive',
    lastActive: member.lastLoginAt ? new Date(member.lastLoginAt) : undefined,
    joinedAt: new Date(member.joinedAt),
  };
}

interface TeamMembersProps {
  className?: string;
}

export function TeamMembers({ className }: TeamMembersProps) {
  const { data: teamMembersData, isLoading, error } = useTeamMembers();
  const { data: invitationsData } = usePendingInvitations();
  const inviteMutation = useInviteTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const removeMemberMutation = useRemoveTeamMember();
  const resendInvitationMutation = useResendInvitation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');

  // Transform and combine members with pending invitations
  const allMembers = useMemo(() => {
    const members = (teamMembersData || []).map(transformTeamMember);

    // Add pending invitations as "pending" members
    const pendingMembers: DisplayTeamMember[] = (invitationsData || []).map(inv => ({
      id: inv.id,
      name: inv.email.split('@')[0],
      email: inv.email,
      role: inv.role.toLowerCase(),
      status: 'pending' as const,
      joinedAt: new Date(inv.createdAt),
    }));

    return [...members, ...pendingMembers];
  }, [teamMembersData, invitationsData]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allMembers, searchQuery, roleFilter]);

  // Update member role
  const updateRole = async (memberId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: memberId, request: { role: newRole } });
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  // Remove member
  const removeMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  // Send invite
  const sendInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteDialogOpen(false);
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  // Resend invite
  const resendInvite = async (invitationId: string, email: string) => {
    try {
      await resendInvitationMutation.mutateAsync(invitationId);
      toast.success(`Invitation resent to ${email}`);
    } catch {
      toast.error('Failed to resend invitation');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("p-12", className)}>
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold">Failed to load team members</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team and their permissions
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-purple-700" onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="size-4" />
          Invite Member
        </Button>
        <Modal open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Invite Team Member</ModalTitle>
              <ModalDescription>
                Send an invitation to join your team
              </ModalDescription>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendInvite} className="gap-2 bg-primary hover:bg-purple-700">
                <Mail className="size-4" />
                Send Invite
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allMembers.length}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {allMembers.filter(m => m.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {allMembers.filter(m => m.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50 text-info">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {allMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
              </p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Members List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Active</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const roleConfig = ROLE_CONFIG[member.role];
                const statusConfig = STATUS_CONFIG[member.status];

                return (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className={cn("gap-1", roleConfig.color)}>
                        {roleConfig.icon}
                        {roleConfig.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className={cn("flex items-center gap-1 text-sm", statusConfig.color)}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {member.lastActive
                        ? formatDistanceToNow(member.lastActive, { addSuffix: true })
                        : 'Never'
                      }
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.status === 'pending' && (
                            <DropdownMenuItem onClick={() => resendInvite(member.id, member.email)}>
                              <Mail className="size-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          {member.role !== 'owner' && (
                            <>
                              <DropdownMenuItem onClick={() => updateRole(member.id, 'admin')}>
                                <Shield className="size-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRole(member.id, 'member')}>
                                <Users className="size-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRole(member.id, 'viewer')}>
                                <UserCog className="size-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => removeMember(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No members found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
