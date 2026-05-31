'use client';

/**
 * API Keys Management Page
 * Manage API keys for developer access
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  Key,
  Plus,
  Copy,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}


const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" /> },
  revoked: { label: 'Revoked', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="size-3" /> },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: <Clock className="size-3" /> },
};

export default function ApiKeysPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', permissions: 'read', expiresIn: 'never' });
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/api-keys');
      return response.data;
    },
  });

  // Create key mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newKey) => {
      const response = await apiClient.post('/api/v1/api-keys', data);
      return response.data;
    },
    onSuccess: (data) => {
      setNewKeyValue(data.key || 'qf_live_' + Math.random().toString(36).substring(2, 15));
      setCreateDialogOpen(false);
      setNewKeyDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key created', {
        description: 'Make sure to copy your key now. You won\'t be able to see it again.',
        duration: 8000,
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setCreateDialogOpen(false);
      toast.error('Failed to create API key', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Revoke key mutation
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked', {
        description: 'The key is no longer valid for API access.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to revoke API key', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const handleCreateKey = () => {
    if (!newKey.name) {
      toast.error('Please enter a key name');
      return;
    }
    createMutation.mutate(newKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const activeKeys = keys.filter((k: ApiKey) => k.status === 'active');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="size-7 text-purple-600" />
            API Keys
          </h1>
          <p className="text-gray-500 mt-1">
            Manage API keys for integrating with external systems
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Create API Key
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Shield className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Security Best Practices</h4>
              <p className="text-sm text-amber-700 mt-1">
                Keep your API keys secure. Never share them publicly or commit them to version control.
                Use environment variables to store keys in your applications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Key className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{keys.length}</p>
                <p className="text-xs text-gray-500">Total Keys</p>
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
                <p className="text-2xl font-bold">{activeKeys.length}</p>
                <p className="text-xs text-gray-500">Active Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <RefreshCw className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {keys.filter((k: ApiKey) => k.lastUsedAt).length}
                </p>
                <p className="text-xs text-gray-500">Used Recently</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>Manage and monitor your API keys</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No API keys yet</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key: ApiKey) => {
                const statusConfig = STATUS_CONFIG[key.status];
                return (
                  <div
                    key={key.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      key.status === 'revoked' && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Key className="size-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{key.name}</h4>
                          <Badge className={cn('gap-1', statusConfig.color)}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-mono mt-1">{key.keyPrefix}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}</span>
                          {key.lastUsedAt && (
                            <span>Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                      {key.status === 'active' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(key.keyPrefix)}>
                              <Copy className="size-4 mr-2" />
                              Copy Key Prefix
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => revokeMutation.mutate(key.id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Revoke Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Modal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Create API Key</ModalTitle>
            <ModalDescription>
              Generate a new API key for accessing the QualiFlow AI API.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production API Key"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="permissions">Permissions</Label>
              <Select
                value={newKey.permissions}
                onValueChange={(value) => setNewKey({ ...newKey, permissions: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="read,write">Read & Write</SelectItem>
                  <SelectItem value="read,write,delete">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expires">Expiration</Label>
              <Select
                value={newKey.expiresIn}
                onValueChange={(value) => setNewKey({ ...newKey, expiresIn: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Key Display Dialog */}
      <Modal open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>API Key Created</ModalTitle>
            <ModalDescription>
              Copy your API key now. You won&apos;t be able to see it again!
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono break-all">
                  {showKey ? newKeyValue : '•'.repeat(40)}
                </code>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(newKeyValue)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setNewKeyDialogOpen(false)}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
