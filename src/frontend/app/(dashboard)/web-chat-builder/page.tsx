'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { GradientButton } from '@/components/ui/gradient-button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, TrendingUp, CheckCircle, Settings as SettingsIcon, Eye, Plus } from 'lucide-react';
import { useChannelsByType } from '@/hooks/api/useChannels';

export default function WebChatBuilderPage() {
  const router = useRouter();

  // Use standardized hook for consistent data fetching
  const { data: channels, isLoading } = useChannelsByType('ChatWidget');

  const activeWidgets = channels?.filter(ch => ch.isActive) ?? [];
  const draftWidgets = channels?.filter(ch => !ch.isActive) ?? [];

  // Navigate to create new widget
  const handleCreateWidget = () => {
    router.push('/web-chat-builder/new/settings');
  };

  return (
    <div className="animate-fade-in pt-4 space-y-8">
      <PageHeader
        title="Web Chat Builder"
        description="Create AI-powered chat widgets for your website"
        action={
          <GradientButton variant="primary" className="gap-2" onClick={handleCreateWidget}>
            <Plus className="size-5" />
            Create Chat Widget
          </GradientButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={MessageSquare}
          value={isLoading ? '-' : String(channels?.length ?? 0)}
          label="Total Widgets"
          iconBgColor="bg-blue-500"
        />
        <StatsCard
          icon={TrendingUp}
          value={isLoading ? '-' : String(activeWidgets.length)}
          label="Active Widgets"
          iconBgColor="bg-success"
        />
        <StatsCard
          icon={CheckCircle}
          value={isLoading ? '-' : String(draftWidgets.length)}
          label="Draft Widgets"
          iconBgColor="bg-purple-500"
        />
        <StatsCard
          icon={SettingsIcon}
          value={activeWidgets.length > 0 ? '100%' : '0%'}
          label="Active Rate"
          iconBgColor="bg-teal"
        />
      </div>

      {/* Chat Widgets */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : channels && channels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {channels.map((widget, index) => {
            const colors = ['bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-teal-500'];
            const bgColor = colors[index % colors.length];
            
            return (
              <div key={widget.id} className="rounded-2xl border border-border bg-white p-6 shadow-elevation-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg ${bgColor} p-2`}>
                        <MessageSquare className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{widget.name}</h3>
                        <StatusBadge status={widget.isActive ? 'active' : 'draft'}>
                          {widget.isActive ? 'active' : 'draft'}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-text-secondary">Status</p>
                        <p className="text-sm text-foreground">{widget.verificationStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Created</p>
                        <p className="text-sm text-foreground">
                          {new Date(widget.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => router.push(`/web-chat-builder/${widget.id}/settings`)}
                      className="flex-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-text-secondary hover:bg-muted/80"
                    >
                      <SettingsIcon className="inline size-4 mr-2" />
                      Settings
                    </button>
                    <GradientButton 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => router.push(`/web-chat-builder/${widget.id}/settings`)}
                    >
                      <Eye className="size-4 mr-2" />
                      Configure
                    </GradientButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <MessageSquare className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Chat Widgets Yet</h3>
          <p className="text-text-secondary mb-4">Create your first AI-powered chat widget</p>
          <GradientButton variant="primary" onClick={handleCreateWidget}>
            <Plus className="size-4 mr-2" />
            Create Chat Widget
          </GradientButton>
        </div>
      )}
    </div>
  );
}