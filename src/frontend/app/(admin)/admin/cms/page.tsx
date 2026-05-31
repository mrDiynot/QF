'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Options } from 'rehype-sanitize';

// Blog content sanitization schema — defense-in-depth against rogue admin XSS
const blogSanitizeSchema: Options = {
  ...defaultSchema,
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'section', 'article',
    'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup', 'mark', 'small',
    'a', 'img', 'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'pre', 'code', 'kbd', 'samp', 'var',
    'blockquote', 'cite', 'q', 'details', 'summary', 'dl', 'dt', 'dd',
    'figure', 'figcaption', 'input', 'abbr', 'time', 'wbr',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['align', 'valign', 'scope'], td: ['align', 'valign'],
    input: ['type', 'checked', 'disabled'],
    code: ['className'], pre: ['className'], span: ['className'], div: ['className'],
    time: ['dateTime'], abbr: ['title'], details: ['open'], ol: ['start', 'type'], li: ['value'],
  },
  protocols: { href: ['http', 'https', 'mailto'], src: ['http', 'https', 'data'], cite: ['http', 'https'] },
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'textarea', 'select', 'button', 'link', 'meta', 'base'],
};
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import {
  HelpCircle,
  Quote,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  Building,
  Newspaper,
  Clock,
  X,
} from 'lucide-react';
import { PageHeader, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import {
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useCmsPages,
  useStatistics,
  useTrustedCompanies,
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
} from '@/hooks/admin';
import { adminCmsService } from '@/services/api/admin.service';
import type { Faq, Testimonial, FaqRequest, TestimonialRequest, BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '@/types/admin';

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState('faqs');
  
  // FAQs
  const { data: faqs = [], isLoading: faqsLoading, isError: faqsError, refetch: refetchFaqs, isRefetching: faqsRefetching } = useFaqs();
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  // Testimonials
  const { data: testimonials = [], isLoading: testimonialsLoading, isError: testimonialsError, refetch: refetchTestimonials, isRefetching: testimonialsRefetching } = useTestimonials();
  const createTestimonialMutation = useCreateTestimonial();
  const updateTestimonialMutation = useUpdateTestimonial();
  const deleteTestimonialMutation = useDeleteTestimonial();

  // CMS Pages
  const { data: pages = [], isLoading: pagesLoading, isError: pagesError, refetch: refetchPages, isRefetching: pagesRefetching } = useCmsPages();

  // Statistics
  const { data: statistics = [], isLoading: statsLoading, isError: statsError, refetch: refetchStats, isRefetching: statsRefetching } = useStatistics();

  // Trusted Companies
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError, refetch: refetchCompanies, isRefetching: companiesRefetching } = useTrustedCompanies();

  // Blog Posts
  const { data: blogPosts = [], isLoading: blogsLoading, isError: blogsError, refetch: refetchBlogs, isRefetching: blogsRefetching } = useBlogPosts();
  const createBlogMutation = useCreateBlogPost();
  const updateBlogMutation = useUpdateBlogPost();
  const deleteBlogMutation = useDeleteBlogPost();
  
  // Pagination state
  const [faqPage, setFaqPage] = useState(1);
  const [faqPageSize, setFaqPageSize] = useState(10);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [testimonialPageSize, setTestimonialPageSize] = useState(10);
  const [blogPage, setBlogPage] = useState(1);
  const [blogPageSize, setBlogPageSize] = useState(10);
  const [statsPage, setStatsPage] = useState(1);
  const [statsPageSize, setStatsPageSize] = useState(10);

  // Dialog states
  const [faqDialog, setFaqDialog] = useState<{ open: boolean; faq: Faq | null }>({ open: false, faq: null });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', isActive: true });
  const [testimonialDialog, setTestimonialDialog] = useState<{ open: boolean; testimonial: Testimonial | null }>({ open: false, testimonial: null });
  const [testimonialForm, setTestimonialForm] = useState({ 
    quote: '', 
    authorName: '', 
    authorRole: '', 
    companyName: '', 
    rating: 5,
    isFeatured: false, 
    isActive: true 
  });
  const [blogDialog, setBlogDialog] = useState<{ open: boolean; blog: BlogPost | null }>({ open: false, blog: null });
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImagePath: '',
    authorName: '',
    authorAvatarPath: '',
    category: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState('');

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'faq' | 'testimonial' | 'blog' | null;
    id: string | null;
    name: string;
  }>({ type: null, id: null, name: '' });

  const _loading = faqsLoading || testimonialsLoading || pagesLoading || statsLoading || companiesLoading || blogsLoading;
  const refreshing = faqsRefetching || testimonialsRefetching || pagesRefetching || statsRefetching || companiesRefetching || blogsRefetching;
  const hasError = faqsError || testimonialsError || pagesError || statsError || companiesError || blogsError;

  const handleRefresh = () => {
    refetchFaqs();
    refetchTestimonials();
    refetchPages();
    refetchStats();
    refetchCompanies();
    refetchBlogs();
  };

  // FAQ handlers
  const openFaqDialog = (faq?: Faq) => {
    if (faq) {
      setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category, isActive: faq.isActive });
      setFaqDialog({ open: true, faq });
    } else {
      setFaqForm({ question: '', answer: '', category: 'General', isActive: true });
      setFaqDialog({ open: true, faq: null });
    }
  };

  const saveFaq = () => {
    const request: FaqRequest = {
      question: faqForm.question,
      answer: faqForm.answer,
      category: faqForm.category,
      isActive: faqForm.isActive,
      showOnLandingPage: true,
      showInHelpCenter: true,
      displayOrder: faqDialog.faq?.displayOrder || faqs.length + 1,
    };
    
    if (faqDialog.faq) {
      // Update existing
      updateFaqMutation.mutate(
        { id: faqDialog.faq.id, request },
        { onSuccess: () => setFaqDialog({ open: false, faq: null }) }
      );
    } else {
      // Create new
      createFaqMutation.mutate(request, {
        onSuccess: () => setFaqDialog({ open: false, faq: null }),
      });
    }
  };

  const handleDeleteFaq = (faq: Faq) => {
    setDeleteConfirm({ type: 'faq', id: faq.id, name: faq.question });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;
    
    switch (deleteConfirm.type) {
      case 'faq':
        deleteFaqMutation.mutate(deleteConfirm.id, {
          onSettled: () => setDeleteConfirm({ type: null, id: null, name: '' }),
        });
        break;
      case 'testimonial':
        deleteTestimonialMutation.mutate(deleteConfirm.id, {
          onSettled: () => setDeleteConfirm({ type: null, id: null, name: '' }),
        });
        break;
      case 'blog':
        deleteBlogMutation.mutate(deleteConfirm.id, {
          onSettled: () => setDeleteConfirm({ type: null, id: null, name: '' }),
        });
        break;
    }
  };

  // Testimonial handlers
  const openTestimonialDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setTestimonialForm({
        quote: testimonial.quote,
        authorName: testimonial.authorName,
        authorRole: testimonial.authorRole,
        companyName: testimonial.companyName || '',
        rating: testimonial.rating,
        isFeatured: testimonial.isFeatured,
        isActive: testimonial.isActive,
      });
      setTestimonialDialog({ open: true, testimonial });
    } else {
      setTestimonialForm({ quote: '', authorName: '', authorRole: '', companyName: '', rating: 5, isFeatured: false, isActive: true });
      setTestimonialDialog({ open: true, testimonial: null });
    }
  };

  const saveTestimonial = () => {
    const request: TestimonialRequest = {
      quote: testimonialForm.quote,
      authorName: testimonialForm.authorName,
      authorRole: testimonialForm.authorRole,
      companyName: testimonialForm.companyName || undefined,
      rating: testimonialForm.rating,
      isFeatured: testimonialForm.isFeatured,
      isActive: testimonialForm.isActive,
      displayOrder: testimonialDialog.testimonial?.displayOrder || testimonials.length + 1,
    };
    
    if (testimonialDialog.testimonial) {
      updateTestimonialMutation.mutate(
        { id: testimonialDialog.testimonial.id, request },
        { onSuccess: () => setTestimonialDialog({ open: false, testimonial: null }) }
      );
    } else {
      createTestimonialMutation.mutate(request, {
        onSuccess: () => setTestimonialDialog({ open: false, testimonial: null }),
      });
    }
  };

  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    setDeleteConfirm({ type: 'testimonial', id: testimonial.id, name: testimonial.authorName });
  };

  // Helper functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calculateReadingTime = (content: string) => {
    if (!content || typeof content !== 'string') return 1;
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const addTag = () => {
    if (tagInput.trim() && !blogForm.tags.includes(tagInput.trim())) {
      setBlogForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setBlogForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Blog handlers
  const openBlogDialog = async (blog?: BlogPost) => {
    if (blog) {
      // Open dialog immediately with list data, then fetch full detail for content
      setBlogForm({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImagePath: blog.featuredImagePath || '',
        authorName: blog.authorName,
        authorAvatarPath: blog.authorAvatarPath || '',
        category: blog.category || '',
        tags: blog.tags || [],
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        isPublished: blog.isPublished,
        isFeatured: blog.isFeatured,
      });
      setBlogDialog({ open: true, blog });
      setTagInput('');
      // Fetch full blog post detail (list endpoint omits content, tags, etc.)
      try {
        const fullPost = await adminCmsService.getBlogPost(blog.id);
        setBlogForm(prev => ({
          ...prev,
          content: fullPost.content || prev.content,
          authorAvatarPath: fullPost.authorAvatarPath || prev.authorAvatarPath,
          tags: fullPost.tags?.length ? fullPost.tags : prev.tags,
          metaTitle: fullPost.metaTitle || prev.metaTitle,
          metaDescription: fullPost.metaDescription || prev.metaDescription,
        }));
      } catch {
        // If detail fetch fails, continue with list data
      }
    } else {
      setBlogForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImagePath: '',
        authorName: '',
        authorAvatarPath: '',
        category: '',
        tags: [],
        metaTitle: '',
        metaDescription: '',
        isPublished: false,
        isFeatured: false,
      });
      setBlogDialog({ open: true, blog: null });
      setTagInput('');
    }
  };

  const saveBlog = () => {
    // Auto-generate slug if empty
    const finalSlug = blogForm.slug || generateSlug(blogForm.title);
    
    if (blogDialog.blog) {
      // For updates: use empty string "" (not undefined) for image fields to allow clearing.
      // Other optional fields use undefined to signal "no change".
      const request: UpdateBlogPostRequest = {
        title: blogForm.title,
        slug: finalSlug || undefined,
        excerpt: blogForm.excerpt || undefined,
        content: blogForm.content,
        featuredImagePath: blogForm.featuredImagePath,
        authorName: blogForm.authorName,
        authorAvatarPath: blogForm.authorAvatarPath,
        category: blogForm.category || undefined,
        tags: blogForm.tags.length > 0 ? blogForm.tags : undefined,
        metaTitle: blogForm.metaTitle || undefined,
        metaDescription: blogForm.metaDescription || undefined,
        isPublished: blogForm.isPublished,
        isFeatured: blogForm.isFeatured,
      };
      updateBlogMutation.mutate(
        { id: blogDialog.blog.id, request },
        { onSuccess: () => { setBlogDialog({ open: false, blog: null }); setTagInput(''); } }
      );
    } else {
      const request: CreateBlogPostRequest = {
        title: blogForm.title,
        slug: finalSlug || undefined,
        excerpt: blogForm.excerpt || undefined,
        content: blogForm.content,
        featuredImagePath: blogForm.featuredImagePath || undefined,
        authorName: blogForm.authorName,
        authorAvatarPath: blogForm.authorAvatarPath || undefined,
        category: blogForm.category || undefined,
        tags: blogForm.tags.length > 0 ? blogForm.tags : undefined,
        metaTitle: blogForm.metaTitle || undefined,
        metaDescription: blogForm.metaDescription || undefined,
        isPublished: blogForm.isPublished,
        isFeatured: blogForm.isFeatured,
      };
      createBlogMutation.mutate(request, {
        onSuccess: () => { setBlogDialog({ open: false, blog: null }); setTagInput(''); },
      });
    }
  };

  const handleDeleteBlog = (blog: BlogPost) => {
    setDeleteConfirm({ type: 'blog', id: blog.id, name: blog.title });
  };

  // Paginated data
  const faqTotalPages = Math.ceil(faqs.length / faqPageSize);
  const paginatedFaqs = faqs.slice((faqPage - 1) * faqPageSize, faqPage * faqPageSize);
  const testimonialTotalPages = Math.ceil(testimonials.length / testimonialPageSize);
  const paginatedTestimonials = testimonials.slice((testimonialPage - 1) * testimonialPageSize, testimonialPage * testimonialPageSize);
  const blogTotalPages = Math.ceil(blogPosts.length / blogPageSize);
  const paginatedBlogs = blogPosts.slice((blogPage - 1) * blogPageSize, blogPage * blogPageSize);
  const statsTotalPages = Math.ceil(statistics.length / statsPageSize);
  const paginatedStats = statistics.slice((statsPage - 1) * statsPageSize, statsPage * statsPageSize);

  // FAQ columns
  const faqColumns: DataTableColumn<Faq>[] = [
    {
      key: 'question', label: 'Question', sortable: true,
      render: (faq) => (
        <div>
          <p className="font-medium text-admin-foreground">{faq.question}</p>
          <p className="text-sm text-admin-muted-foreground line-clamp-1">{faq.answer}</p>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', hideOnMobile: true,
      render: (faq) => <Badge variant="outline" className="border-admin-border text-admin-foreground">{faq.category}</Badge>,
    },
    {
      key: 'status', label: 'Status',
      render: (faq) => faq.isActive
        ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Eye className="h-3 w-3 mr-1" />Active</Badge>
        : <Badge className="bg-gray-100 text-gray-500 border-gray-200"><EyeOff className="h-3 w-3 mr-1" />Hidden</Badge>,
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: (faq) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openFaqDialog(faq)} className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteFaq(faq)} disabled={deleteFaqMutation.isPending} className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  // Testimonial columns
  const testimonialColumns: DataTableColumn<Testimonial>[] = [
    {
      key: 'quote', label: 'Quote',
      render: (t) => <p className="text-admin-foreground line-clamp-2">&quot;{t.quote}&quot;</p>,
    },
    {
      key: 'author', label: 'Author', sortable: true,
      render: (t) => (
        <div>
          <p className="font-medium text-admin-foreground">{t.authorName}</p>
          <p className="text-sm text-admin-muted-foreground">{t.authorRole}, {t.companyName}</p>
        </div>
      ),
    },
    {
      key: 'rating', label: 'Rating', hideOnMobile: true,
      render: (t) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (t) => (
        <div className="flex flex-col gap-1">
          {t.isActive
            ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-fit">Active</Badge>
            : <Badge className="bg-gray-100 text-gray-500 border-gray-200 w-fit">Hidden</Badge>}
          {t.isFeatured && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 w-fit">Featured</Badge>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: (t) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openTestimonialDialog(t)} className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(t)} disabled={deleteTestimonialMutation.isPending} className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  // Blog columns
  const blogColumns: DataTableColumn<BlogPost>[] = [
    {
      key: 'title', label: 'Title', sortable: true,
      render: (post) => (
        <div>
          <p className="font-medium text-admin-foreground">{post.title}</p>
          <p className="text-sm text-admin-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{post.readingTimeMinutes} min read</p>
        </div>
      ),
    },
    { key: 'author', label: 'Author', sortable: true, render: (post) => <span className="text-admin-foreground">{post.authorName}</span> },
    {
      key: 'category', label: 'Category', hideOnMobile: true,
      render: (post) => post.category ? <Badge variant="outline" className="border-admin-border text-admin-foreground">{post.category}</Badge> : null,
    },
    {
      key: 'status', label: 'Status',
      render: (post) => (
        <div className="flex flex-col gap-1">
          {post.isPublished
            ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-fit"><Eye className="h-3 w-3 mr-1" />Published</Badge>
            : <Badge className="bg-gray-100 text-gray-500 border-gray-200 w-fit"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>}
          {post.isFeatured && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 w-fit"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: (post) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            title={post.isPublished ? 'Unpublish' : 'Publish'}
            onClick={() => {
              updateBlogMutation.mutate({
                id: post.id,
                request: {
                  title: post.title,
                  slug: post.slug,
                  excerpt: post.excerpt ?? undefined,
                  content: post.content,
                  featuredImagePath: post.featuredImagePath ?? undefined,
                  authorName: post.authorName,
                  authorAvatarPath: post.authorAvatarPath ?? undefined,
                  category: post.category ?? undefined,
                  tags: post.tags,
                  metaTitle: post.metaTitle ?? undefined,
                  metaDescription: post.metaDescription ?? undefined,
                  isPublished: !post.isPublished,
                  isFeatured: post.isFeatured,
                },
              });
            }}
            disabled={updateBlogMutation.isPending}
            className={`h-8 w-8 ${post.isPublished ? 'text-green-400 hover:text-green-500 hover:bg-green-500/10' : 'text-admin-muted-foreground hover:text-admin-foreground'}`}
          >
            {post.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openBlogDialog(post)} className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(post)} disabled={deleteBlogMutation.isPending} className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  // Statistics columns
  const statsColumns: DataTableColumn<(typeof statistics)[number]>[] = [
    { key: 'label', label: 'Label', sortable: true, render: (s) => <span className="font-medium text-admin-foreground">{s.label}</span> },
    { key: 'value', label: 'Value', render: (s) => <span className="text-admin-foreground">{s.value}</span> },
    { key: 'order', label: 'Order', hideOnMobile: true, render: (s) => <span className="text-admin-muted-foreground">{s.displayOrder}</span> },
    {
      key: 'status', label: 'Status',
      render: (s) => s.isActive
        ? <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
        : <Badge className="bg-gray-100 text-gray-500 border-gray-200">Hidden</Badge>,
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const,
      render: () => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Content Management"
        description="Manage FAQs, testimonials, and landing page content"
        isError={hasError}
        errorMessage="API Error - Unable to fetch CMS data"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-admin-muted border-admin-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="faqs" className="data-[state=active]:bg-admin-card">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="data-[state=active]:bg-admin-card">
            <Quote className="h-4 w-4 mr-2" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="pages" className="data-[state=active]:bg-admin-card">
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-admin-card">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="companies" className="data-[state=active]:bg-admin-card">
            <Building className="h-4 w-4 mr-2" />
            Trusted Companies
          </TabsTrigger>
          <TabsTrigger value="blogs" className="data-[state=active]:bg-admin-card">
            <Newspaper className="h-4 w-4 mr-2" />
            Blog Posts
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-foreground">Frequently Asked Questions</h2>
              <p className="text-sm text-admin-muted-foreground">Manage FAQs shown on the landing page and help center</p>
            </div>
            <Button onClick={() => openFaqDialog()} className="bg-[#FF6900] hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
          <DataTable columns={faqColumns} data={paginatedFaqs} loading={faqsLoading} emptyMessage="No FAQs found" emptyDescription="Create your first FAQ to get started" getRowId={(row) => row.id} />
          <Pagination currentPage={faqPage} totalPages={faqTotalPages} totalItems={faqs.length} pageSize={faqPageSize} onPageChange={setFaqPage} onPageSizeChange={setFaqPageSize} />
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-foreground">Testimonials</h2>
              <p className="text-sm text-admin-muted-foreground">Manage customer testimonials shown on the landing page</p>
            </div>
            <Button onClick={() => openTestimonialDialog()} className="bg-[#FF6900] hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
          <DataTable columns={testimonialColumns} data={paginatedTestimonials} loading={testimonialsLoading} emptyMessage="No testimonials found" emptyDescription="Add your first customer testimonial" getRowId={(row) => row.id} />
          <Pagination currentPage={testimonialPage} totalPages={testimonialTotalPages} totalItems={testimonials.length} pageSize={testimonialPageSize} onPageChange={setTestimonialPage} onPageSizeChange={setTestimonialPageSize} />
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="mt-6">
          <Card className="shadow-base bg-admin-card border-admin-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-admin-foreground">Landing Pages</CardTitle>
                <CardDescription className="text-admin-muted-foreground">
                  Manage landing page content and sections
                </CardDescription>
              </div>
              <Button className="bg-[#FF6900] hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8 text-admin-muted-foreground">
                  No pages found. Create your first page to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.map((page) => (
                    <Card key={page.id} className="bg-admin-muted border-admin-border hover:border-[#FF6900]/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-admin-foreground">{page.title}</p>
                            <p className="text-sm text-admin-muted-foreground">{page.slug}</p>
                          </div>
                          <FileText className="h-5 w-5 text-admin-muted-foreground" />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-admin-muted-foreground">
                          <Badge variant="outline" className={page.isPublished ? 'border-green-500/30 text-green-400' : 'border-gray-200 text-gray-500'}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <span>Updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-foreground">Platform Statistics</h2>
              <p className="text-sm text-admin-muted-foreground">Numbers displayed on the landing page</p>
            </div>
            <Button className="bg-[#FF6900] hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Statistic
            </Button>
          </div>
          <DataTable columns={statsColumns} data={paginatedStats} loading={statsLoading} emptyMessage="No statistics found" emptyDescription="Add your first statistic to display on the landing page" getRowId={(row) => row.id} />
          <Pagination currentPage={statsPage} totalPages={statsTotalPages} totalItems={statistics.length} pageSize={statsPageSize} onPageChange={setStatsPage} onPageSizeChange={setStatsPageSize} />
        </TabsContent>

        {/* Trusted Companies Tab */}
        <TabsContent value="companies" className="mt-6">
          <Card className="shadow-base bg-admin-card border-admin-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-admin-foreground">Trusted Companies</CardTitle>
                <CardDescription className="text-admin-muted-foreground">
                  Company logos displayed on the landing page
                </CardDescription>
              </div>
              <Button className="bg-[#FF6900] hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-admin-muted-foreground">
                  No trusted companies found. Add companies to display on the landing page.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {companies.map((company: { id: string; name: string; logoPath: string | null }) => (
                    <div
                      key={company.id}
                      className="relative group p-4 bg-admin-muted rounded-lg border border-admin-border hover:border-[#FF6900]/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center h-20">
                        {company.logoPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={company.logoPath} alt={company.name} className="h-8 w-auto mb-2" />
                        ) : (
                          <Building className="h-8 w-8 text-admin-muted-foreground mb-2" />
                        )}
                        <p className="text-sm text-admin-foreground text-center">{company.name}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blogs" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-foreground">Blog Posts</h2>
              <p className="text-sm text-admin-muted-foreground">Manage blog posts for the coming soon landing page</p>
            </div>
            <Button onClick={() => openBlogDialog()} className="bg-[#FF6900] hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Blog Post
            </Button>
          </div>
          <DataTable columns={blogColumns} data={paginatedBlogs} loading={blogsLoading} emptyMessage="No blog posts found" emptyDescription="Create your first blog post to get started" getRowId={(row) => row.id} />
          <Pagination currentPage={blogPage} totalPages={blogTotalPages} totalItems={blogPosts.length} pageSize={blogPageSize} onPageChange={setBlogPage} onPageSizeChange={setBlogPageSize} />
        </TabsContent>
      </Tabs>

      {/* FAQ Dialog */}
      <AdminModal open={faqDialog.open} onOpenChange={(open) => setFaqDialog({ open, faq: open ? faqDialog.faq : null })}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>
              {faqDialog.faq ? 'Edit FAQ' : 'Add FAQ'}
            </AdminModalTitle>
            <AdminModalDescription>
              {faqDialog.faq ? 'Update this frequently asked question.' : 'Create a new FAQ entry for the landing page.'}
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Question</Label>
              <Input
                value={faqForm.question}
                onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Answer</Label>
              <Textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                rows={4}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-admin-foreground text-sm font-medium">Active</Label>
              <Switch
                checked={faqForm.isActive}
                onCheckedChange={(checked) => setFaqForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setFaqDialog({ open: false, faq: null })} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button
              onClick={saveFaq}
              disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {(createFaqMutation.isPending || updateFaqMutation.isPending) ? 'Saving...' : 'Save'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Testimonial Dialog */}
      <AdminModal open={testimonialDialog.open} onOpenChange={(open) => setTestimonialDialog({ open, testimonial: open ? testimonialDialog.testimonial : null })}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>
              {testimonialDialog.testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </AdminModalTitle>
            <AdminModalDescription>
              {testimonialDialog.testimonial ? 'Update customer testimonial details.' : 'Add a new customer testimonial to display on the landing page.'}
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Quote</Label>
              <Textarea
                value={testimonialForm.quote}
                onChange={(e) => setTestimonialForm(prev => ({ ...prev, quote: e.target.value }))}
                rows={3}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Author Name</Label>
                <Input
                  value={testimonialForm.authorName}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, authorName: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Author Role</Label>
                <Input
                  value={testimonialForm.authorRole}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, authorRole: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                />
              </div>
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Company Name</Label>
              <Input
                value={testimonialForm.companyName}
                onChange={(e) => setTestimonialForm(prev => ({ ...prev, companyName: e.target.value }))}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-admin-foreground text-sm font-medium">Featured</Label>
              <Switch
                checked={testimonialForm.isFeatured}
                onCheckedChange={(checked) => setTestimonialForm(prev => ({ ...prev, isFeatured: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-admin-foreground text-sm font-medium">Active</Label>
              <Switch
                checked={testimonialForm.isActive}
                onCheckedChange={(checked) => setTestimonialForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setTestimonialDialog({ open: false, testimonial: null })} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button
              onClick={saveTestimonial}
              disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {(createTestimonialMutation.isPending || updateTestimonialMutation.isPending) ? 'Saving...' : 'Save'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Blog Dialog */}
      <AdminModal open={blogDialog.open} onOpenChange={(open) => setBlogDialog({ open, blog: open ? blogDialog.blog : null })}>
        <AdminModalContent size="xl">
          <AdminModalHeader>
            <AdminModalTitle>
              {blogDialog.blog ? 'Edit Blog Post' : 'Add Blog Post'}
            </AdminModalTitle>
            <AdminModalDescription>
              {blogDialog.blog ? 'Update the blog post content and settings.' : 'Create a new blog post for the landing page.'}
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">Basic Information</h3>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Title *</Label>
                <Input
                  value={blogForm.title}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                  placeholder="Blog post title"
                />
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Slug (URL path)</Label>
                <Input
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                  placeholder="Auto-generated from title if empty"
                />
                {blogForm.title && !blogForm.slug && (
                  <p className="text-xs text-admin-muted-foreground mt-1">
                    Will be: {generateSlug(blogForm.title)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Author Name *</Label>
                  <Input
                    value={blogForm.authorName}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, authorName: e.target.value }))}
                    className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Category</Label>
                  <Input
                    value={blogForm.category}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    placeholder="e.g., Product Updates"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">Content</h3>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Excerpt</Label>
                <Textarea
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  maxLength={200}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                  placeholder="Brief summary for blog list cards (max 200 chars)"
                />
                <p className="text-xs text-admin-muted-foreground mt-1">
                  {blogForm.excerpt.length}/200 characters
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-admin-foreground text-sm font-medium">Content (Markdown supported) *</Label>
                  <span className="text-xs text-admin-muted-foreground">
                    {calculateReadingTime(blogForm.content)} min read
                  </span>
                </div>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <Textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={12}
                      className="bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground font-mono text-sm"
                      placeholder="Write your blog post content here...\n\nMarkdown formatting supported:\n# Heading\n**Bold** *Italic*\n- List item\n[Link](url)"
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[288px] max-h-[500px] overflow-y-auto rounded-md border border-admin-border bg-white p-6">
                      {blogForm.content ? (
                        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#6B2D9E] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-ul:text-gray-600 prose-ol:text-gray-600 prose-li:marker:text-[#6B2D9E] prose-blockquote:border-l-[#6B2D9E] prose-blockquote:bg-purple-50/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-table:border-collapse prose-th:bg-gray-100 prose-th:text-gray-900 prose-th:font-semibold prose-td:text-gray-600">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, blogSanitizeSchema]]}>
                            {blogForm.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-admin-muted-foreground text-sm italic">Nothing to preview yet. Start writing in the Write tab.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">Images</h3>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Featured Image</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={blogForm.featuredImagePath}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, featuredImagePath: e.target.value }))}
                    className="flex-1 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    placeholder="URL or upload an image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => document.getElementById('featured-image-upload')?.click()}
                  >
                    Upload
                  </Button>
                  {blogForm.featuredImagePath && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-red-500 hover:text-red-600"
                      onClick={() => setBlogForm(prev => ({ ...prev, featuredImagePath: '' }))}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    id="featured-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const result = await adminCmsService.uploadImage(file);
                        setBlogForm(prev => ({ ...prev, featuredImagePath: result.url }));
                      } catch {
                        alert('Failed to upload image. Max size: 10MB.');
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
                <p className="text-xs text-admin-muted-foreground mt-1">
                  Upload or paste a URL. Recommended: 1200x630px for social sharing. Max 10MB.
                </p>
                {blogForm.featuredImagePath && (
                  <div className="mt-2 relative w-full max-w-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blogForm.featuredImagePath} alt="Featured preview" className="rounded-md border border-admin-border max-h-32 object-cover" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Author Avatar</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={blogForm.authorAvatarPath}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, authorAvatarPath: e.target.value }))}
                    className="flex-1 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    placeholder="URL or upload an avatar"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => document.getElementById('avatar-image-upload')?.click()}
                  >
                    Upload
                  </Button>
                  {blogForm.authorAvatarPath && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-red-500 hover:text-red-600"
                      onClick={() => setBlogForm(prev => ({ ...prev, authorAvatarPath: '' }))}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    id="avatar-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const result = await adminCmsService.uploadImage(file);
                        setBlogForm(prev => ({ ...prev, authorAvatarPath: result.url }));
                      } catch {
                        alert('Failed to upload image. Max size: 10MB.');
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
                {blogForm.authorAvatarPath && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blogForm.authorAvatarPath} alt="Avatar preview" className="rounded-full border border-admin-border h-12 w-12 object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">Tags</h3>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Add Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                    placeholder="Type a tag and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="border-admin-border text-admin-foreground hover:bg-admin-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {blogForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {blogForm.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-admin-muted text-admin-foreground border-admin-border flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">SEO Metadata</h3>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Meta Title</Label>
                <Input
                  value={blogForm.metaTitle}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                  maxLength={70}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                  placeholder="SEO title (defaults to post title if empty)"
                />
                <p className="text-xs text-admin-muted-foreground mt-1">
                  {blogForm.metaTitle.length}/70 characters (Google displays ~60)
                </p>
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Meta Description</Label>
                <Textarea
                  value={blogForm.metaDescription}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  maxLength={180}
                  className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
                  placeholder="SEO description for search results (defaults to excerpt if empty)"
                />
                <p className="text-xs text-admin-muted-foreground mt-1">
                  {blogForm.metaDescription.length}/180 characters (Google displays ~160)
                </p>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-admin-foreground">Publishing Options</h3>
              <div className="flex items-center justify-between p-3 bg-admin-muted/30 rounded-lg">
                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Featured Post</Label>
                  <p className="text-xs text-admin-muted-foreground mt-0.5">
                    Show this post prominently on the blog page
                  </p>
                </div>
                <Switch
                  checked={blogForm.isFeatured}
                  onCheckedChange={(checked) => setBlogForm(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-admin-muted/30 rounded-lg">
                <div>
                  <Label className="text-admin-foreground text-sm font-medium">Publish</Label>
                  <p className="text-xs text-admin-muted-foreground mt-0.5">
                    Make this post visible to the public
                  </p>
                </div>
                <Switch
                  checked={blogForm.isPublished}
                  onCheckedChange={(checked) => setBlogForm(prev => ({ ...prev, isPublished: checked }))}
                />
              </div>
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setBlogDialog({ open: false, blog: null })} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button
              onClick={saveBlog}
              disabled={createBlogMutation.isPending || updateBlogMutation.isPending || !blogForm.title || !blogForm.authorName || !blogForm.content}
              className="bg-[#FF6900] hover:bg-orange-600 text-white"
            >
              {(createBlogMutation.isPending || updateBlogMutation.isPending) ? 'Saving...' : blogForm.isPublished ? 'Publish' : 'Save Draft'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminModal open={!!deleteConfirm.id} onOpenChange={(open) => !open && setDeleteConfirm({ type: null, id: null, name: '' })}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>
              Delete {deleteConfirm.type === 'faq' ? 'FAQ' : deleteConfirm.type === 'testimonial' ? 'Testimonial' : 'Blog Post'}
            </AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to delete &quot;{deleteConfirm.name}&quot;? This action cannot be undone.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ type: null, id: null, name: '' })}
              disabled={deleteFaqMutation.isPending || deleteTestimonialMutation.isPending || deleteBlogMutation.isPending}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteFaqMutation.isPending || deleteTestimonialMutation.isPending || deleteBlogMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {(deleteFaqMutation.isPending || deleteTestimonialMutation.isPending || deleteBlogMutation.isPending) ? 'Deleting...' : 'Delete'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
