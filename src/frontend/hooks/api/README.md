# Standardized Data Fetching Patterns

This document outlines the standardized approach for data fetching across all UI pages to ensure consistency and avoid rework.

## Key Principles

1. **Use Centralized Hooks** - Never write inline `useQuery` in pages. Always use hooks from `/hooks/api/`.
2. **Normalize Data** - Hooks should normalize API responses to consistent field names.
3. **Case-Insensitive Matching** - Always use `.toLowerCase()` for type/channel comparisons.
4. **Fallback Fields** - Check multiple field names for backward compatibility.

## Available Hooks

### Channels
```typescript
import { useChannelByType } from '@/hooks/api/useConversations';
import { useChannels, useActiveChannels } from '@/hooks/api/useChannels';

// Get a specific channel by type (case-insensitive)
const { data: smsChannel } = useChannelByType('sms');
const { data: voiceChannel } = useChannelByType('voice');

// Get all channels
const { data: channels } = useChannels();
```

### Conversations
```typescript
import { useConversations, useConversationsByChannel } from '@/hooks/api/useConversations';

// Get all conversations
const { data } = useConversations();

// Get conversations filtered by channel (normalized)
const { data: smsConversations } = useConversationsByChannel('sms');
const { data: voiceConversations } = useConversationsByChannel('voice');
```

### Messages
```typescript
import { useMessages, useSendMessage } from '@/hooks/api/useConversations';

// Get messages for a conversation
const { data: messages } = useMessages({ conversationId: 'xxx' });

// Send a message
const sendMutation = useSendMessage();
sendMutation.mutate({ conversationId: 'xxx', content: 'Hello' });
```

## Field Name Normalization

The hooks normalize these common field mismatches:

| Backend Field | Normalized Field | Notes |
|--------------|------------------|-------|
| `channel` | `channel`, `channelType` | Both populated |
| `leadId` | `leadId`, `contactId` | Fallback chain |
| `startedAt` | `lastMessageAt` | If `lastMessageAt` missing |
| `status` | `status` | Includes 'open' for backend enum |

## Example: Channel Page Template

```typescript
'use client';

import { useState } from 'react';
import { useChannelByType, useConversationsByChannel } from '@/hooks/api/useConversations';

export default function ChannelPage({ channelType }: { channelType: string }) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  // Standardized data fetching
  const { data: channel } = useChannelByType(channelType);
  const { data: conversations = [], isLoading } = useConversationsByChannel(channelType);

  // Stats are calculated from normalized data
  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active' || c.status === 'open').length,
    unread: conversations.filter(c => c.unreadCount > 0).length,
  };

  return (
    <div>
      <h1>{channelType} Channel</h1>
      <p>Phone: {channel?.phoneNumber}</p>
      <p>Active: {channel?.isActive ? 'Yes' : 'No'}</p>
      
      {conversations.map(conv => (
        <div key={conv.id}>
          {conv.contactId || conv.leadId} - {conv.status}
        </div>
      ))}
    </div>
  );
}
```

## Adding New Hooks

When adding new hooks:

1. Add to the appropriate file in `/hooks/api/`
2. Export from `/hooks/api/index.ts`
3. Include JSDoc comments
4. Normalize response data if API field names differ from frontend types
5. Use query key factories for cache management

## Query Key Conventions

```typescript
export const exampleKeys = {
  all: ['example'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...exampleKeys.lists(), filters] as const,
  details: () => [...exampleKeys.all, 'detail'] as const,
  detail: (id: string) => [...exampleKeys.details(), id] as const,
};
```
