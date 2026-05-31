'use client';

/**
 * Knowledge Base Article Editor Component
 * Rich text editor for creating and editing knowledge base articles
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Eye,
  FileText,
  Tag,
  Folder,
  Sparkles,
  Loader2,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface KnowledgeArticle {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  aiEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KnowledgeBaseEditorProps {
  article?: KnowledgeArticle;
  categories?: string[];
  onSave?: (article: KnowledgeArticle) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  'Getting Started',
  'Products',
  'Services',
  'Pricing',
  'Support',
  'FAQs',
  'Policies',
  'Company Info',
];

const FORMATTING_TOOLS = [
  { id: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
  { id: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
  { id: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
  { id: 'divider1', type: 'divider' },
  { id: 'h1', icon: Heading1, label: 'Heading 1' },
  { id: 'h2', icon: Heading2, label: 'Heading 2' },
  { id: 'h3', icon: Heading3, label: 'Heading 3' },
  { id: 'divider2', type: 'divider' },
  { id: 'list', icon: List, label: 'Bullet List' },
  { id: 'orderedList', icon: ListOrdered, label: 'Numbered List' },
  { id: 'quote', icon: Quote, label: 'Quote' },
  { id: 'code', icon: Code, label: 'Code Block' },
  { id: 'divider3', type: 'divider' },
  { id: 'link', icon: Link, label: 'Insert Link' },
  { id: 'image', icon: Image, label: 'Insert Image' },
];

export function KnowledgeBaseEditor({
  article,
  categories = DEFAULT_CATEGORIES,
  onSave,
  onCancel,
  className,
}: KnowledgeBaseEditorProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [category, setCategory] = useState(article?.category || '');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(article?.status || 'draft');
  const [aiEnabled, setAiEnabled] = useState(article?.aiEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let insertText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        insertText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        insertText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'underline':
        insertText = `__${selectedText || 'underlined text'}__`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'h1':
        insertText = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        insertText = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'h3':
        insertText = `\n### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'list':
        insertText = `\n- ${selectedText || 'List item'}\n`;
        break;
      case 'orderedList':
        insertText = `\n1. ${selectedText || 'List item'}\n`;
        break;
      case 'quote':
        insertText = `\n> ${selectedText || 'Quote'}\n`;
        break;
      case 'code':
        insertText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\ncode\n```';
        break;
      case 'link':
        setLinkText(selectedText);
        setLinkDialogOpen(true);
        return;
      default:
        return;
    }

    const newContent = content.substring(0, start) + insertText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + insertText.length + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertLink = () => {
    if (!linkUrl) {
      toast.error('Please enter a URL');
      return;
    }

    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = linkText || linkUrl;
    const insertText = `[${text}](${linkUrl})`;

    const newContent = content.substring(0, start) + insertText + content.substring(end);
    setContent(newContent);
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const generateWithAI = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation - in production this would call the API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const generatedContent = `# ${title}

## Overview
This article provides comprehensive information about ${title.toLowerCase()}.

## Key Points
- Important detail about the topic
- Another relevant point
- Additional information for users

## Details
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Related Topics
- Link to related article 1
- Link to related article 2

## Need Help?
Contact our support team for additional assistance.`;

      setContent(generatedContent);
      toast.success('Content generated! Review and edit as needed.');
    } catch {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      const articleData: KnowledgeArticle = {
        id: article?.id,
        title,
        content,
        category,
        tags,
        status,
        aiEnabled,
        createdAt: article?.createdAt,
        updatedAt: new Date(),
      };

      if (onSave) {
        await onSave(articleData);
      }
      toast.success(article?.id ? 'Article updated!' : 'Article created!');
    } catch {
      toast.error('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {article?.id ? 'Edit Article' : 'New Article'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Create content for your AI knowledge base
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button
            className="gap-2 gradient-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {status === 'published' ? 'Publish' : 'Save Draft'}
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <Card className="p-4">
            <Input
              placeholder="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </Card>

          {/* Toolbar */}
          <Card className="p-2">
            <div className="flex items-center gap-1 flex-wrap">
              {FORMATTING_TOOLS.map((tool) => {
                if (tool.type === 'divider') {
                  return <div key={tool.id} className="w-px h-6 bg-muted mx-1" />;
                }
                const Icon = tool.icon!;
                return (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting(tool.id)}
                    title={tool.label}
                  >
                    <Icon className="size-4" />
                  </Button>
                );
              })}
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={generateWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4 text-primary" />
                )}
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
          </Card>

          {/* Content Editor */}
          <Card className="p-4">
            <Textarea
              id="content-editor"
              placeholder="Start writing your article content here...

You can use Markdown formatting:
- **bold** for bold text
- *italic* for italic text
- # Heading 1, ## Heading 2, etc.
- - or * for bullet lists
- 1. for numbered lists
- > for quotes
- ``` for code blocks"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm border-0 p-0 focus-visible:ring-0 resize-none"
            />
            <div className="flex items-center justify-between pt-3 border-t mt-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    Published
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-500" />
                    Archived
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Category */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <Folder className="size-4" />
                      {cat}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Tags */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag}>
                <Plus className="size-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="size-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* AI Settings */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-primary" />
                <Label className="text-sm font-medium">AI Training</Label>
              </div>
              <Button
                variant={aiEnabled ? 'default' : 'outline'}
                size="sm"
                className={cn(aiEnabled && 'bg-primary hover:bg-purple-700')}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                {aiEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {aiEnabled
                ? 'This article will be used to train your AI assistant.'
                : 'This article will not be included in AI training.'}
            </p>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Modal open={previewOpen} onOpenChange={setPreviewOpen}>
        <ModalContent size="xl" className="max-h-[80vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Article Preview</ModalTitle>
            <ModalDescription>
              Preview how your article will appear
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="prose prose-sm max-w-none">
              <h1>{title || 'Untitled Article'}</h1>
              <div className="flex items-center gap-2 mb-4 not-prose">
                {category && (
                  <Badge variant="secondary">
                    <Folder className="size-3 mr-1" />
                    {category}
                  </Badge>
                )}
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="whitespace-pre-wrap">{content || 'No content yet.'}</div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Link Dialog */}
      <Modal open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Insert Link</ModalTitle>
            <ModalDescription>
              Add a link to your content
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link Text (optional)</Label>
              <Input
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>Insert Link</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
