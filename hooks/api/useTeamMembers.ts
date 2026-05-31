/**
 * React Query hooks for Team Members API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  teamMembersService,
  type TeamMember,
  type Invitation,
  type InviteTeamMemberRequest,
  type UpdateTeamMemberRoleRequest,
} from '@/services/api/team-members.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const teamMembersKeys = {
  all: ['team-members'] as const,
  list: () => [...teamMembersKeys.all, 'list'] as const,
  detail: (id: string) => [...teamMembersKeys.all, 'detail', id] as const,
  invitations: () => [...teamMembersKeys.all, 'invitations'] as const,
};

/**
 * Fetch all team members
 */
export function useTeamMembers() {
  return useQuery({
    queryKey: teamMembersKeys.list(),
    queryFn: () => teamMembersService.getAllMembers(),
    ...queryConfig.standard,
  });
}

/**
 * Fetch a specific team member by ID
 */
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamMembersKeys.detail(id),
    queryFn: () => teamMembersService.getMemberById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Fetch pending invitations
 */
export function usePendingInvitations() {
  return useQuery({
    queryKey: teamMembersKeys.invitations(),
    queryFn: () => teamMembersService.getPendingInvitations(),
    ...queryConfig.realtime,
  });
}

/**
 * Invite a new team member
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InviteTeamMemberRequest) =>
      teamMembersService.inviteMember(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, teamMembersKeys.all);
    },
  });
}

/**
 * Update team member role
 */
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateTeamMemberRoleRequest }) =>
      teamMembersService.updateMemberRole(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, teamMembersKeys.all);
    },
  });
}

/**
 * Remove a team member
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamMembersService.removeMember(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, teamMembersKeys.all);
    },
  });
}

/**
 * Resend an invitation
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      teamMembersService.resendInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMembersKeys.invitations(), refetchType: 'all' });
    },
  });
}

/**
 * Cancel an invitation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      teamMembersService.cancelInvitation(invitationId),
    onSuccess: () => {
      invalidateListQueries(queryClient, teamMembersKeys.all);
    },
  });
}

// Type exports
export type { TeamMember, Invitation };
