'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Clock,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PendingChannel } from '@/services/api/channels.service';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  social: Instagram,
  socialmessaging: Instagram,
  instagram: Instagram,
  facebook: Facebook,
  sms: MessageSquare,
  phone: Phone,
  voice: Phone,
  whatsapp: MessageSquare,
  chat_widget: MessageSquare,
  web_chat: MessageSquare,
  web_forms: Mail,
  email: Mail,
};

const CHANNEL_COLORS: Record<string, string> = {
  social: 'bg-gradient-to-br from-pink-100 to-purple-100 text-foreground',
  socialmessaging: 'bg-gradient-to-br from-pink-100 to-purple-100 text-foreground',
  instagram: 'bg-muted/50 text-foreground',
  facebook: 'bg-muted/50 text-info',
  sms: 'bg-muted/50 text-info',
  phone: 'bg-green-100 text-green-700',
  voice: 'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  chat_widget: 'bg-primary/10 text-primary',
  web_chat: 'bg-primary/10 text-primary',
  web_forms: 'bg-orange-100 text-orange-700',
  email: 'bg-primary/10 text-indigo-700',
};

interface ComingSoonChannelCardProps {
  channel: PendingChannel;
}

export function ComingSoonChannelCard({ channel }: ComingSoonChannelCardProps) {
  const channelTypeLower = channel.channelType.toLowerCase().replace('_', '');
  const Icon = CHANNEL_ICONS[channelTypeLower] || MessageSquare;
  const colorClass = CHANNEL_COLORS[channelTypeLower] || 'bg-muted/40 text-foreground/80';

  return (
    <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 opacity-75">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-600">{channel.displayName}</CardTitle>
            <CardDescription className="text-sm text-slate-500">{channel.description}</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-600">
          <Clock className="size-3" />
          Coming Soon
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <Instagram className="size-4" />
            <span className="text-sm font-medium">Meta API Integration</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            We&apos;re working on integrating Instagram and Facebook Messenger. 
            This feature will be available in a future update.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 text-slate-500 border-slate-300"
          disabled
        >
          <Bell className="size-4" />
          Notify Me When Available
        </Button>
      </CardContent>
    </Card>
  );
}
