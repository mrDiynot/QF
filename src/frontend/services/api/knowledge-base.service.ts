/**
 * Knowledge Base Service
 * API service for managing knowledge base articles, documents, and FAQs
 */

import { apiClient } from '@/lib/axios';

// Types
export interface KnowledgeBaseArticle {
  id: string;
  businessId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  priority: number;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  priority?: number;
  isPublished?: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  priority?: number;
  isPublished?: boolean;
}

export interface KnowledgeBaseDocument {
  id: string;
  businessId: string;
  name: string;
  type: 'document' | 'url' | 'text';
  status: 'processing' | 'ready' | 'error';
  size?: number;
  url?: string;
  content?: string;
  chunks?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentRequest {
  file: File;
}

export interface AddUrlRequest {
  url: string;
  name?: string;
}

export interface KnowledgeBaseFaq {
  id: string;
  businessId: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
  priority?: number;
}

export interface UpdateFaqRequest {
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string[];
  priority?: number;
  isActive?: boolean;
}

export interface KnowledgeBaseStats {
  totalArticles: number;
  totalDocuments: number;
  totalFaqs: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  lastUpdated: string;
}

export interface KnowledgeBaseCategory {
  name: string;
  count: number;
}

// Service
export const knowledgeBaseService = {
  // Articles
  getArticles: async (params?: { category?: string; isPublished?: boolean }): Promise<KnowledgeBaseArticle[]> => {
    try {
      const response = await apiClient.get<KnowledgeBaseArticle[]>('/knowledge-base', { params });
      return response.data || [];
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get articles:', error);
      return [];
    }
  },

  getArticle: async (id: string): Promise<KnowledgeBaseArticle | null> => {
    try {
      const response = await apiClient.get<KnowledgeBaseArticle>(`/knowledge-base/${id}`);
      return response.data;
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get article:', error);
      return null;
    }
  },

  createArticle: async (data: CreateArticleRequest): Promise<KnowledgeBaseArticle> => {
    const response = await apiClient.post<KnowledgeBaseArticle>('/knowledge-base', data);
    return response.data;
  },

  updateArticle: async (id: string, data: UpdateArticleRequest): Promise<KnowledgeBaseArticle> => {
    const response = await apiClient.put<KnowledgeBaseArticle>(`/knowledge-base/${id}`, data);
    return response.data;
  },

  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/${id}`);
  },

  // Documents
  getDocuments: async (): Promise<KnowledgeBaseDocument[]> => {
    try {
      const response = await apiClient.get<KnowledgeBaseDocument[]>('/knowledge-base/documents');
      return response.data || [];
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get documents:', error);
      return [];
    }
  },

  uploadDocument: async (file: File): Promise<KnowledgeBaseDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<KnowledgeBaseDocument>('/knowledge-base/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addUrl: async (data: AddUrlRequest): Promise<KnowledgeBaseDocument> => {
    const response = await apiClient.post<KnowledgeBaseDocument>('/knowledge-base/urls', data);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/documents/${id}`);
  },

  // FAQs
  getFaqs: async (params?: { category?: string; isActive?: boolean }): Promise<KnowledgeBaseFaq[]> => {
    try {
      const response = await apiClient.get<KnowledgeBaseFaq[]>('/knowledge-base/faqs', { params });
      return response.data || [];
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get FAQs:', error);
      return [];
    }
  },

  createFaq: async (data: CreateFaqRequest): Promise<KnowledgeBaseFaq> => {
    const response = await apiClient.post<KnowledgeBaseFaq>('/knowledge-base/faqs', {
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      keywords: data.keywords || null,
      priority: data.priority || 50,
    });
    return response.data;
  },

  updateFaq: async (id: string, data: UpdateFaqRequest): Promise<KnowledgeBaseFaq> => {
    const response = await apiClient.put<KnowledgeBaseFaq>(`/knowledge-base/faqs/${id}`, data);
    return response.data;
  },

  deleteFaq: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/faqs/${id}`);
  },

  // Stats & Categories
  getStats: async (): Promise<KnowledgeBaseStats> => {
    try {
      const response = await apiClient.get<KnowledgeBaseStats>('/knowledge-base/stats');
      return response.data || {
        totalArticles: 0,
        totalDocuments: 0,
        totalFaqs: 0,
        storageUsedBytes: 0,
        storageLimitBytes: 100 * 1024 * 1024, // 100MB default
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get stats:', error);
      return {
        totalArticles: 0,
        totalDocuments: 0,
        totalFaqs: 0,
        storageUsedBytes: 0,
        storageLimitBytes: 100 * 1024 * 1024,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  getCategories: async (): Promise<KnowledgeBaseCategory[]> => {
    try {
      const response = await apiClient.get<KnowledgeBaseCategory[]>('/knowledge-base/categories');
      return response.data || [];
    } catch (error) {
      console.error('[KnowledgeBase] Failed to get categories:', error);
      return [];
    }
  },

  // Search
  search: async (query: string): Promise<KnowledgeBaseArticle[]> => {
    try {
      const response = await apiClient.get<KnowledgeBaseArticle[]>('/knowledge-base/search', {
        params: { q: query },
      });
      return response.data || [];
    } catch (error) {
      console.error('[KnowledgeBase] Failed to search:', error);
      return [];
    }
  },
};
