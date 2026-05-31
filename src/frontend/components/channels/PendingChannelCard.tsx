'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Settings,
  AlertCircle,
} from 'lucide-react';
import type { PendingChannel } from '@/services/api/channels.service';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  sms: MessageSquare,
  phone: Phone,
  voice: Phone,
  whatsapp: MessageSquare,
  instagram: Instagram,
  facebook: Facebook,
  chat_widget: MessageSquare,
  web_chat: MessageSquare,
  web_forms: Mail,
};

const CHANNEL_COLORS: Record<string, string> = {
  sms: 'bg-muted/50 text-info',
  phone: 'bg-green-100 text-green-700',
  voice: 'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  instagram: 'bg-muted/50 text-foreground',
  facebook: 'bg-primary/10 text-indigo-700',
  chat_widget: 'bg-primary/10 text-primary',
  web_chat: 'bg-primary/10 text-primary',
  web_forms: 'bg-orange-100 text-orange-700',
};

interface PendingChannelCardProps {
  pending: PendingChannel;
  onSetup: () => void;
}

export function PendingChannelCard({ pending, onSetup }: PendingChannelCardProps) {
  const Icon = CHANNEL_ICONS[pending.channelType.toLowerCase()] || MessageSquare;
  const colorClass = CHANNEL_COLORS[pending.channelType.toLowerCase()] || 'bg-muted/40 text-foreground/80';

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{pending.displayName}</CardTitle>
            <CardDescription className="text-sm">{pending.description}</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700">
          <AlertCircle className="size-3" />
          Setup Required
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {pending.requiresPhoneNumber && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Phone className="size-4" />
              <span>Requires phone number</span>
            </div>
          )}
          {pending.requiresOAuthConnection && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Settings className="size-4" />
              <span>Requires OAuth connection</span>
            </div>
          )}
          {!pending.isAvailableOnCurrentPlan && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="size-4" />
              <span>Upgrade to {pending.minimumPlan} plan required</span>
            </div>
          )}
        </div>
        <Button
          onClick={onSetup}
          className="w-full gap-2"
          disabled={!pending.isAvailableOnCurrentPlan}
        >
          <Settings className="size-4" />
          Complete Setup
        </Button>
      </CardContent>
    </Card>
  );
}

