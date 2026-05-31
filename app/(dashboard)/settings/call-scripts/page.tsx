'use client';

/**
 * Call Scripts Page
 * Create and manage scripts for voice calls
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Phone,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

interface CallScript {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}


const CATEGORIES = ['Sales', 'Support', 'Appointment', 'Survey', 'Other'];

export default function CallScriptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [, setEditingScript] = useState<CallScript | null>(null);
  const [newScript, setNewScript] = useState({ 
    name: '', 
    description: '', 
    category: 'Sales', 
    content: '',
    isDefault: false 
  });
  const queryClient = useQueryClient();

  // Fetch scripts
  const { data: scripts = [], isLoading, refetch } = useQuery({
    queryKey: ['call-scripts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/call-scripts');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newScript) => {
      const response = await apiClient.post('/api/v1/call-scripts', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Call script created');
      setCreateDialogOpen(false);
      setNewScript({ name: '', description: '', category: 'Sales', content: '', isDefault: false });
      queryClient.invalidateQueries({ queryKey: ['call-scripts'] });
    },
    onError: () => {
      toast.error('Failed to create call script');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/call-scripts/${id}`);
    },
    onSuccess: () => {
      toast.success('Call script deleted');
      queryClient.invalidateQueries({ queryKey: ['call-scripts'] });
    },
    onError: () => {
      toast.error('Failed to delete call script');
    },
  });

  const handleCreate = () => {
    if (!newScript.name || !newScript.content) {
      toast.error('Please fill in name and content');
      return;
    }
    createMutation.mutate(newScript);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Script copied to clipboard');
  };

  // Filter scripts
  const filteredScripts = scripts.filter((script: CallScript) => {
    const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || script.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalUsage = scripts.reduce((sum: number, s: CallScript) => sum + s.usageCount, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-7 text-purple-600" />
            Call Scripts
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage scripts for voice calls and AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Create Script
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scripts.length}</p>
                <p className="text-xs text-gray-500">Total Scripts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scripts.filter((s: CallScript) => s.isDefault).length}</p>
                <p className="text-xs text-gray-500">Default Scripts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Phone className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsage}</p>
                <p className="text-xs text-gray-500">Times Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scripts.filter((s: CallScript) => s.lastUsedAt).length}</p>
                <p className="text-xs text-gray-500">Recently Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scripts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Call Scripts</CardTitle>
          <CardDescription>Scripts can be used by AI voice agents and human callers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredScripts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No call scripts found</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Your First Script
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map((script: CallScript) => (
                <Card key={script.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{script.name}</h4>
                          <Badge variant="outline">{script.category}</Badge>
                          {script.isDefault && (
                            <Badge className="bg-purple-100 text-purple-700">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{script.description}</p>
                        <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 font-sans">
                          {script.content}
                        </pre>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>Used {script.usageCount} times</span>
                          {script.lastUsedAt && (
                            <span>Last used {formatDistanceToNow(new Date(script.lastUsedAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(script.content)}>
                            <Copy className="size-4 mr-2" />
                            Copy Script
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingScript(script)}>
                            <Edit className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(script.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Modal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Create Call Script</ModalTitle>
            <ModalDescription>
              Create a new script for voice calls and AI agents.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Script Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Initial Sales Call"
                  value={newScript.name}
                  onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newScript.category}
                  onValueChange={(value) => setNewScript({ ...newScript, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of when to use this script"
                value={newScript.description}
                onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Script Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your call script here. Use [Placeholders] for dynamic content..."
                rows={10}
                value={newScript.content}
                onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="default"
                  checked={newScript.isDefault}
                  onCheckedChange={(checked) => setNewScript({ ...newScript, isDefault: checked })}
                />
                <Label htmlFor="default">Set as default script for this category</Label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Script
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
