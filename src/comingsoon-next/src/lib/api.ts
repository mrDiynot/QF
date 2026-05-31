import axios from 'axios';

// Use the Next.js proxy to avoid CORS issues when calling from the browser.
// The proxy rewrites /api/proxy/* → NEXT_PUBLIC_API_URL/api/v1/* server-side.
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.qualiflow.ai') + '/api/v1'
  : '/api/proxy';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Blog API
export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImagePath: string | null;
  authorName: string;
  authorAvatarPath: string | null;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImagePath: string | null;
  authorName: string;
  authorAvatarPath: string | null;
  category: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export const blogApi = {
  getPublishedPosts: async (): Promise<BlogPostListItem[]> => {
    const response = await api.get<BlogPostListItem[]>('/public/cms/blogs');
    return response.data;
  },

  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get<BlogPost>(`/public/cms/blogs/${slug}`);
    return response.data;
  },
};

// Landing Page Data API
export interface LandingPageData {
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
    isActive: boolean;
  }>;
  testimonials: Array<{
    id: string;
    quote: string;
    authorName: string;
    authorRole: string;
    companyName: string | null;
    avatarPath: string | null;
    rating: number;
    isFeatured: boolean;
    isActive: boolean;
  }>;
  statistics: Array<{
    id: string;
    value: string;
    label: string;
    displayOrder: number;
    isActive: boolean;
  }>;
  trustedCompanies: Array<{
    id: string;
    name: string;
    logoPath: string | null;
    websiteLink: string | null;
    displayOrder: number;
    isActive: boolean;
  }>;
}

export const landingApi = {
  getLandingPageData: async (): Promise<LandingPageData> => {
    const response = await api.get<LandingPageData>('/public/cms/landing-page');
    return response.data;
  },
};

export default api;
