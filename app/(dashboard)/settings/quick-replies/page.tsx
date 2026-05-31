'use client';

/**
 * Quick Replies Management Page
 * Create and manage canned responses for conversations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Zap,
  Tag,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

interface QuickReply {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category: string;
  usageCount: number;
  createdAt: string;
}


const CATEGORIES = ['General', 'Sales', 'Support', 'Billing', 'Technical'];

export default function QuickRepliesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [, setEditingReply] = useState<QuickReply | null>(null);
  const [newReply, setNewReply] = useState({ shortcut: '', title: '', content: '', category: 'General' });
  const queryClient = useQueryClient();

  // Fetch quick replies
  const { data: replies = [], isLoading, refetch } = useQuery({
    queryKey: ['quick-replies'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/quick-replies');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newReply) => {
      const response = await apiClient.post('/api/v1/quick-replies', data);
      return response.data;
    },
    onSuccess: () => {
      setCreateDialogOpen(false);
      setNewReply({ shortcut: '', title: '', content: '', category: 'General' });
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
      toast.success('Quick reply created', {
        description: `Use /${newReply.shortcut} to insert it.`,
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setCreateDialogOpen(false);
      toast.error('Failed to create quick reply', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/quick-replies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
      toast.success('Quick reply deleted', {
        description: 'The shortcut is no longer available.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to delete quick reply', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const handleCreate = () => {
    if (!newReply.shortcut || !newReply.title || !newReply.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!newReply.shortcut.startsWith('/')) {
      setNewReply({ ...newReply, shortcut: '/' + newReply.shortcut });
    }
    createMutation.mutate(newReply);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Filter replies
  const filteredReplies = replies.filter((reply: QuickReply) => {
    const matchesSearch = reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reply.shortcut.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || reply.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalUsage = replies.reduce((sum: number, r: QuickReply) => sum + r.usageCount, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="size-7 text-purple-600" />
            Quick Replies
          </h1>
          <p className="text-gray-500 mt-1">
            Create canned responses to speed up your conversations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Create Reply
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{replies.length}</p>
                <p className="text-xs text-gray-500">Total Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Zap className="size-5 text-green-600" />
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
              <div className="p-2 rounded-lg bg-blue-100">
                <Tag className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(replies.map((r: QuickReply) => r.category)).size}</p>
                <p className="text-xs text-gray-500">Categories</p>
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
                placeholder="Search replies..."
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

      {/* Replies List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Quick Replies</CardTitle>
          <CardDescription>Type the shortcut in any conversation to insert the reply</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredReplies.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No quick replies found</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Your First Reply
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReplies.map((reply: QuickReply) => (
                <div
                  key={reply.id}
                  className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-mono">
                          {reply.shortcut}
                        </code>
                        <h4 className="font-semibold text-gray-900">{reply.title}</h4>
                        <Badge variant="outline">{reply.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{reply.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Used {reply.usageCount} times
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(reply.content)}>
                          <Copy className="size-4 mr-2" />
                          Copy Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingReply(reply)}>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate(reply.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Modal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Create Quick Reply</ModalTitle>
            <ModalDescription>
              Create a canned response you can quickly insert in conversations.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shortcut">Shortcut *</Label>
                <Input
                  id="shortcut"
                  placeholder="/hello"
                  value={newReply.shortcut}
                  onChange={(e) => setNewReply({ ...newReply, shortcut: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Start with /</p>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Greeting"
                  value={newReply.title}
                  onChange={(e) => setNewReply({ ...newReply, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newReply.category}
                onValueChange={(value) => setNewReply({ ...newReply, category: value })}
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
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Type your message..."
                rows={4}
                value={newReply.content}
                onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
