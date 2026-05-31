'use client';

/**
 * Knowledge Base Manager Component
 * Manage documents, FAQs, and training data for AI
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BookOpen,
  FileText,
  Upload,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Download,
  FolderOpen,
  FileType,
  Globe,
  Link,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'document' | 'url' | 'faq' | 'text';
  status: 'processing' | 'ready' | 'error';
  size?: number;
  url?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  chunks?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: Date;
}

// Mock data
const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: '1',
    name: 'Product Catalog 2024.pdf',
    type: 'document',
    status: 'ready',
    size: 2456000,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
    chunks: 45,
  },
  {
    id: '2',
    name: 'Company Policies.docx',
    type: 'document',
    status: 'ready',
    size: 156000,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    chunks: 12,
  },
  {
    id: '3',
    name: 'https://example.com/pricing',
    type: 'url',
    status: 'ready',
    url: 'https://example.com/pricing',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
    chunks: 8,
  },
  {
    id: '4',
    name: 'Service Terms.pdf',
    type: 'document',
    status: 'processing',
    size: 890000,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
];

const MOCK_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'What are your business hours?',
    answer: 'We are open Monday through Friday, 9 AM to 6 PM EST.',
    category: 'General',
    createdAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page and follow the instructions.',
    category: 'Account',
    createdAt: new Date('2024-10-05'),
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers.',
    category: 'Billing',
    createdAt: new Date('2024-10-10'),
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ready: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700', icon: <Clock className="size-3" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="size-3" /> },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="size-4" />,
  url: <Globe className="size-4" />,
  faq: <BookOpen className="size-4" />,
  text: <FileType className="size-4" />,
};

interface KnowledgeBaseManagerProps {
  className?: string;
}

export function KnowledgeBaseManager({ className }: KnowledgeBaseManagerProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_DOCUMENTS);
  const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });

  // Calculate storage used
  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
  const maxSize = 100 * 1024 * 1024; // 100MB
  const usagePercent = (totalSize / maxSize) * 100;

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete document
  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Document deleted');
  };

  // Add URL
  const addUrl = () => {
    if (!newUrl) return;
    const newDoc: KnowledgeDocument = {
      id: `url_${Date.now()}`,
      name: newUrl,
      type: 'url',
      status: 'processing',
      url: newUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments(prev => [...prev, newDoc]);
    setNewUrl('');
    setUrlDialogOpen(false);
    toast.success('URL added for processing');
  };

  // Add FAQ
  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return;
    const faq: FAQ = {
      id: `faq_${Date.now()}`,
      ...newFaq,
      createdAt: new Date(),
    };
    setFaqs(prev => [...prev, faq]);
    setNewFaq({ question: '', answer: '', category: '' });
    setFaqDialogOpen(false);
    toast.success('FAQ added');
  };

  // Delete FAQ
  const deleteFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    toast.success('FAQ deleted');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground">
            Train your AI with documents, URLs, and FAQs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUrlDialogOpen(true)} className="gap-2">
            <Link className="size-4" />
            Add URL
          </Button>
          <Button variant="outline" onClick={() => setFaqDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add FAQ
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2 bg-primary hover:bg-purple-700">
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{documents.length}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50 text-info">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{faqs.length}</p>
              <p className="text-xs text-muted-foreground">FAQs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Brain className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {documents.reduce((sum, d) => sum + (d.chunks || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">AI Chunks</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <HardDrive className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatSize(totalSize)}</p>
              <p className="text-xs text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Storage Usage</span>
          <span className="text-sm font-medium">{formatSize(totalSize)} / {formatSize(maxSize)}</span>
        </div>
        <Progress value={usagePercent} className="h-2" />
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="size-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-2">
            <BookOpen className="size-4" />
            FAQs ({faqs.length})
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <div className="divide-y">
              {filteredDocuments.map((doc) => {
                const statusConfig = STATUS_CONFIG[doc.status];
                return (
                  <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-muted/20">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                      {TYPE_ICONS[doc.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {doc.size && <span>{formatSize(doc.size)}</span>}
                        {doc.chunks && <span>{doc.chunks} chunks</span>}
                        <span>{formatDistanceToNow(doc.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("gap-1", statusConfig.color)}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="size-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="size-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No documents found</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="mt-4">
          <Card>
            <div className="divide-y">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="p-4 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{faq.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      {faq.category && (
                        <Badge variant="secondary" className="mt-2">{faq.category}</Badge>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteFaq(faq.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No FAQs found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Modal open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Upload Document</ModalTitle>
            <ModalDescription>
              Upload files to train your AI assistant
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="size-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-medium text-foreground">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, TXT up to 10MB</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add URL Dialog */}
      <Modal open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Add URL</ModalTitle>
            <ModalDescription>
              Add a webpage to your knowledge base
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/page"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setUrlDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addUrl} className="bg-primary hover:bg-purple-700">
              Add URL
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add FAQ Dialog */}
      <Modal open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Add FAQ</ModalTitle>
            <ModalDescription>
              Add a frequently asked question
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input
                value={newFaq.question}
                onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                placeholder="What is your question?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Provide the answer..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (optional)</label>
              <Input
                value={newFaq.category}
                onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Billing, Account"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addFaq} className="bg-primary hover:bg-purple-700">
              Add FAQ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
