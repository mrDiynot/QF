'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Building2, Mail } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  isValid: boolean;
  invitedByName: string;
  createdAt: string;
}

interface AcceptInvitationResponse {
  userId: string;
  businessId: string;
  businessName: string;
  role: string;
}

export function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Fetch invitation details
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async (): Promise<InvitationDetails> => {
      const response = await apiClient.get(`/invitations/${token}`);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<AcceptInvitationResponse>('/invitations/accept', {
        token,
        firstName,
        lastName,
        password,
      });
      return response.data;
    },
    onSuccess: (_data) => {
      setAcceptSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Account created successfully. Please log in.');
      }, 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    acceptMutation.mutate();
  };

  const passwordsMatch = password === confirmPassword || confirmPassword === '';
  const isFormValid = firstName && lastName && password.length >= 8 && passwordsMatch;

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>
          Invalid invitation link. Please check the link in your email and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="size-8 animate-spin text-brand-purple" />
        <p className="text-text-secondary">Loading invitation details...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            This invitation is invalid or has expired. Please contact the person who invited you.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href="/login" className="text-brand-purple hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (acceptSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-success" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-navy">Welcome to the Team!</h2>
        <p className="text-text-secondary">
          Your account has been created. Redirecting to login...
        </p>
        <Loader2 className="size-6 animate-spin text-brand-purple mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invitation Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-navy">
          Accept Your Invitation
        </h1>
        <p className="text-text-secondary">
          <span className="font-medium text-text-navy">{invitation.invitedByName}</span> has
          invited you to join their team
        </p>
      </div>

      {/* Invitation Details Card */}
      <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{invitation.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Role:</span>
          <Badge variant="secondary">{invitation.role}</Badge>
        </div>
      </div>

      {/* Accept Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          {!passwordsMatch && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        {acceptMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {(acceptMutation.error as Error)?.message || 'Failed to accept invitation. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid || acceptMutation.isPending}
        >
          {acceptMutation.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Accept Invitation & Create Account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-purple hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

