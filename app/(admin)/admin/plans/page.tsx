'use client';

/**
 * Admin Plans Manager Page
 * Manage subscription plans, features, and limits
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/ui';
import { StatCard } from '@/components/admin/blocks/StatCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminFetch } from '@/services/api/admin.service';

// Matches backend AdminPlanDto (camelCase from C# PascalCase)
interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  priceMonthly: number;
  priceQuarterly: number | null;
  priceYearly: number | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  featureKeys: string[];
  limits: Record<string, string>;
}


export default function AdminPlansPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<{
    priceMonthly: number;
    description: string;
    isActive: boolean;
    isPublic: boolean;
  } | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    displayName: '',
    description: '',
    priceMonthly: 0,
    isActive: true,
    isPublic: true,
    sortOrder: 0,
  });
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  // Fetch plans (pass includeInactive to see deactivated plans)
  const { data: plans = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-plans', showInactive],
    queryFn: async () => {
      const params = showInactive ? '?includeInactive=true' : '';
      return adminFetch<Plan[]>(`/api/v1/admin/plans${params}`);
    },
  });

  // Open edit dialog with form state
  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditForm({
      priceMonthly: plan.priceMonthly,
      description: plan.description || '',
      isActive: plan.isActive,
      isPublic: plan.isPublic,
    });
    setEditPlanDialogOpen(true);
  };

  // Update plan mutation (full PUT)
  const updatePlanMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      return adminFetch<Plan>(`/api/v1/admin/plans/${plan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: plan.name,
          displayName: plan.displayName,
          description: editForm?.description ?? plan.description,
          priceMonthly: editForm?.priceMonthly ?? plan.priceMonthly,
          priceQuarterly: plan.priceQuarterly,
          priceYearly: plan.priceYearly,
          isActive: editForm?.isActive ?? plan.isActive,
          isPublic: editForm?.isPublic ?? plan.isPublic,
          sortOrder: plan.sortOrder,
        }),
      });
    },
    onSuccess: () => {
      toast.success('Plan updated');
      setEditPlanDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: () => {
      toast.error('Failed to update plan');
    },
  });

  // Toggle plan active status (PATCH)
  const togglePlanMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return adminFetch<Plan>(`/api/v1/admin/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: typeof newPlan) => {
      return adminFetch<Plan>('/api/v1/admin/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('Plan created');
      setCreatePlanDialogOpen(false);
      setNewPlan({ name: '', displayName: '', description: '', priceMonthly: 0, isActive: true, isPublic: true, sortOrder: 0 });
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: () => {
      toast.error('Failed to create plan');
    },
  });

  // handleEditPlan now uses openEditDialog which initializes form state
  const handleEditPlan = (plan: Plan) => openEditDialog(plan);

  const activePlans = plans.filter((p: Plan) => p.isActive);
  return (
    <div className="p-8 space-y-6" data-admin-theme="dark">
      <PageHeader
        title="Subscription Plans"
        description="Manage pricing plans, features, and limits"
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={showInactive} onCheckedChange={setShowInactive} />
              <Label className="text-sm text-admin-muted-foreground whitespace-nowrap">Show Inactive</Label>
            </div>
            <Button className="bg-[#FF6900] hover:bg-orange-600 gap-2" onClick={() => setCreatePlanDialogOpen(true)}>
              <Plus className="size-4" />
              Create Plan
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Plans" value={plans.length} icon={CreditCard} iconColor="text-[#FF6900]" iconBgColor="bg-[#FF6900]/20" loading={isLoading} />
        <StatCard title="Active Plans" value={activePlans.length} icon={CheckCircle} iconColor="text-green-500" iconBgColor="bg-green-500/20" loading={isLoading} />
        <StatCard title="Subscribers" value="--" icon={Users} iconColor="text-blue-500" iconBgColor="bg-blue-500/20" loading={isLoading} />
        <StatCard title="Monthly Revenue" value="--" icon={DollarSign} iconColor="text-purple-500" iconBgColor="bg-purple-500/20" loading={isLoading} />
      </div>

      {/* Plans Tabs */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-admin-muted">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features Matrix</TabsTrigger>
              <TabsTrigger value="limits">Limits Matrix</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-admin-muted" />
              ))}
            </div>
          ) : (
            <Tabs value={activeTab}>
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((plan: Plan) => (
                    <Card key={plan.id} className={cn(
                      "relative bg-admin-background border-admin-border",
                      plan.isPublic && plan.isActive && "ring-2 ring-[#FF6900]",
                      !plan.isActive && "opacity-60"
                    )}>
                      {!plan.isActive && (
                        <Badge variant="destructive" className="absolute -top-2 right-2 z-10">
                          Inactive
                        </Badge>
                      )}
                      {plan.isPublic && plan.isActive && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF6900]">
                          Most Popular
                        </Badge>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {plan.name === 'enterprise' ? (
                              <Crown className="size-5 text-amber-500" />
                            ) : (
                              <Zap className="size-5 text-[#FF6900]" />
                            )}
                            <h3 className="font-bold text-admin-foreground">{plan.displayName}</h3>
                          </div>
                          <Switch
                            checked={plan.isActive}
                            onCheckedChange={(checked) => togglePlanMutation.mutate({ id: plan.id, isActive: checked })}
                          />
                        </div>
                        
                        <p className="text-sm text-admin-muted-foreground mb-4">{plan.description}</p>
                        
                        <div className="mb-4">
                          {plan.priceMonthly > 0 ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-admin-foreground">${plan.priceMonthly}</span>
                              <span className="text-admin-muted-foreground">/mo</span>
                            </div>
                          ) : plan.name === 'enterprise' ? (
                            <span className="text-xl font-bold text-admin-foreground">Custom Pricing</span>
                          ) : (
                            <span className="text-xl font-bold text-green-500">Free</span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          {plan.featureKeys.slice(0, 4).map((featureKey) => (
                            <div key={featureKey} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="size-4 text-green-500" />
                              <span className="text-admin-foreground">
                                {featureKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-admin-border"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="size-4 mr-2" />
                          Edit Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Features Matrix Tab */}
              <TabsContent value="features">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-admin-border">
                        <TableHead className="text-admin-muted-foreground">Feature</TableHead>
                        {plans.map((plan: Plan) => (
                          <TableHead key={plan.id} className="text-center text-admin-muted-foreground">
                            {plan.displayName}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Collect all unique feature keys across all plans */}
                      {(Array.from(new Set(plans.flatMap((p: Plan) => p.featureKeys))) as string[]).map((featureKey) => (
                        <TableRow key={featureKey} className="border-admin-border">
                          <TableCell className="text-admin-foreground font-medium">
                            {featureKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </TableCell>
                          {plans.map((plan: Plan) => (
                            <TableCell key={plan.id} className="text-center">
                              {plan.featureKeys.includes(featureKey) ? (
                                <CheckCircle className="size-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="size-5 text-gray-500 mx-auto" />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Limits Matrix Tab */}
              <TabsContent value="limits">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-admin-border">
                        <TableHead className="text-admin-muted-foreground">Limit</TableHead>
                        {plans.map((plan: Plan) => (
                          <TableHead key={plan.id} className="text-center text-admin-muted-foreground">
                            {plan.displayName}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Collect all unique limit keys across all plans */}
                      {(Array.from(new Set(plans.flatMap((p: Plan) => Object.keys(p.limits || {})))) as string[]).map((limitKey) => (
                        <TableRow key={limitKey} className="border-admin-border">
                          <TableCell className="text-admin-foreground font-medium">
                            {limitKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </TableCell>
                          {plans.map((plan: Plan) => {
                            const value = plan.limits?.[limitKey];
                            return (
                              <TableCell key={plan.id} className="text-center text-admin-foreground">
                                {value === 'unlimited' || value === '-1' ? (
                                  <Badge className="bg-purple-500">Unlimited</Badge>
                                ) : (
                                  value || '0'
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <AdminModal open={editPlanDialogOpen} onOpenChange={setEditPlanDialogOpen}>
        <AdminModalContent size="lg">
          <AdminModalHeader>
            <AdminModalTitle>Edit Plan: {selectedPlan?.displayName}</AdminModalTitle>
            <AdminModalDescription>
              Update plan details, pricing, and features.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody>
            {selectedPlan && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-admin-foreground text-sm font-medium">Display Name</Label>
                    <Input
                      value={selectedPlan.displayName}
                      className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-admin-foreground text-sm font-medium">Monthly Price ($)</Label>
                    <Input
                      type="number"
                      value={editForm?.priceMonthly ?? selectedPlan.priceMonthly}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, priceMonthly: Number(e.target.value) } : null)}
                      className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Description</Label>
                  <Input
                    value={editForm?.description ?? selectedPlan.description ?? ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editForm?.isActive ?? selectedPlan.isActive}
                      onCheckedChange={(checked) => setEditForm(prev => prev ? { ...prev, isActive: checked } : null)}
                    />
                    <Label className="text-admin-foreground">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editForm?.isPublic ?? selectedPlan.isPublic}
                      onCheckedChange={(checked) => setEditForm(prev => prev ? { ...prev, isPublic: checked } : null)}
                    />
                    <Label className="text-admin-foreground">Public</Label>
                  </div>
                </div>
              </div>
            )}
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setEditPlanDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
              onClick={() => selectedPlan && updatePlanMutation.mutate(selectedPlan)}
              disabled={updatePlanMutation.isPending}
            >
              {updatePlanMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Create Plan Dialog */}
      <AdminModal open={createPlanDialogOpen} onOpenChange={setCreatePlanDialogOpen}>
        <AdminModalContent>
          <AdminModalHeader>
            <AdminModalTitle>Create New Plan</AdminModalTitle>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Plan Name *</Label>
                <Input
                  placeholder="e.g., smartflow"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Display Name *</Label>
                <Input
                  placeholder="e.g., SmartFlow"
                  value={newPlan.displayName}
                  onChange={(e) => setNewPlan({ ...newPlan, displayName: e.target.value })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Description</Label>
              <Input
                placeholder="Brief description of this plan"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Monthly Price ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPlan.priceMonthly}
                  onChange={(e) => setNewPlan({ ...newPlan, priceMonthly: Number(e.target.value) })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Sort Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPlan.sortOrder}
                  onChange={(e) => setNewPlan({ ...newPlan, sortOrder: Number(e.target.value) })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPlan.isActive}
                  onCheckedChange={(checked) => setNewPlan({ ...newPlan, isActive: checked })}
                />
                <Label className="text-admin-foreground">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPlan.isPublic}
                  onCheckedChange={(checked) => setNewPlan({ ...newPlan, isPublic: checked })}
                />
                <Label className="text-admin-foreground">Public</Label>
              </div>
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setCreatePlanDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
              onClick={() => {
                if (!newPlan.name || !newPlan.displayName) {
                  toast.error('Please fill in plan name and display name');
                  return;
                }
                createPlanMutation.mutate(newPlan);
              }}
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
