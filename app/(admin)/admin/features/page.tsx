'use client';

/**
 * Admin Features Registry Page
 * Manage feature flags and access controls
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminFetch } from '@/services/api/admin.service';
import { PageHeader, FilterBar, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatCard } from '@/components/admin/blocks/StatCard';

// Matches backend AdminFeatureDto (camelCase from C# PascalCase)
interface Feature {
  id: string;
  featureKey: string;
  displayName: string;
  description: string | null;
  category: string;
  isActive: boolean;
  enabledInPlans: string[];
  createdAt: string;
  updatedAt: string | null;
}


const CATEGORIES = ['All', 'Channels', 'AI', 'Leads', 'Automation', 'Integrations', 'Branding', 'System'];

export default function AdminFeaturesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [, setEditingFeature] = useState<Feature | null>(null);
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newFeature, setNewFeature] = useState({
    featureKey: '',
    displayName: '',
    description: '',
    category: 'Channels',
    isActive: true,
  });
  const queryClient = useQueryClient();

  // Fetch features
  const { data: features = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      return adminFetch<Feature[]>('/api/v1/admin/features');
    },
  });

  // Create feature mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newFeature) => {
      return adminFetch<Feature>('/api/v1/admin/features', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('Feature created');
      setCreateDialogOpen(false);
      setNewFeature({ featureKey: '', displayName: '', description: '', category: 'Channels', isActive: true });
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
    onError: () => {
      toast.error('Failed to create feature');
    },
  });

  // Toggle feature mutation (uses PUT since backend has no PATCH)
  const toggleMutation = useMutation({
    mutationFn: async ({ feature, isActive }: { feature: Feature; isActive: boolean }) => {
      return adminFetch<Feature>(`/api/v1/admin/features/${feature.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          featureKey: feature.featureKey,
          displayName: feature.displayName,
          description: feature.description || '',
          category: feature.category,
          isActive,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
  });

  // Delete feature mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminFetch<void>(`/api/v1/admin/features/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Feature deleted');
      setFeatureToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
    onError: () => {
      toast.error('Failed to delete feature');
    },
  });

  const handleDeleteFeature = (feature: Feature) => {
    setFeatureToDelete(feature);
  };

  const confirmDeleteFeature = () => {
    if (featureToDelete) {
      deleteMutation.mutate(featureToDelete.id);
    }
  };

  const handleCreate = () => {
    if (!newFeature.featureKey || !newFeature.displayName) {
      toast.error('Please fill in key and name');
      return;
    }
    createMutation.mutate(newFeature);
  };

  // Filter features (with null safety)
  const filteredFeatures = features.filter((feature: Feature) => {
    const name = feature.displayName || '';
    const key = feature.featureKey || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || feature.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeatures.length / pageSize);
  const paginatedFeatures = filteredFeatures.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const enabledFeatures = features.filter((f: Feature) => f.isActive);
  const categories = new Set(features.map((f: Feature) => f.category).filter(Boolean));

  // Define table columns
  const columns: DataTableColumn<Feature>[] = [
    {
      key: 'feature', label: 'Feature', sortable: true,
      render: (f) => (
        <div>
          <p className="font-medium text-admin-foreground">{f.displayName}</p>
          <p className="text-xs text-admin-muted-foreground">{f.description}</p>
        </div>
      ),
    },
    {
      key: 'key', label: 'Key',
      render: (f) => <code className="px-2 py-1 bg-admin-muted text-admin-foreground rounded text-xs">{f.featureKey}</code>,
    },
    {
      key: 'category', label: 'Category', hideOnMobile: true,
      render: (f) => <Badge variant="outline" className="border-admin-border text-admin-foreground">{f.category}</Badge>,
    },
    {
      key: 'plans', label: 'Plans', hideOnMobile: true,
      render: (f) => (
        <div className="flex flex-wrap gap-1">
          {(f.enabledInPlans || []).length > 0 ? f.enabledInPlans.map((plan) => (
            <Badge key={plan} className={cn("capitalize text-xs", plan === 'freeflow' && "bg-gray-500", plan === 'smartflow' && "bg-blue-500", plan === 'ultraflow' && "bg-purple-500", plan === 'enterprise' && "bg-amber-500")}>
              {plan}
            </Badge>
          )) : <span className="text-admin-muted-foreground text-xs">None</span>}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status', align: 'center' as const,
      render: (f) => (
        <Switch
          checked={f.isActive}
          onCheckedChange={(checked) => toggleMutation.mutate({ feature: f, isActive: checked })}
        />
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: (f) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditingFeature(f)}><Edit className="size-4 text-admin-muted-foreground" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteFeature(f)}><Trash2 className="size-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6" data-admin-theme="dark">
      <PageHeader
        title="Features Registry"
        description="Manage feature flags and access controls"
        onRefresh={() => refetch()}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#FF6900] hover:bg-orange-600 gap-2">
            <Plus className="size-4" />
            Add Feature
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Features" value={features.length} iconColor="text-[#FF6900]" loading={isLoading} />
        <StatCard title="Enabled" value={enabledFeatures.length} iconColor="text-green-400" loading={isLoading} />
        <StatCard title="Categories" value={categories.size} iconColor="text-purple-400" loading={isLoading} />
        <StatCard title="Disabled" value={features.length - enabledFeatures.length} iconColor="text-blue-400" loading={isLoading} />
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search features..."
        filters={[
          {
            key: 'category', label: 'Category', value: categoryFilter,
            onChange: handleCategoryChange,
            options: CATEGORIES.map((cat) => ({ value: cat, label: cat })),
          },
        ]}
      />

      {/* Features Table */}
      <DataTable
        columns={columns}
        data={paginatedFeatures}
        loading={isLoading}
        emptyMessage="No features found"
        emptyDescription="Create your first feature flag to get started"
        getRowId={(row) => row.id}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredFeatures.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Create Feature Dialog */}
      <AdminModal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>Add New Feature</AdminModalTitle>
            <AdminModalDescription>
              Create a new feature flag for the platform.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Feature Key *</Label>
                <Input
                  placeholder="e.g., ai_email"
                  value={newFeature.featureKey}
                  onChange={(e) => setNewFeature({ ...newFeature, featureKey: e.target.value })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Display Name *</Label>
                <Input
                  placeholder="e.g., AI Email"
                  value={newFeature.displayName}
                  onChange={(e) => setNewFeature({ ...newFeature, displayName: e.target.value })}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
                />
              </div>
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Brief description of the feature"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
              />
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Category</Label>
              <Select
                value={newFeature.category}
                onValueChange={(value) => setNewFeature({ ...newFeature, category: value })}
              >
                <SelectTrigger className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newFeature.isActive}
                onCheckedChange={(checked) => setNewFeature({ ...newFeature, isActive: checked })}
              />
              <Label className="text-admin-foreground text-sm font-medium">Active</Label>
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-[#FF6900] hover:bg-orange-600 text-white">
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Feature
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminModal open={!!featureToDelete} onOpenChange={(open) => !open && setFeatureToDelete(null)}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>Delete Feature</AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to delete the feature &quot;{featureToDelete?.displayName}&quot;? This action cannot be undone.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setFeatureToDelete(null)}
              disabled={deleteMutation.isPending}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteFeature}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
