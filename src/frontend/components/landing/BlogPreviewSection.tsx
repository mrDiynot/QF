'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
// import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { usePublicBlogs } from '@/hooks/cms/useCms';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  isFeatured?: boolean;
}

const FALLBACK_POSTS: BlogPost[] = [
  { id: '1', title: 'How AI is Transforming Lead Qualification in 2025', slug: 'ai-lead-qualification-2025', excerpt: 'Discover how AI-powered qualification is helping businesses convert more leads with less effort.', category: 'AI & Automation', readingTimeMinutes: 5, publishedAt: '2025-01-15T00:00:00Z', isFeatured: true },
  { id: '2', title: '5 Ways Automated Outreach Closes More Deals', slug: 'automated-outreach-close-deals', excerpt: 'Learn the top strategies businesses use to automate outreach and increase their close rate.', category: 'Sales Strategy', readingTimeMinutes: 4, publishedAt: '2025-01-22T00:00:00Z' },
  { id: '3', title: 'The Complete Guide to Customer Journey Automation', slug: 'customer-journey-automation-guide', excerpt: 'Everything you need to know about automating your entire customer journey from first contact.', category: 'Customer Journey', readingTimeMinutes: 6, publishedAt: '2025-02-01T00:00:00Z' },
  { id: '4', title: 'SMS vs Email: Which Channel Converts Better?', slug: 'sms-vs-email-conversion', excerpt: 'A data-driven comparison of SMS and email for lead nurturing and conversion.', category: 'Communication', readingTimeMinutes: 3, publishedAt: '2025-02-10T00:00:00Z' },
  { id: '5', title: 'How to Get 5-Star Reviews on Autopilot', slug: 'get-5-star-reviews-autopilot', excerpt: 'Build your reputation automatically with AI-powered review collection sequences.', category: 'Reputation', readingTimeMinutes: 4, publishedAt: '2025-02-18T00:00:00Z' },
  { id: '6', title: 'AI Voice Agents: The Future of Outbound Calling', slug: 'ai-voice-agents-outbound', excerpt: 'How AI voice technology is revolutionizing outbound sales and appointment setting.', category: 'AI & Automation', readingTimeMinutes: 5, publishedAt: '2025-02-25T00:00:00Z' },
];

const CATEGORY_STYLES: Record<string, string> = {
  'AI & Automation': 'from-purple-500 to-pink-500',
  'Sales Strategy': 'from-orange-500 to-red-500',
  'Customer Journey': 'from-blue-500 to-cyan-500',
  'Communication': 'from-green-500 to-teal-500',
  'Reputation': 'from-yellow-500 to-amber-500',
};

function getGradient(cat?: string) {
  return cat ? (CATEGORY_STYLES[cat] ?? 'from-purple-500 to-pink-500') : 'from-purple-500 to-pink-500';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BlogCard({ post }: { post: BlogPost }) {
  const gradient = getGradient(post.category);
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full no-underline">
      <div className="h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Header gradient */}
        <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{post.title.charAt(0)}</span>
          </div>
          {post.isFeatured && (
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-semibold text-white">Featured</span>
            </div>
          )}
        </div>

        <div className="p-6">
          {post.category && (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${gradient} mb-3`}>
              {post.category}
            </div>
          )}
          <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug group-hover:text-[#6B2D9E] transition-colors line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              {post.readingTimeMinutes && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTimeMinutes} min</span>
              )}
            </div>
            <span className="text-xs font-semibold text-[#6B2D9E] group-hover:underline flex items-center gap-1">Read <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Skeleton className="h-40 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function MarqueeStrip({ posts }: { posts: BlogPost[] }) {
  const items = [...posts, ...posts, ...posts];
  return (
    <div className="relative overflow-hidden py-5 mt-10 border-y border-gray-100/80">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-8 items-center"
        style={{
          animation: `marquee ${posts.length * 5}s linear infinite`,
          width: 'max-content',
        }}
      >
        {items.map((post, i) => {
          const gradient = getGradient(post.category);
          return (
            <Link key={`${post.id}-${i}`} href={`/blog/${post.slug}`} className="flex items-center gap-2.5 shrink-0 group no-underline">
              <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{post.title.charAt(0)}</span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-[#6B2D9E] transition-colors whitespace-nowrap">{post.title}</span>
              <span className="text-gray-300 text-xs shrink-0">·</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function BlogPreviewSection() {
  const { data: rawPosts, isLoading } = usePublicBlogs();
  const displayPosts: BlogPost[] = (rawPosts && rawPosts.length > 0) ? rawPosts as BlogPost[] : FALLBACK_POSTS;
  const gridPosts = displayPosts.slice(0, 3);

  return (
    <>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
      <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
              <BookOpen className="w-4 h-4 text-[#6B2D9E]" />
              <span className="text-sm font-semibold text-[#6B2D9E]">From Our Blog</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Insights to{' '}
              <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent">Grow Your Business</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert tips on AI-powered sales, lead qualification, and customer engagement strategies.
            </p>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" staggerDelay={0.12}>
              {gridPosts.map((post) => (
                <StaggerItem key={post.id} className="h-full">
                  <BlogCard post={post} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {!isLoading && <MarqueeStrip posts={displayPosts} />}

          <ScrollReveal delay={0.2} className="text-center mt-10">
            <Link
              href="resources/blog"
              className="inline-flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-[#6B2D9E] to-[#8B3DAE] hover:from-[#5B2486] hover:to-[#7B2D9E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

export default BlogPreviewSection;
