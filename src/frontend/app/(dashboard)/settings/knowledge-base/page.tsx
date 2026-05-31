'use client';

/**
 * Knowledge Base Management Page
 * Allows businesses to manage FAQs, documents, and training data for AI
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  FileText,
  Upload,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Globe,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  HardDrive,
  RefreshCw,
  Loader2,
  MessageSquareText,
  Link,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { AIKnowledgeGenerationDialog } from '@/components/knowledge/AIKnowledgeGenerationDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import {
  useKnowledgeBaseArticles,
  useKnowledgeBaseFaqs,
  useKnowledgeBaseDocuments,
  useKnowledgeBaseStats,
  useCreateArticle,
  useDeleteArticle,
  useCreateFaq,
  useDeleteFaq,
  useUploadDocument,
  useAddUrl,
  useDeleteDocument,
} from '@/hooks/api/useKnowledgeBase';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ready: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700', icon: <Clock className="size-3" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="size-3" /> },
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, _setUpgradeReason] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '' });
  const [newUrl, setNewUrl] = useState('');

  // Subscription enforcement - check storage limits
  const { checkLimit: _checkLimit } = useSubscriptionEnforcement();

  // API hooks
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useKnowledgeBaseStats();
  const { data: faqs = [], isLoading: faqsLoading, refetch: refetchFaqs } = useKnowledgeBaseFaqs();
  const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } = useKnowledgeBaseArticles();
  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useKnowledgeBaseDocuments();

  // Mutations
  const createFaq = useCreateFaq();
  const deleteFaq = useDeleteFaq();
  const createArticle = useCreateArticle();
  const deleteArticle = useDeleteArticle();
  const uploadDocument = useUploadDocument();
  const addUrl = useAddUrl();
  const deleteDocument = useDeleteDocument();

  // Storage calculation
  const storageUsed = stats?.storageUsedBytes || 0;
  const storageLimit = stats?.storageLimitBytes || 100 * 1024 * 1024; // Default 100MB
  const storagePercent = (storageUsed / storageLimit) * 100;

  // Filter data
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleCreateFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error('Please fill in question and answer');
      return;
    }
    await createFaq.mutateAsync({
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category || undefined,
    });
    setNewFaq({ question: '', answer: '', category: '' });
    setFaqDialogOpen(false);
  };

  const handleCreateArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast.error('Please fill in title and content');
      return;
    }
    await createArticle.mutateAsync({
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category || undefined,
    });
    setNewArticle({ title: '', content: '', category: '' });
    setArticleDialogOpen(false);
  };

  const handleAddUrl = async () => {
    if (!newUrl) {
      toast.error('Please enter a URL');
      return;
    }
    await addUrl.mutateAsync({ url: newUrl });
    setNewUrl('');
    setUrlDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument.mutateAsync(file);
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchFaqs();
    refetchArticles();
    refetchDocuments();
    toast.success('Refreshed');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="size-7 text-purple-600" />
            Knowledge Base
          </h1>
          <p className="text-gray-500 mt-1">
            Train your AI with FAQs, documents, and custom content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="size-4 mr-2" />
            Generate with AI
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquareText className="size-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalFaqs || 0}</div>
                <p className="text-xs text-gray-500">FAQs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BookOpen className="size-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalArticles || 0}</div>
                <p className="text-xs text-gray-500">Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="size-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalDocuments || 0}</div>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <HardDrive className="size-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{formatBytes(storageUsed)}</p>
                  <p className="text-xs text-gray-500">/ {formatBytes(storageLimit)}</p>
                </div>
                <Progress value={storagePercent} className="h-2 mt-1" />
                <p className="text-xs text-gray-500 mt-1">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Content</CardTitle>
              <CardDescription>Add and manage knowledge for your AI assistant</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="faqs" className="gap-2">
                  <MessageSquareText className="size-4" />
                  FAQs
                  <Badge variant="secondary" className="ml-1">{faqs.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <BookOpen className="size-4" />
                  Articles
                  <Badge variant="secondary" className="ml-1">{articles.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="size-4" />
                  Documents
                  <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                {activeTab === 'faqs' && (
                  <Button onClick={() => setFaqDialogOpen(true)} className="gap-2">
                    <Plus className="size-4" />
                    Add FAQ
                  </Button>
                )}
                {activeTab === 'articles' && (
                  <Button onClick={() => setArticleDialogOpen(true)} className="gap-2">
                    <Plus className="size-4" />
                    Add Article
                  </Button>
                )}
                {activeTab === 'documents' && (
                  <>
                    <Button variant="outline" onClick={() => setUrlDialogOpen(true)} className="gap-2">
                      <Link className="size-4" />
                      Add URL
                    </Button>
                    <Button className="gap-2" asChild>
                      <label>
                        <Upload className="size-4" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-4">
              {faqsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquareText className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No FAQs yet</p>
                  <Button className="mt-4" onClick={() => setFaqDialogOpen(true)}>
                    Add Your First FAQ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <Card key={faq.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {faq.category && (
                                <Badge variant="outline">{faq.category}</Badge>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(faq.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteFaq.mutate(faq.id)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-4">
              {articlesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No articles yet</p>
                  <Button className="mt-4" onClick={() => setArticleDialogOpen(true)}>
                    Add Your First Article
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{article.title}</h4>
                              {article.isPublished ? (
                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                              ) : (
                                <Badge variant="outline">Draft</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {article.category && (
                                <Badge variant="outline">{article.category}</Badge>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteArticle.mutate(article.id)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No documents yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload PDFs, DOCs, or add URLs</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => {
                    const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.processing;
                    return (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gray-100">
                                {doc.type === 'url' ? (
                                  <Globe className="size-5 text-blue-600" />
                                ) : (
                                  <FileText className="size-5 text-purple-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={cn('gap-1', statusConfig.color)}>
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                  </Badge>
                                  {doc.size && (
                                    <span className="text-xs text-gray-400">{formatBytes(doc.size)}</span>
                                  )}
                                  {doc.chunks && (
                                    <span className="text-xs text-gray-400">{doc.chunks} chunks</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => deleteDocument.mutate(doc.id)}
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add FAQ Dialog */}
      <Modal open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Add FAQ</ModalTitle>
            <ModalDescription>
              Add a question and answer that your AI can use to respond to customers.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="What question do customers ask?"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="How should the AI respond?"
                rows={4}
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Billing, Support, Products"
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFaq} disabled={createFaq.isPending}>
              {createFaq.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Add FAQ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Article Dialog */}
      <Modal open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Add Article</ModalTitle>
            <ModalDescription>
              Add detailed content that your AI can reference when answering questions.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Article title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your article content..."
                rows={8}
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="articleCategory">Category (optional)</Label>
              <Input
                id="articleCategory"
                placeholder="e.g., Products, Services, Policies"
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateArticle} disabled={createArticle.isPending}>
              {createArticle.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Add Article
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
              Add a webpage URL to scrape and include in your knowledge base.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/page"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setUrlDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUrl} disabled={addUrl.isPending}>
              {addUrl.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Add URL
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        showDialog={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        feature="Knowledge Base"
        reason={upgradeReason}
        requiredPlan="Smart Flow"
      />

      {/* AI Knowledge Generation Dialog */}
      <AIKnowledgeGenerationDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onArticleSaved={() => {
          refetchFaqs();
          refetchArticles();
          refetchStats();
        }}
      />
    </div>
  );
}
