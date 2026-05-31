/**
 * Knowledge Base React Query Hooks
 * Provides hooks for knowledge base management with caching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  knowledgeBaseService,
  type CreateArticleRequest,
  type UpdateArticleRequest,
  type CreateFaqRequest,
  type UpdateFaqRequest,
  type AddUrlRequest,
} from '@/services/api/knowledge-base.service';
import { handleApiError } from '@/lib/axios';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

/** Query key factory for knowledge base */
export const knowledgeBaseKeys = {
  all: ['knowledge-base'] as const,
  articles: () => [...knowledgeBaseKeys.all, 'articles'] as const,
  article: (id: string) => [...knowledgeBaseKeys.all, 'articles', id] as const,
  documents: () => [...knowledgeBaseKeys.all, 'documents'] as const,
  faqs: () => [...knowledgeBaseKeys.all, 'faqs'] as const,
  stats: () => [...knowledgeBaseKeys.all, 'stats'] as const,
  categories: () => [...knowledgeBaseKeys.all, 'categories'] as const,
  search: (query: string) => [...knowledgeBaseKeys.all, 'search', query] as const,
};

// Articles Hooks
export const useKnowledgeBaseArticles = (params?: { category?: string; isPublished?: boolean }) => {
  return useQuery({
    queryKey: [...knowledgeBaseKeys.articles(), params],
    queryFn: () => knowledgeBaseService.getArticles(params),
    ...queryConfig.static, // Knowledge base articles rarely change
  });
};

export const useKnowledgeBaseArticle = (id: string) => {
  return useQuery({
    queryKey: knowledgeBaseKeys.article(id),
    queryFn: () => knowledgeBaseService.getArticle(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleRequest) => knowledgeBaseService.createArticle(data),
    onSuccess: () => {
      toast.success('Article created successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all, [['ai-readiness']]);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleRequest }) =>
      knowledgeBaseService.updateArticle(id, data),
    onSuccess: (_, variables) => {
      toast.success('Article updated successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all);
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.article(variables.id), refetchType: 'all' });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseService.deleteArticle(id),
    onSuccess: () => {
      toast.success('Article deleted successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all, [['ai-readiness']]);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

// Documents Hooks
export const useKnowledgeBaseDocuments = () => {
  return useQuery({
    queryKey: knowledgeBaseKeys.documents(),
    queryFn: () => knowledgeBaseService.getDocuments(),
    ...queryConfig.static,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => knowledgeBaseService.uploadDocument(file),
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all, [['ai-readiness']]);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useAddUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddUrlRequest) => knowledgeBaseService.addUrl(data),
    onSuccess: () => {
      toast.success('URL added successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseService.deleteDocument(id),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      invalidateListQueries(queryClient, knowledgeBaseKeys.all);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

// FAQs Hooks
export const useKnowledgeBaseFaqs = (params?: { category?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: [...knowledgeBaseKeys.faqs(), params],
    queryFn: () => knowledgeBaseService.getFaqs(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFaqRequest) => knowledgeBaseService.createFaq(data),
    onSuccess: () => {
      toast.success('FAQ created successfully');
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.faqs() });
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.stats() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFaqRequest }) =>
      knowledgeBaseService.updateFaq(id, data),
    onSuccess: () => {
      toast.success('FAQ updated successfully');
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.faqs() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseService.deleteFaq(id),
    onSuccess: () => {
      toast.success('FAQ deleted successfully');
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.faqs() });
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.stats() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

// Stats & Categories Hooks
export const useKnowledgeBaseStats = () => {
  return useQuery({
    queryKey: knowledgeBaseKeys.stats(),
    queryFn: () => knowledgeBaseService.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useKnowledgeBaseCategories = () => {
  return useQuery({
    queryKey: knowledgeBaseKeys.categories(),
    queryFn: () => knowledgeBaseService.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
};

// Search Hook
export const useKnowledgeBaseSearch = (query: string) => {
  return useQuery({
    queryKey: knowledgeBaseKeys.search(query),
    queryFn: () => knowledgeBaseService.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
};
