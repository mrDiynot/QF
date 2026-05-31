'use client';

/**
 * Social Media Composer Component
 * Sprint 37 - US-37-004 & US-37-005: Instagram DM & Facebook Messenger Interfaces
 * 
 * Unified component for Instagram and Facebook messaging
 */

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  X,
  Image as ImageIcon,
  Video,
  Trash2,
  Heart,
  ThumbsUp,
} from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Platform = 'instagram' | 'facebook';

interface SocialMediaComposerProps {
  platform: Platform;
  conversationId: string;
  recipientId: string;
  recipientName?: string;
  onClose?: () => void;
}

interface Attachment {
  file: File;
  preview?: string;
  type: 'image' | 'video';
}

const QUICK_REPLIES = [
  { id: '1', text: 'Thanks for reaching out!' },
  { id: '2', text: 'Can you tell me more?' },
  { id: '3', text: 'I\'ll get back to you soon' },
  { id: '4', text: 'Check out our website' },
];

export function SocialMediaComposer({
  platform,
  conversationId,
  recipientId,
  recipientName,
  onClose,
}: SocialMediaComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const platformConfig = {
    instagram: {
      name: 'Instagram',
      color: 'from-purple-600 via-pink-600 to-orange-500',
      bgColor: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500',
      icon: '📷',
      maxChars: 1000,
    },
    facebook: {
      name: 'Facebook Messenger',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: '💬',
      maxChars: 2000,
    },
  };

  const config = platformConfig[platform];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', message);
      formData.append('channel', platform === 'instagram' ? 'Instagram' : 'Facebook');
      formData.append('recipientId', recipientId);

      attachments.forEach((attachment, index) => {
        formData.append(`attachment_${index}`, attachment.file);
      });

      return messagesService.sendMessage({
        conversationId,
        content: message,
        messageType: 'text',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast.success(`${config.name} message sent`);
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to send ${config.name} message`);
    },
  });

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach media');
      return;
    }

    sendMessageMutation.mutate();
  };

  const handleClose = () => {
    setMessage('');
    setAttachments([]);
    onClose?.();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 25MB.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('Only images and videos are supported');
        return;
      }

      const attachment: Attachment = {
        file,
        type: isImage ? 'image' : 'video',
      };

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, attachment]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickReplyClick = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("flex items-center justify-between p-4 border-b", config.bgColor)}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.name}</h3>
            <p className="text-xs text-white/80">{recipientName || recipientId}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
          <X className="size-4" />
        </Button>
      </div>

      {/* Message Input */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <Textarea
            placeholder={`Send a ${platform === 'instagram' ? 'DM' : 'message'}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={config.maxChars}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{message.length} / {config.maxChars} characters</span>
          </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Media ({attachments.length})</Label>
            <div className="grid grid-cols-3 gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  {attachment.type === 'image' && attachment.preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- Blob URL preview not supported by next/image */
                    <img
                      src={attachment.preview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-muted rounded-lg border">
                      <Video className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(index)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                  <p className="text-xs truncate mt-1">{attachment.file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Replies */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Replies</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map(reply => (
              <Button
                key={reply.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReplyClick(reply.text)}
                className="text-xs"
              >
                {reply.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Platform-specific features */}
        {platform === 'instagram' && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">💡 Instagram Features:</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">Story Replies</Badge>
              <Badge variant="secondary" className="text-xs">Reels</Badge>
              <Badge variant="secondary" className="text-xs">Posts</Badge>
            </div>
          </div>
        )}

        {platform === 'facebook' && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">💡 Messenger Features:</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">Reactions</Badge>
              <Badge variant="secondary" className="text-xs">GIFs</Badge>
              <Badge variant="secondary" className="text-xs">Stickers</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach media"
          >
            <ImageIcon className="size-4" />
          </Button>

          {platform === 'instagram' && (
            <Button variant="ghost" size="icon" title="Send heart">
              <Heart className="size-4" />
            </Button>
          )}

          {platform === 'facebook' && (
            <Button variant="ghost" size="icon" title="Send like">
              <ThumbsUp className="size-4" />
            </Button>
          )}

          <div className="flex-1" />

          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || sendMessageMutation.isPending}
            className={cn("gap-2", config.bgColor, "text-white")}
          >
            {sendMessageMutation.isPending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="size-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
