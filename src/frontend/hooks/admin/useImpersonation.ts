'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminUserService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';

const IMPERSONATION_KEY = 'impersonation_session';
const ORIGINAL_TOKEN_KEY = 'original_admin_token';

export interface ImpersonationSession {
  userId: string;
  userEmail: string;
  businessId: string;
  businessName: string;
  reason: string;
  startedAt: string;
}

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const { track, trackAdminError } = useAdminAnalytics();

  useEffect(() => {
    const stored = localStorage.getItem(IMPERSONATION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
      setIsImpersonating(true);
    }
  }, []);

  const startImpersonation = useMutation({
    mutationFn: async ({ 
      userId, 
      userEmail, 
      businessId, 
      businessName, 
      reason 
    }: { 
      userId: string; 
      userEmail: string; 
      businessId: string; 
      businessName: string; 
      reason: string;
    }) => {
      // Store original admin token
      const adminToken = localStorage.getItem('admin_access_token');
      if (adminToken) {
        localStorage.setItem(ORIGINAL_TOKEN_KEY, adminToken);
      }

      // Get impersonation token
      const result = await adminUserService.startImpersonation({ userId, reason });

      // Store impersonation session
      const impersonationSession: ImpersonationSession = {
        userId,
        userEmail,
        businessId,
        businessName,
        reason,
        startedAt: new Date().toISOString(),
      };
      localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(impersonationSession));

      // Set the impersonation token for tenant app
      localStorage.setItem('access_token', result.token);

      track(AdminEvents.ADMIN_USER_IMPERSONATION_STARTED, {
        user_id: userId,
        business_id: businessId,
        reason,
      });

      return impersonationSession;
    },
    onSuccess: (session) => {
      setSession(session);
      setIsImpersonating(true);
      toast.success(`Now impersonating ${session.userEmail}`);
    },
    onError: (error, variables) => {
      trackAdminError(error instanceof Error ? error : new Error('Impersonation failed'), {
        action: 'start_impersonation',
        user_id: variables.userId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to start impersonation');
    },
  });

  const endImpersonation = useCallback(async () => {
    try {
      await adminUserService.endImpersonation();
      
      // Restore original admin token
      const originalToken = localStorage.getItem(ORIGINAL_TOKEN_KEY);
      if (originalToken) {
        localStorage.setItem('admin_access_token', originalToken);
        localStorage.removeItem(ORIGINAL_TOKEN_KEY);
      }

      // Clear impersonation data
      localStorage.removeItem(IMPERSONATION_KEY);
      localStorage.removeItem('access_token');

      track(AdminEvents.ADMIN_USER_IMPERSONATION_ENDED, {
        user_id: session?.userId,
        business_id: session?.businessId,
      });

      setSession(null);
      setIsImpersonating(false);
      toast.success('Impersonation ended');

      // Redirect back to admin portal
      window.location.href = '/admin';
    } catch (error) {
      trackAdminError(error instanceof Error ? error : new Error('End impersonation failed'), {
        action: 'end_impersonation',
      });
      toast.error('Failed to end impersonation');
    }
  }, [session, track, trackAdminError]);

  return {
    isImpersonating,
    session,
    startImpersonation,
    endImpersonation,
  };
}

