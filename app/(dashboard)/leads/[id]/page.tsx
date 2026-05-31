'use client';

/**
 * Lead Detail Page
 * Shows comprehensive lead information, history, qualification score, and actions
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  Building2,
  Globe,
  Clock,
  Activity,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  FileText,
  Tag,
  User,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Wand2,
  Brain,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import type { Lead } from '@/types/api';
import { AICrmEnrichmentDialog } from '@/components/leads/AICrmEnrichmentDialog';
// Future AI components - kept for upcoming Sprint 38 implementation
// import { AIQualificationPanel } from '@/components/leads/AIQualificationPanel';
// import { BANTScoringCard } from '@/components/leads/BANTScoringCard';

// Lead status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Star className="size-3" /> },
  contacted: { label: 'Contacted', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Phone className="size-3" /> },
  qualified: { label: 'Qualified', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="size-3" /> },
  proposal: { label: 'Proposal', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FileText className="size-3" /> },
  won: { label: 'Won', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <TrendingUp className="size-3" /> },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="size-3" /> },
};

// Score color based on value
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Hot Lead';
  if (score >= 60) return 'Warm Lead';
  if (score >= 40) return 'Cool Lead';
  return 'Cold Lead';
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const leadId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [aiEnrichmentOpen, setAiEnrichmentOpen] = useState(false);

  // Fetch lead data
  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await apiClient.get<Lead>(`/leads/${leadId}`);
      return response.data;
    },
    enabled: !!leadId,
  });

  // Fetch lead conversations for AI enrichment
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', 'lead', leadId],
    queryFn: async () => {
      const response = await apiClient.get('/Conversations', {
        params: { leadId, pageSize: 1 },
      });
      return response.data;
    },
    enabled: !!leadId,
  });

  // Get the first conversation ID for AI enrichment
  const firstConversationId = conversationsData?.items?.[0]?.id || '';

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/leads/${leadId}`);
    },
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      router.push('/leads');
    },
    onError: () => {
      toast.error('Failed to delete lead');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiClient.patch<Lead>(`/leads/${leadId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Enrich lead mutation
  const enrichMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/lead-enrichment/${leadId}/enrich`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Lead enriched with additional data!');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
    onError: () => {
      toast.error('Failed to enrich lead. Try again later.');
    },
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-12 text-center">
            <AlertCircle className="size-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
            <p className="text-gray-500 mb-6">The lead you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Button onClick={() => router.push('/leads')}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Leads
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[lead.status?.toLowerCase() || 'new'] || STATUS_CONFIG.new;
  const initials = lead.firstName && lead.lastName
    ? `${lead.firstName[0]}${lead.lastName[0]}`.toUpperCase()
    : lead.email?.[0]?.toUpperCase() || 'L';

  return (
    <div className="animate-fade-in pt-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="size-5" />
            </Button>
            <Avatar className="size-14">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {lead.firstName} {lead.lastName}
                </h1>
                <Badge variant="outline" className={cn("gap-1", statusConfig.color)}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                {lead.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3" />
                    {lead.company}
                  </span>
                )}
                {lead.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    Added {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Mail className="size-4" />
              Email
            </Button>
            <Button variant="outline" className="gap-2">
              <Phone className="size-4" />
              Call
            </Button>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Send className="size-4" />
              Send Message
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="size-4 mr-2" />
                  Edit Lead
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="size-4 mr-2" />
                  Schedule Meeting
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="size-4 mr-2" />
                  Create Proposal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => enrichMutation.mutate()}
                  disabled={enrichMutation.isPending}
                >
                  {enrichMutation.isPending ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="size-4 mr-2" />
                  )}
                  Enrich Lead Data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!firstConversationId) {
                      toast.error('No conversations found. Start a conversation to use AI enrichment.');
                      return;
                    }
                    setAiEnrichmentOpen(true);
                  }}
                  disabled={!firstConversationId}
                >
                  <Brain className="size-4 mr-2" />
                  AI CRM Enrichment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="conversations">Conversations</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Contact Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail className="size-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{lead.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Phone className="size-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{lead.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Building2 className="size-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Company</p>
                        <p className="text-sm font-medium">{lead.company || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Globe className="size-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Source</p>
                        <p className="text-sm font-medium capitalize">{lead.source || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Lead Status Pipeline */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Status</h3>
                  <div className="flex items-center gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config], index) => {
                      const isActive = lead.status?.toLowerCase() === key;
                      const isPast = Object.keys(STATUS_CONFIG).indexOf(lead.status?.toLowerCase() || 'new') > index;
                      return (
                        <button
                          key={key}
                          onClick={() => updateStatusMutation.mutate(key)}
                          disabled={updateStatusMutation.isPending}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border",
                            isActive 
                              ? config.color 
                              : isPast
                                ? "bg-gray-100 text-gray-600 border-gray-200"
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <Tag className="size-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <Activity className="size-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No activity yet</p>
                      <p className="text-sm">Activity timeline will appear here</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="conversations" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="size-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No conversations</p>
                      <p className="text-sm">Start a conversation with this lead</p>
                      <Button className="mt-4 gap-2">
                        <Send className="size-4" />
                        Start Conversation
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <FileText className="size-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No notes</p>
                      <p className="text-sm">Add notes about this lead</p>
                      <Button variant="outline" className="mt-4 gap-2">
                        <Edit className="size-4" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Score & Quick Actions */}
          <div className="space-y-6">
            {/* Lead Score Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lead Score</h3>
                <Sparkles className="size-5 text-purple-500" />
              </div>
              <div className="text-center py-4">
                <div className={cn("text-5xl font-bold", getScoreColor(lead.score || 0))}>
                  {lead.score || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">{getScoreLabel(lead.score || 0)}</p>
              </div>
              <Progress 
                value={lead.score || 0} 
                className={cn(
                  "h-2 mt-4",
                  lead.score && lead.score >= 80 ? "[&>div]:bg-green-500" :
                  lead.score && lead.score >= 60 ? "[&>div]:bg-blue-500" :
                  lead.score && lead.score >= 40 ? "[&>div]:bg-amber-500" :
                  "[&>div]:bg-red-500"
                )}
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Authority</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Need</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Timeline</span>
                  <span className="font-medium">—</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 gap-2">
                <Sparkles className="size-4" />
                Re-qualify with AI
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="size-4" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="size-4" />
                  Create Proposal
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="size-4" />
                  Send Email Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="size-4" />
                  Assign to Team Member
                </Button>
              </div>
            </Card>

            {/* Source Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Channel</span>
                  <Badge variant="secondary" className="capitalize">
                    {lead.source || 'Direct'}
                  </Badge>
                </div>
                {lead.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {lead.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI CRM Enrichment Dialog */}
      <AICrmEnrichmentDialog
        open={aiEnrichmentOpen}
        onOpenChange={setAiEnrichmentOpen}
        conversationId={firstConversationId}
        leadId={leadId}
        onEnrichmentApplied={() => {
          queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
        }}
      />
    </div>
  );
}
