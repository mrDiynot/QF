'use client';

import { useQuery } from '@tanstack/react-query';
import { blogApi, type BlogPostListItem, type BlogPost } from '@/lib/api';

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.getPublishedPosts(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => blogApi.getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

export type { BlogPostListItem, BlogPost };
