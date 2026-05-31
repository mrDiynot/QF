'use client';

/**
 * Business Profile Settings Page
 * Allows users to update business information including industry and primary goal
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Target, Save, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/api/business.service';
import { onboardingService } from '@/services/api/onboarding.service';
import Link from 'next/link';

const INDUSTRIES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'saas', label: 'SaaS / Technology' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const GOALS = [
  { value: 'qualify_leads', label: 'Qualify leads faster' },
  { value: 'automate_followups', label: 'Automate follow-ups' },
  { value: 'capture_channels', label: 'Capture leads from multiple channels' },
  { value: 'book_meetings', label: 'Book more meetings' },
  { value: 'reduce_noshows', label: 'Reduce no-shows' },
  { value: 'proposals', label: 'Send proposals' },
  { value: 'crm_sync', label: 'Sync with my CRM' },
];

function BusinessProfileContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    primaryGoal: '',
    timezone: '',
  });

  // Fetch business settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['business', 'settings'],
    queryFn: businessService.getBusinessSettings,
  });

  // Fetch onboarding progress for primary goal
  const { data: onboardingProgress } = useQuery({
    queryKey: ['onboarding', 'progress'],
    queryFn: onboardingService.getProgress,
  });

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        name: settings.name || '',
        industry: settings.industry || '',
        timezone: settings.timezone || '',
      }));
    }
  }, [settings]);

  // Initialize primary goal from onboarding progress
  useEffect(() => {
    if (onboardingProgress?.mainObjective) {
      setFormData(prev => ({
        ...prev,
        primaryGoal: onboardingProgress.mainObjective || '',
      }));
    }
  }, [onboardingProgress]);

  // Update business settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: businessService.updateBusinessSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      toast.success('Business profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Update onboarding profile mutation (for primary goal)
  const updateGoalMutation = useMutation({
    mutationFn: async (goal: string) => {
      // Use the onboarding business-profile endpoint to update the goal
      return onboardingService.updateBusinessProfile({
        businessName: formData.name,
        industry: formData.industry,
        companySize: settings?.teamSize || 'just_me',
        timezone: formData.timezone || 'UTC',
        mainObjective: goal,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });
      toast.success('Primary goal updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    },
  });

  const handleSave = async () => {
    // Update business settings
    await updateSettingsMutation.mutateAsync({
      name: formData.name,
      industry: formData.industry,
      timezone: formData.timezone,
    });

    // Update primary goal if changed
    if (formData.primaryGoal) {
      await updateGoalMutation.mutateAsync(formData.primaryGoal);
    }
  };

  const isSaving = updateSettingsMutation.isPending || updateGoalMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/settings" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your business information and primary objectives
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Information Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Business Information</h2>
              <p className="text-sm text-muted-foreground">
                Basic details about your business
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Primary Goal Card */}
        <Card className={`p-6 ${section === 'goals' ? 'ring-2 ring-primary' : ''}`} id="goals">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Target className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Primary Goal</h2>
              <p className="text-sm text-muted-foreground">
                Your main objective guides AI recommendations and priorities
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryGoal">What is your primary goal?</Label>
            <Select
              value={formData.primaryGoal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, primaryGoal: value }))}
            >
              <SelectTrigger id="primaryGoal">
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BusinessProfilePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    }>
      <BusinessProfileContent />
    </Suspense>
  );
}

