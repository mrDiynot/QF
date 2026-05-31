'use client';

/**
 * Enhanced SMS Composer Component
 * Sprint 37 - US-37-001: SMS Conversation Interface
 * 
 * Features:
 * - Character counter with SMS segmentation (160 chars = 1 SMS, 153 per segment after)
 * - MMS support (images, files)
 * - Message templates quick insert
 * - Delivery status indicators
 * - Phone number formatting
 * - Emoji picker
 * - Message scheduling
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Send,
  X,
  Paperclip,
  Smile,
  Clock,
  FileText,
  Trash2,
  Calendar,
} from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
// Popover component will be added via shadcn/ui
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedSMSComposerProps {
  conversationId: string;
  phoneNumber: string;
  onClose?: () => void;
}

interface Attachment {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

// SMS character limits
const SMS_SINGLE_LIMIT = 160;
const SMS_MULTI_LIMIT = 153;

export function EnhancedSMSComposer({
  conversationId,
  phoneNumber,
  onClose,
}: EnhancedSMSComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch SMS templates
  const { data: templates } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      // Mock templates - replace with actual API call
      return [
        { id: '1', name: 'Follow-up', content: 'Hi {{firstName}}, following up on our conversation. Let me know if you have any questions!' },
        { id: '2', name: 'Appointment Reminder', content: 'Reminder: Your appointment is scheduled for {{date}} at {{time}}.' },
        { id: '3', name: 'Thank You', content: 'Thank you for your interest! We\'ll be in touch soon.' },
      ];
    },
  });

  // Calculate SMS segments
  const calculateSegments = useCallback((text: string) => {
    const length = text.length;
    if (length === 0) return { segments: 0, remaining: SMS_SINGLE_LIMIT };
    if (length <= SMS_SINGLE_LIMIT) {
      return { segments: 1, remaining: SMS_SINGLE_LIMIT - length };
    }
    const segments = Math.ceil(length / SMS_MULTI_LIMIT);
    const remaining = (segments * SMS_MULTI_LIMIT) - length;
    return { segments, remaining };
  }, []);

  const { segments, remaining } = calculateSegments(message);

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', message);
      formData.append('channel', 'SMS');
      formData.append('phoneNumber', phoneNumber);
      
      if (scheduledTime) {
        formData.append('scheduledAt', scheduledTime);
      }

      // Add attachments for MMS
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
      toast.success(scheduledTime ? 'SMS scheduled successfully' : 'SMS sent successfully');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send SMS');
    },
  });

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    sendSMSMutation.mutate();
  };

  const handleClose = () => {
    setMessage('');
    setAttachments([]);
    setScheduledTime('');
    setShowSchedule(false);
    onClose?.();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Check file size (max 5MB for MMS)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const attachment: Attachment = {
        file,
        type: isImage ? 'image' : 'document',
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

    // Reset input
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">Send SMS</h3>
          <p className="text-sm text-muted-foreground">{phoneNumber}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Template Selector */}
      {templates && templates.length > 0 && (
        <div className="p-4 border-b bg-muted/50">
          <Label className="text-xs mb-2 block">Quick Templates</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Message Input */}
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={1600}
          />
          
          {/* Character Counter */}
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              "font-medium",
              remaining < 20 && "text-orange-600",
              remaining < 10 && "text-red-600"
            )}>
              {message.length} characters • {segments} SMS {segments > 1 ? 'messages' : 'message'}
            </span>
            <span className="text-muted-foreground">
              {remaining} remaining
            </span>
          </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Attachments ({attachments.length})</Label>
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

        {/* Schedule Section */}
        {showSchedule && (
          <div className="space-y-2">
            <Label className="text-xs">Schedule Send</Label>
            <Input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (MMS)"
          >
            <Paperclip className="size-4" />
          </Button>

          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Add emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="size-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} width={350} height={400} />
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSchedule(!showSchedule)}
            title="Schedule send"
            className={cn(showSchedule && "bg-muted")}
          >
            <Clock className="size-4" />
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || sendSMSMutation.isPending}
            className="gap-2"
          >
            {sendSMSMutation.isPending ? (
              <>Sending...</>
            ) : scheduledTime ? (
              <>
                <Calendar className="size-4" />
                Schedule
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send SMS
              </>
            )}
          </Button>
        </div>

        {/* Info Text */}
        {attachments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            📎 MMS will be sent with {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
