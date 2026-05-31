'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Link as LinkIcon, Copy, BarChart, ExternalLink, Trash2 } from 'lucide-react';
import { linksService, type TrackedLink, type CreateLinkRequest } from '@/services/api/links.service';
import { toast } from 'sonner';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LinksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLink, setNewLink] = useState<CreateLinkRequest>({ name: '', destinationUrl: '' });
  const queryClient = useQueryClient();

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: () => linksService.getLinks(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['links', 'stats'],
    queryFn: () => linksService.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateLinkRequest) => linksService.createLink(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setShowCreateDialog(false);
      setNewLink({ name: '', destinationUrl: '' });
      toast.success('Link created successfully');
    },
    onError: () => toast.error('Failed to create link'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linksService.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link deleted');
    },
    onError: () => toast.error('Failed to delete link'),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const isLoading = linksLoading || statsLoading;

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Smart Links</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create trackable short links and monitor performance
            </p>
          </div>
          <Button 
            className="gap-2 rounded-[10px] gradient-primary text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-4" />
            Create Link
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))
          ) : (
            [
              { label: 'Total Links', value: stats?.totalLinks ?? 0 },
              { label: 'Total Clicks', value: stats?.totalClicks?.toLocaleString() ?? 0 },
              { label: 'Conversions', value: stats?.totalConversions ?? 0 },
              { label: 'Avg Conv. Rate', value: `${stats?.averageConversionRate ?? 0}%` },
            ].map((stat, idx) => (
              <Card key={idx} className="p-6">
                <p className="small-text text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-3xl font-normal text-text-navy">{stat.value}</p>
              </Card>
            ))
          )}
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-xl" />
            ))
          ) : links && links.length > 0 ? (
            links.map((link: TrackedLink) => (
              <Card key={link.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg gradient-primary">
                      <LinkIcon className="size-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="heading-3 text-text-navy">{link.name}</h3>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm text-brand-purple">
                          {link.shortUrl}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="size-8 p-0"
                          onClick={() => copyToClipboard(link.shortUrl)}
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                      <p className="small-text text-text-muted">{link.destinationUrl}</p>
                      <div className="flex gap-6 text-sm">
                        <span className="text-text-secondary">
                          Clicks: <span className="font-normal text-text-navy">{link.clicks}</span>
                        </span>
                        <span className="text-text-secondary">
                          Conversions: <span className="font-normal text-success-green">{link.conversions}</span>
                        </span>
                        <span className="text-text-secondary">
                          Rate: <span className="font-normal text-brand-purple">{link.conversionRate}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                      <BarChart className="size-3" />
                      Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-[10px]"
                      onClick={() => window.open(link.destinationUrl, '_blank')}
                    >
                      <ExternalLink className="size-3" />
                      Visit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-[10px] text-red-500 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(link.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <LinkIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Links Yet</h3>
              <p className="text-text-secondary mb-4">Create your first trackable link</p>
              <Button 
                className="gap-2 rounded-[10px] gradient-primary text-white"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="size-4" />
                Create Link
              </Button>
            </Card>
          )}
        </div>

        {/* Create Link Dialog */}
        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Create New Link</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Link Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Campaign"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/landing-page"
                  value={newLink.destinationUrl}
                  onChange={(e) => setNewLink({ ...newLink, destinationUrl: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={() => createMutation.mutate(newLink)}
                disabled={!newLink.name || !newLink.destinationUrl || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Link'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}