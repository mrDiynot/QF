'use client';

/**
 * Message Status Component
 * Shows delivery status and read receipts for messages
 */

import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusProps {
  status: MessageDeliveryStatus;
  readAt?: string;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<MessageDeliveryStatus, {
  icon: React.ReactNode;
  label: string;
  color: string;
}> = {
  sending: {
    icon: <Clock className="size-3" />,
    label: 'Sending',
    color: 'text-muted-foreground/60',
  },
  sent: {
    icon: <Check className="size-3" />,
    label: 'Sent',
    color: 'text-muted-foreground/60',
  },
  delivered: {
    icon: <CheckCheck className="size-3" />,
    label: 'Delivered',
    color: 'text-muted-foreground',
  },
  read: {
    icon: <CheckCheck className="size-3" />,
    label: 'Read',
    color: 'text-info',
  },
  failed: {
    icon: <AlertCircle className="size-3" />,
    label: 'Failed',
    color: 'text-red-500',
  },
};

export function MessageStatus({ status, readAt, className, showLabel = false }: MessageStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-1", config.color, className)}>
      {config.icon}
      {showLabel && (
        <span className="text-[10px]">
          {status === 'read' && readAt
            ? `Read ${new Date(readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : config.label
          }
        </span>
      )}
    </div>
  );
}

interface ReadReceiptProps {
  readBy: Array<{
    userId: string;
    userName: string;
    readAt: string;
  }>;
  className?: string;
}

export function ReadReceipt({ readBy, className }: ReadReceiptProps) {
  if (readBy.length === 0) return null;

  const displayText = readBy.length === 1
    ? `Read by ${readBy[0].userName}`
    : `Read by ${readBy[0].userName} and ${readBy.length - 1} other${readBy.length > 2 ? 's' : ''}`;

  return (
    <div className={cn("flex items-center gap-1 text-[10px] text-info", className)}>
      <CheckCheck className="size-3" />
      <span>{displayText}</span>
    </div>
  );
}
