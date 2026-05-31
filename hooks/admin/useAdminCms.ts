'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminCmsService } from '@/services/api/admin.service';
import type {
  FaqRequest,
  TestimonialRequest,
  CmsPageRequest,
  UpdateStatisticRequest,
  UpdateTrustedCompanyRequest,
  CmsPricingAddOnRequest,
  PricingFeatureComparisonRequest,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '@/types/admin';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const cmsKeys = {
  all: ['admin', 'cms'] as const,
  faqs: () => [...cmsKeys.all, 'faqs'] as const,
  faq: (id: string) => [...cmsKeys.faqs(), id] as const,
  testimonials: () => [...cmsKeys.all, 'testimonials'] as const,
  testimonial: (id: string) => [...cmsKeys.testimonials(), id] as const,
  pages: () => [...cmsKeys.all, 'pages'] as const,
  page: (id: string) => [...cmsKeys.pages(), id] as const,
  statistics: () => [...cmsKeys.all, 'statistics'] as const,
  trustedCompanies: () => [...cmsKeys.all, 'trusted-companies'] as const,
  pricingAddOns: () => [...cmsKeys.all, 'pricing-addons'] as const,
  featureComparisons: () => [...cmsKeys.all, 'feature-comparisons'] as const,
  blogPosts: () => [...cmsKeys.all, 'blog-posts'] as const,
  blogPost: (id: string) => [...cmsKeys.blogPosts(), id] as const,
};

// ============================================================================
// FAQs
// ============================================================================

export function useFaqs() {
  return useQuery({
    queryKey: cmsKeys.faqs(),
    queryFn: () => adminCmsService.getFaqs(),
    ...queryConfig.static, // CMS content doesn't change often
  });
}

export function useFaq(id: string) {
  return useQuery({
    queryKey: cmsKeys.faq(id),
    queryFn: () => adminCmsService.getFaq(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: FaqRequest) => adminCmsService.createFaq(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.faqs());
      toast.success('FAQ created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create FAQ');
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: FaqRequest }) =>
      adminCmsService.updateFaq(id, request),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, cmsKeys.faqs());
      queryClient.invalidateQueries({ queryKey: cmsKeys.faq(id), refetchType: 'all' });
      toast.success('FAQ updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update FAQ');
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCmsService.deleteFaq(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.faqs());
      toast.success('FAQ deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete FAQ');
    },
  });
}

// ============================================================================
// Testimonials
// ============================================================================

export function useTestimonials() {
  return useQuery({
    queryKey: cmsKeys.testimonials(),
    queryFn: () => adminCmsService.getTestimonials(),
    ...queryConfig.static,
  });
}

export function useTestimonial(id: string) {
  return useQuery({
    queryKey: cmsKeys.testimonial(id),
    queryFn: () => adminCmsService.getTestimonial(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TestimonialRequest) => adminCmsService.createTestimonial(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.testimonials());
      toast.success('Testimonial created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create testimonial');
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: TestimonialRequest }) =>
      adminCmsService.updateTestimonial(id, request),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, cmsKeys.testimonials());
      queryClient.invalidateQueries({ queryKey: cmsKeys.testimonial(id), refetchType: 'all' });
      toast.success('Testimonial updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update testimonial');
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCmsService.deleteTestimonial(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.testimonials());
      toast.success('Testimonial deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete testimonial');
    },
  });
}

// ============================================================================
// CMS Pages
// ============================================================================

export function useCmsPages() {
  return useQuery({
    queryKey: cmsKeys.pages(),
    queryFn: () => adminCmsService.getPages(),
    ...queryConfig.static,
  });
}

export function useCmsPage(id: string) {
  return useQuery({
    queryKey: cmsKeys.page(id),
    queryFn: () => adminCmsService.getPage(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CmsPageRequest) => adminCmsService.createPage(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.pages());
      toast.success('Page created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create page');
    },
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CmsPageRequest }) =>
      adminCmsService.updatePage(id, request),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, cmsKeys.pages());
      queryClient.invalidateQueries({ queryKey: cmsKeys.page(id), refetchType: 'all' });
      toast.success('Page updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update page');
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCmsService.deletePage(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.pages());
    },
  });
}

// ============================================================================
// Statistics
// ============================================================================

export function useStatistics() {
  return useQuery({
    queryKey: cmsKeys.statistics(),
    queryFn: () => adminCmsService.getStatistics(),
    ...queryConfig.static,
  });
}

export function useUpdateStatistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateStatisticRequest }) =>
      adminCmsService.updateStatistic(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.statistics());
    },
  });
}

// ============================================================================
// Trusted Companies
// ============================================================================

export function useTrustedCompanies() {
  return useQuery({
    queryKey: cmsKeys.trustedCompanies(),
    queryFn: () => adminCmsService.getTrustedCompanies(),
    ...queryConfig.static,
  });
}

export function useUpdateTrustedCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateTrustedCompanyRequest }) =>
      adminCmsService.updateTrustedCompany(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.trustedCompanies());
    },
  });
}

// ============================================================================
// Pricing Add-Ons
// ============================================================================

export function usePricingAddOns() {
  return useQuery({
    queryKey: cmsKeys.pricingAddOns(),
    queryFn: () => adminCmsService.getPricingAddOns(),
    ...queryConfig.static,
  });
}

export function useUpdatePricingAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CmsPricingAddOnRequest }) =>
      adminCmsService.updatePricingAddOn(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.pricingAddOns());
    },
  });
}

// ============================================================================
// Feature Comparisons
// ============================================================================

export function useFeatureComparisons() {
  return useQuery({
    queryKey: cmsKeys.featureComparisons(),
    queryFn: () => adminCmsService.getFeatureComparisons(),
    ...queryConfig.static,
  });
}

export function useUpdateFeatureComparison() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: PricingFeatureComparisonRequest }) =>
      adminCmsService.updateFeatureComparison(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.featureComparisons());
    },
  });
}

// ============================================================================
// Blog Posts
// ============================================================================

export function useBlogPosts() {
  return useQuery({
    queryKey: cmsKeys.blogPosts(),
    queryFn: () => adminCmsService.getBlogPosts(),
    ...queryConfig.static,
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: cmsKeys.blogPost(id),
    queryFn: () => adminCmsService.getBlogPost(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBlogPostRequest) => adminCmsService.createBlogPost(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.blogPosts());
      toast.success('Blog post created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create blog post');
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateBlogPostRequest }) =>
      adminCmsService.updateBlogPost(id, request),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, cmsKeys.blogPosts());
      queryClient.invalidateQueries({ queryKey: cmsKeys.blogPost(id), refetchType: 'all' });
      toast.success('Blog post updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update blog post');
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCmsService.deleteBlogPost(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, cmsKeys.blogPosts());
      toast.success('Blog post deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog post');
    },
  });
}

