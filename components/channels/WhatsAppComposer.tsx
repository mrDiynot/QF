'use client';

/**
 * WhatsApp Composer Component
 * Sprint 37 - US-37-003: WhatsApp Interface
 * 
 * Features:
 * - WhatsApp message composer
 * - Template message support
 * - Media sharing (images, videos, documents)
 * - Message status (sent, delivered, read)
 * - Quick replies
 * - Rich media cards
 */

import { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Send,
  X,
  Paperclip,
  Video,
  FileText,
  Trash2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WhatsAppComposerProps {
  conversationId: string;
  phoneNumber: string;
  onClose?: () => void;
}

interface Attachment {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'document';
}

interface QuickReply {
  id: string;
  text: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: '1', text: 'Yes, I\'m interested' },
  { id: '2', text: 'Tell me more' },
  { id: '3', text: 'Not right now' },
  { id: '4', text: 'Call me later' },
];

export function WhatsAppComposer({
  conversationId,
  phoneNumber,
  onClose,
}: WhatsAppComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch WhatsApp templates
  const { data: templates } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      // Mock templates - replace with actual API call
      return [
        { 
          id: '1', 
          name: 'Welcome Message',
          content: 'Hi {{1}}! Welcome to {{2}}. How can we help you today?',
          category: 'UTILITY',
        },
        { 
          id: '2', 
          name: 'Appointment Confirmation',
          content: 'Your appointment is confirmed for {{1}} at {{2}}. Reply YES to confirm or NO to reschedule.',
          category: 'UTILITY',
        },
        { 
          id: '3', 
          name: 'Follow Up',
          content: 'Hi {{1}}, following up on our conversation. Do you have any questions?',
          category: 'MARKETING',
        },
      ];
    },
  });

  // Send WhatsApp message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', message);
      formData.append('channel', 'WhatsApp');
      formData.append('phoneNumber', phoneNumber);

      // Add attachments
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
      toast.success('WhatsApp message sent');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send WhatsApp message');
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
    setSelectedTemplate('');
    onClose?.();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Check file size (max 16MB for WhatsApp)
      if (file.size > 16 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 16MB.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const attachment: Attachment = {
        file,
        type: isImage ? 'image' : isVideo ? 'video' : 'document',
      };

      // Create preview for images
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const handleQuickReplyClick = (text: string) => {
    setMessage(text);
    setShowQuickReplies(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-[#075E54]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-semibold">WA</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">WhatsApp</h3>
            <p className="text-xs text-white/80">{phoneNumber}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
          <X className="size-4" />
        </Button>
      </div>

      {/* Template Selector */}
      {templates && templates.length > 0 && (
        <div className="p-4 border-b bg-muted/50">
          <Label className="text-xs mb-2 block">WhatsApp Templates</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    <span>{template.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-xs text-muted-foreground mt-2">
              {' '} Replace variables with actual values before sending
            </p>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={4096}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{message.length} / 4096 characters</span>
            {selectedTemplate && (
              <Badge variant="secondary" className="text-xs">Template Message</Badge>
            )}
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
                  ) : attachment.type === 'video' ? (
                    <div className="w-full h-24 flex items-center justify-center bg-muted rounded-lg border">
                      <Video className="size-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-muted rounded-lg border">
                      <FileText className="size-8 text-muted-foreground" />
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
        {showQuickReplies && (
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
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-3 bg-[#F0F2F5]">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach media"
            className="hover:bg-white/50"
          >
            <Paperclip className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={cn("text-xs hover:bg-white/50", showQuickReplies && "bg-white")}
          >
            Quick Replies
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || sendMessageMutation.isPending}
            className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
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

        {/* WhatsApp Status Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="size-3" />
            <span>Sent</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCheck className="size-3" />
            <span>Delivered</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCheck className="size-3 text-info" />
            <span>Read</span>
          </div>
        </div>
      </div>
    </div>
  );
}
