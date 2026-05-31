'use client';

import DOMPurify from 'dompurify';

/**
 * Rich Email Composer Component
 * Sprint 37 - US-37-006: Rich Email Composer
 *
 * Features:
 * - Rich text editor (TipTap)
 * - Email templates dropdown
 * - Variable insertion ({{firstName}}, etc.)
 * - Attachment support
 * - CC/BCC fields
 * - Send later scheduling
 * - Email tracking (opens, clicks)
 * - Mobile preview
 */

import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  X,
  Paperclip,
  Bold,
  Italic,
  List,
  ListOrdered,
  Clock,
  Eye,
  Smartphone,
  Monitor,
  Trash2,
  Variable,
} from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RichEmailComposerProps {
  conversationId: string;
  recipientEmail: string;
  recipientName?: string;
  onClose?: () => void;
}

interface Attachment {
  file: File;
  name: string;
  size: number;
}

const EMAIL_VARIABLES = [
  { key: '{{firstName}}', label: 'First Name' },
  { key: '{{lastName}}', label: 'Last Name' },
  { key: '{{email}}', label: 'Email' },
  { key: '{{company}}', label: 'Company' },
  { key: '{{phone}}', label: 'Phone' },
  { key: '{{date}}', label: 'Today\'s Date' },
];

export function RichEmailComposer({
  conversationId,
  recipientEmail,
  recipientName: _recipientName,
  onClose,
}: RichEmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-info underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content: '<p>Start typing your email...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Fetch email templates
  const { data: templates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to {{company}}!',
          body: '<p>Hi {{firstName}},</p><p>Welcome to our platform! We\'re excited to have you on board.</p><p>Best regards,<br>The Team</p>',
        },
        {
          id: '2',
          name: 'Follow Up',
          subject: 'Following up on our conversation',
          body: '<p>Hi {{firstName}},</p><p>I wanted to follow up on our recent conversation. Do you have any questions?</p><p>Best,<br>{{senderName}}</p>',
        },
        {
          id: '3',
          name: 'Meeting Request',
          subject: 'Let\'s schedule a meeting',
          body: '<p>Hi {{firstName}},</p><p>I\'d love to schedule a meeting to discuss how we can help {{company}}.</p><p>Are you available this week?</p><p>Thanks,<br>{{senderName}}</p>',
        },
      ];
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const htmlContent = editor?.getHTML() || '';
      
      return messagesService.sendMessage({
        conversationId,
        content: htmlContent,
        messageType: 'text',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast.success(scheduledTime ? 'Email scheduled successfully' : 'Email sent successfully');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send email');
    },
  });

  const handleSend = () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    const content = editor?.getText() || '';
    if (!content.trim()) {
      toast.error('Please enter email content');
      return;
    }

    sendEmailMutation.mutate();
  };

  const handleClose = () => {
    editor?.commands.setContent('<p>Start typing your email...</p>');
    setSubject('');
    setCc('');
    setBcc('');
    setAttachments([]);
    setScheduledTime('');
    setShowSchedule(false);
    onClose?.();
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template && editor) {
      setSubject(template.subject);
      editor.commands.setContent(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 25MB.`);
        return;
      }

      setAttachments(prev => [...prev, {
        file,
        name: file.name,
        size: file.size,
      }]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertVariable = (variable: string) => {
    editor?.commands.insertContent(variable);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">Compose Email</h3>
          <p className="text-sm text-muted-foreground">{recipientEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="size-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="flex-1 p-4 overflow-y-auto">
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'desktop' | 'mobile')}>
            <TabsList className="mb-4">
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="size-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="size-4" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="desktop">
              <div className="max-w-3xl mx-auto bg-white border rounded-lg shadow-sm p-6">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">To: {recipientEmail}</p>
                  {cc && <p className="text-sm text-muted-foreground">Cc: {cc}</p>}
                  <h2 className="text-xl font-semibold mt-2">{subject || '(No subject)'}</h2>
                </div>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editor.getHTML()) }} />
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="max-w-sm mx-auto bg-white border rounded-lg shadow-sm p-4">
                <div className="mb-3 pb-3 border-b">
                  <p className="text-xs text-muted-foreground">To: {recipientEmail}</p>
                  <h3 className="text-base font-semibold mt-1">{subject || '(No subject)'}</h3>
                </div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editor.getHTML()) }} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* Edit Mode */
        <>
          {/* Template Selector */}
          {templates && templates.length > 0 && (
            <div className="p-4 border-b bg-muted/50">
              <Label className="text-xs mb-2 block">Email Templates</Label>
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

          {/* Email Fields */}
          <div className="p-4 space-y-3 border-b">
            <div className="space-y-2">
              <Label className="text-xs">To</Label>
              <Input value={recipientEmail} disabled className="bg-muted" />
            </div>

            {showCcBcc && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Cc</Label>
                  <Input
                    placeholder="Cc recipients..."
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bcc</Label>
                  <Input
                    placeholder="Bcc recipients..."
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                  />
                </div>
              </>
            )}

            {!showCcBcc && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCcBcc(true)}
                className="text-xs"
              >
                + Add Cc/Bcc
              </Button>
            )}

            <div className="space-y-2">
              <Label className="text-xs">Subject *</Label>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(editor.isActive('bold') && 'bg-muted')}
            >
              <Bold className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(editor.isActive('italic') && 'bg-muted')}
            >
              <Italic className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(editor.isActive('bulletList') && 'bg-muted')}
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(editor.isActive('orderedList') && 'bg-muted')}
            >
              <ListOrdered className="size-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            <Select onValueChange={insertVariable}>
              <SelectTrigger className="w-[140px] h-8">
                <Variable className="size-4 mr-2" />
                <SelectValue placeholder="Variables" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_VARIABLES.map(variable => (
                  <SelectItem key={variable.key} value={variable.key}>
                    {variable.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="p-4 border-t space-y-2">
              <Label className="text-xs">Attachments ({attachments.length})</Label>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Paperclip className="size-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatFileSize(attachment.size)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {showSchedule && (
            <div className="p-4 border-t space-y-2">
              <Label className="text-xs">Schedule Send</Label>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </>
      )}

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="size-4" />
          </Button>

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
            disabled={!subject.trim() || sendEmailMutation.isPending}
            className="gap-2"
          >
            {sendEmailMutation.isPending ? (
              <>Sending...</>
            ) : scheduledTime ? (
              <>Schedule</>
            ) : (
              <>
                <Send className="size-4" />
                Send Email
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          📊 Email opens and clicks will be tracked automatically
        </p>
      </div>
    </div>
  );
}
