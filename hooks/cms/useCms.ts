'use client';

import { useQuery } from '@tanstack/react-query';
import { config } from '@/lib/config';
import { queryConfig } from '@/lib/query-config';

// Types for CMS data
export interface LandingPageStatistic {
  id: string;
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface TrustedCompany {
  id: string;
  name: string;
  logoPath: string | null;
  websiteLink: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  showOnLandingPage: boolean;
  showInHelpCenter: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  avatarPath: string | null;
  companyLogoPath: string | null;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface PricingAddOn {
  id: string;
  title: string;
  price: string;
  unit: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PricingFeatureComparison {
  id: string;
  category: string;
  featureName: string;
  freeFlowValue: string;
  smartFlowValue: string;
  ultraFlowValue: string;
  enterpriseValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FeatureModule {
  id: string;
  title: string;
  description: string;
  iconName: string;
  gradient: string;
  displayOrder: number;
  isActive: boolean;
  section: string;
}

export interface PrebuiltJourney {
  id: string;
  title: string;
  description: string;
  iconName: string;
  gradient: string;
  backgroundColor: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
}

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

export interface CmsPricingPlan {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  monthlyPrice: string | number | null;
  quarterlyPrice?: string | number | null;
  annualPrice: string | number | null;
  pricePeriod?: string;
  onboardingPrice?: number | null;
  onboardingRequired?: boolean;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  features?: string[];
  usageLimits?: string[];
  coreFeatures?: string[];
  ctaText?: string;
  ctaLink?: string;
}

// Note: The backend now returns onboardingPrice and onboardingRequired fields directly

export interface LandingPageData {
  statistics: LandingPageStatistic[];
  trustedCompanies: TrustedCompany[];
  faqs: Faq[];
  testimonials: Testimonial[];
  featureModules: FeatureModule[];
  lifecycleSteps: FeatureModule[];
  featureCards: FeatureModule[];
  prebuiltJourneys: PrebuiltJourney[];
  pricingPlans: CmsPricingPlan[];
  pricingAddOns: PricingAddOn[];
  featureComparisons: PricingFeatureComparison[];
}

// Query keys for caching
export const publicCmsKeys = {
  all: ['public', 'cms'] as const,
  landingPage: () => [...publicCmsKeys.all, 'landing-page'] as const,
  faqs: () => [...publicCmsKeys.all, 'faqs'] as const,
  testimonials: () => [...publicCmsKeys.all, 'testimonials'] as const,
  pricing: () => [...publicCmsKeys.all, 'pricing'] as const,
  blogs: () => [...publicCmsKeys.all, 'blogs'] as const,
  blog: (slug: string) => [...publicCmsKeys.all, 'blog', slug] as const,
};

// Helper to get base URL for public API calls
const getPublicApiUrl = (path: string) => {
  const baseUrl = config.api.baseUrl || 'https://localhost:5001';
  return `${baseUrl}${path}`;
};

/**
 * Fetches all landing page data from the public CMS API
 */
export function useLandingPageData() {
  return useQuery<LandingPageData>({
    queryKey: publicCmsKeys.landingPage(),
    queryFn: async () => {
      const response = await fetch(getPublicApiUrl('/api/v1/public/cms/landing-page'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch landing page data');
      return response.json();
    },
    ...queryConfig.static, // CMS content is static and rarely changes
    staleTime: 60 * 60 * 1000, // 1 hour - matches backend LongTerm cache (3600s)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection
  });
}

/**
 * Fetches only FAQs from the public CMS API
 */
export function usePublicFaqs() {
  return useQuery<Faq[]>({
    queryKey: publicCmsKeys.faqs(),
    queryFn: async () => {
      const response = await fetch(getPublicApiUrl('/api/v1/public/cms/faqs'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    },
    ...queryConfig.static,
  });
}

/**
 * Fetches only testimonials from the public CMS API
 */
export function usePublicTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: publicCmsKeys.testimonials(),
    queryFn: async () => {
      const response = await fetch(getPublicApiUrl('/api/v1/public/cms/testimonials'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      return response.json();
    },
    ...queryConfig.static,
  });
}

/**
 * Fetches published blog posts from the public CMS API
 */
export function usePublicBlogs() {
  return useQuery<BlogPostListItem[]>({
    queryKey: publicCmsKeys.blogs(),
    queryFn: async () => {
      const response = await fetch(getPublicApiUrl('/api/v1/public/cms/blogs'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
    ...queryConfig.static,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend cache
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetches a single published blog post by slug from the public CMS API
 */
export function usePublicBlog(slug: string) {
  return useQuery<BlogPost>({
    queryKey: publicCmsKeys.blog(slug),
    queryFn: async () => {
      const response = await fetch(getPublicApiUrl(`/api/v1/public/cms/blogs/${slug}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch blog post');
      return response.json();
    },
    enabled: !!slug,
    ...queryConfig.detail,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend cache
  });
}

