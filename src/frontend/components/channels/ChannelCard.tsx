'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MoreVertical,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { channelsService } from '@/services/api/channels.service';
import { toast } from 'sonner';
import type { Channel } from '@/types/api';
import { ChannelConfigDialog } from './ChannelConfigDialog';
import { DeleteConfirmModal, AlertModal } from '@/components/modals';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  SMS: MessageSquare,
  Voice: Phone,
  WhatsApp: MessageSquare,
  Instagram: Instagram,
  Facebook: Facebook,
  ChatWidget: MessageSquare,
  WebForm: Mail,
};

const CHANNEL_COLORS: Record<string, string> = {
  SMS: 'bg-muted/50 text-info',
  Voice: 'bg-green-100 text-green-700',
  WhatsApp: 'bg-emerald-100 text-emerald-700',
  Instagram: 'bg-muted/50 text-foreground',
  Facebook: 'bg-primary/10 text-indigo-700',
  ChatWidget: 'bg-primary/10 text-primary',
  WebForm: 'bg-orange-100 text-orange-700',
};

interface ChannelCardProps {
  channel: Channel;
  onRefetch: () => void;
}

export function ChannelCard({ channel, onRefetch }: ChannelCardProps) {
  const [isActive, setIsActive] = useState(channel.isActive);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeChannelWarningOpen, setActiveChannelWarningOpen] = useState(false);
  const Icon = CHANNEL_ICONS[channel.type] || MessageSquare;
  const colorClass = CHANNEL_COLORS[channel.type] || 'bg-muted/40 text-foreground/80';

  // Map channel type to dialog type
  const getDialogChannelType = (): 'SMS' | 'Voice' | 'WhatsApp' | 'Instagram' | 'Facebook' | null => {
    const typeMap: Record<string, 'SMS' | 'Voice' | 'WhatsApp' | 'Instagram' | 'Facebook'> = {
      'SMS': 'SMS',
      'Voice': 'Voice',
      'WhatsApp': 'WhatsApp',
      'Instagram': 'Instagram',
      'Facebook': 'Facebook',
    };
    return typeMap[channel.type] || null;
  };

  const dialogChannelType = getDialogChannelType();

  const updateMutation = useMutation({
    mutationFn: (data: { isActive: boolean }) =>
      channelsService.updateChannel(channel.id, data),
    onSuccess: () => {
      toast.success(`Channel ${isActive ? 'activated' : 'deactivated'}`);
      onRefetch();
    },
    onError: () => {
      toast.error('Failed to update channel');
      setIsActive(!isActive); // Revert on error
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => channelsService.deleteChannel(channel.id),
    onSuccess: () => {
      toast.success('Channel deleted successfully');
      onRefetch();
    },
    onError: () => {
      toast.error('Failed to delete channel');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => channelsService.verifyChannel(channel.id),
    onSuccess: () => {
      toast.success('Channel verified successfully');
      onRefetch();
    },
    onError: () => {
      toast.error('Channel verification failed');
    },
  });

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    updateMutation.mutate({ isActive: checked });
  };

  const handleDeleteClick = () => {
    // Prevent deletion of active channels
    if (isActive) {
      setActiveChannelWarningOpen(true);
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="secondary" className="gap-1"><XCircle className="size-3" />Inactive</Badge>;
    }
    if (channel.verificationStatus === 'Verified') {
      return <Badge variant="default" className="gap-1 bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Verified</Badge>;
    }
    if (channel.verificationStatus === 'Failed') {
      return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" />Failed</Badge>;
    }
    // For active channels with Pending verification, show Active status (verification not required for all channels)
    return <Badge variant="default" className="gap-1 bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{channel.name}</CardTitle>
            <CardDescription className="text-sm">{channel.type}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => verifyMutation.mutate()}>
              <CheckCircle2 className="size-4 mr-2" />
              Verify Channel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => dialogChannelType && setConfigDialogOpen(true)}
              disabled={!dialogChannelType}
            >
              <Settings className="size-4 mr-2" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {channel.phoneNumber && (
          <div className="text-sm">
            <span className="text-text-secondary">Phone: </span>
            <span className="font-medium">{channel.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Active</span>
            <Switch checked={isActive} onCheckedChange={handleToggle} />
          </div>
        </div>
      </CardContent>

      {/* Channel Configuration Dialog */}
      {dialogChannelType && (
        <ChannelConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          channelType={dialogChannelType}
          channelId={channel.id}
          initialChannel={channel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={`the channel "${channel.name}"`}
        onConfirm={handleConfirmDelete}
      />

      {/* Active Channel Warning Dialog */}
      <AlertModal
        open={activeChannelWarningOpen}
        onOpenChange={setActiveChannelWarningOpen}
        title="Cannot Delete Active Channel"
        description="This channel is currently active. Please deactivate the channel first before deleting it."
        actionLabel="OK"
        variant="warning"
      />
    </Card>
  );
}

