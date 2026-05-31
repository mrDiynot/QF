'use client';

/**
 * Chat Widget Builder Page
 * Allows users to create and customize their embedded chat widget
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatWidgetBuilder, type WidgetConfig } from '@/components/widgets';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export default function ChatWidgetPage() {
  const queryClient = useQueryClient();

  const saveWidgetMutation = useMutation({
    mutationFn: async (config: WidgetConfig) => {
      const response = await apiClient.post('/chat-widgets', config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Widget configuration saved');
      queryClient.invalidateQueries({ queryKey: ['chat-widgets'] });
    },
    onError: () => {
      toast.error('Failed to save widget configuration');
    },
  });

  const handleSave = (config: WidgetConfig) => {
    saveWidgetMutation.mutate(config);
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Chat Widget</h1>
          <p className="text-gray-600 mt-1">
            Customize and embed a chat widget on your website to capture leads 24/7
          </p>
        </div>

        {/* Widget Builder */}
        <ChatWidgetBuilder onSave={handleSave} />
      </div>
    </div>
  );
}
