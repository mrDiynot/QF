'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { useBlogPosts, type BlogPostListItem } from "@/hooks/useBlogPosts";

// ---------------------------------------------------------------------------
// Fallback mock posts — shown when API is unavailable or returns empty array
// ---------------------------------------------------------------------------
const FALLBACK_POSTS: BlogPostListItem[] = [
  {
      id: "1",
      title: "How AI Is Transforming Lead Qualification in 2025",
      slug: "ai-transforming-lead-qualification-2025",
      excerpt: "Discover how AI-powered platforms are helping businesses capture and qualify leads 10× faster than traditional methods.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "AI & Automation",
      readingTimeMinutes: 5,
      publishedAt: "2025-01-15T00:00:00Z",
      isPublished: true,
      isFeatured: true,
      createdAt: "2025-01-15T00:00:00Z",
      authorAvatarPath: null
  },
  {
      id: "2",
      title: "The True Cost of Missing a Business Call",
      slug: "true-cost-missing-business-call",
      excerpt: "Studies show 78 % of customers buy from the first business that responds. Learn how missed calls are silently killing your revenue.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "Sales Strategy",
      readingTimeMinutes: 4,
      publishedAt: "2025-01-22T00:00:00Z",
      isPublished: true,
      isFeatured: false,
      createdAt: "2025-01-22T00:00:00Z",
      authorAvatarPath: null
  },
  {
      id: "3",
      title: "5 Customer Journey Automations Every Business Needs",
      slug: "5-customer-journey-automations",
      excerpt: "From missed-call recovery to post-purchase follow-ups, these automation flows can dramatically increase your conversion rates.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "Customer Journey",
      readingTimeMinutes: 6,
      publishedAt: "2025-02-01T00:00:00Z",
      isPublished: true,
      isFeatured: false,
      createdAt: "2025-02-01T00:00:00Z",
      authorAvatarPath: null
  },
  {
      id: "4",
      title: "Why SMS Beats Email for Lead Follow-Up",
      slug: "sms-vs-email-lead-follow-up",
      excerpt: "SMS messages have a 98 % open rate vs 20 % for email. Find out why SMS should be your primary follow-up channel.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "Communication",
      readingTimeMinutes: 3,
      publishedAt: "2025-02-10T00:00:00Z",
      isPublished: true,
      isFeatured: false,
      createdAt: "2025-02-10T00:00:00Z",
      authorAvatarPath: null
  },
  {
      id: "5",
      title: "Building a 5-Star Reputation with Automated Reviews",
      slug: "automated-review-generation",
      excerpt: "Learn how automated review-request flows can triple your Google reviews and build unshakeable social proof.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "Reputation",
      readingTimeMinutes: 4,
      publishedAt: "2025-02-18T00:00:00Z",
      isPublished: true,
      isFeatured: false,
      createdAt: "2025-02-18T00:00:00Z",
      authorAvatarPath: null
  },
  {
      id: "6",
      title: "AI Chatbots vs. Human Agents: The Hybrid Future",
      slug: "ai-chatbots-vs-human-agents",
      excerpt: "The best businesses use AI for speed and humans for empathy. Here's how to strike the perfect balance for your team.",
      featuredImagePath: null,
      authorName: "QualiFlow Team",
      category: "AI & Automation",
      readingTimeMinutes: 5,
      publishedAt: "2025-02-25T00:00:00Z",
      isPublished: true,
      isFeatured: false,
      createdAt: "2025-02-25T00:00:00Z",
      authorAvatarPath: null
  },
];

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const CATEGORY_STYLES: Record<string, { pill: string; initial: string; imageBg: string }> = {
  "AI & Automation": {
    pill: "bg-gradient-to-r from-purple-100 to-pink-100 text-[#6B2D9E]",
    initial: "from-[#6B2D9E] to-[#8B3DAE]",
    imageBg: "from-purple-100 via-pink-50 to-fuchsia-50",
  },
  "Sales Strategy": {
    pill: "bg-gradient-to-r from-orange-100 to-amber-100 text-[#FF5722]",
    initial: "from-[#FF5722] to-[#FF8C42]",
    imageBg: "from-orange-50 via-amber-50 to-yellow-50",
  },
  "Customer Journey": {
    pill: "bg-gradient-to-r from-blue-100 to-cyan-100 text-[#3B82F6]",
    initial: "from-[#3B82F6] to-[#6B2D9E]",
    imageBg: "from-blue-50 via-sky-50 to-cyan-50",
  },
  Communication: {
    pill: "bg-gradient-to-r from-teal-100 to-green-100 text-teal-700",
    initial: "from-[#10B981] to-[#3B82F6]",
    imageBg: "from-teal-50 via-emerald-50 to-green-50",
  },
  Reputation: {
    pill: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700",
    initial: "from-[#F59E0B] to-[#EF4444]",
    imageBg: "from-yellow-50 via-amber-50 to-orange-50",
  },
};

const DEFAULT_STYLE = {
  pill: "bg-gradient-to-r from-purple-100 to-pink-100 text-[#6B2D9E]",
  initial: "from-[#6B2D9E] to-[#EC4899]",
  imageBg: "from-purple-50 via-pink-50 to-rose-50",
};

function getStyle(category: string | null) {
  return category ? (CATEGORY_STYLES[category] ?? DEFAULT_STYLE) : DEFAULT_STYLE;
}

// ---------------------------------------------------------------------------
// BlogCard
// ---------------------------------------------------------------------------
interface BlogCardProps {
  post: BlogPostListItem;
}

function BlogCard({ post }: BlogCardProps) {
  const style = getStyle(post.category);

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
      {/* Image / hero area */}
      <div
        className={`relative h-48 bg-gradient-to-br ${style.imageBg} flex items-center justify-center overflow-hidden shrink-0`}
      >
        {post.featuredImagePath ? (
          <Image
            src={post.featuredImagePath}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <motion.div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.initial} flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl font-extrabold text-white">{post.title.charAt(0)}</span>
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Category pill */}
        {post.category && (
          <span
            className={`self-start px-3 py-1 ${style.pill} text-xs font-semibold rounded-full mb-3`}
          >
            {post.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#6B2D9E] transition-colors line-clamp-2 leading-snug">
          <Link href={`/blog/${post.slug}`} className="no-underline">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Meta footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-br ${style.initial} flex items-center justify-center shrink-0`}
            >
              <span className="text-white text-[10px] font-bold">
                {post.authorName?.charAt(0) ?? "Q"}
              </span>
            </div>
            <span className="font-medium text-gray-600 truncate max-w-[100px]">{post.authorName}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTimeMinutes} min read</span>
          </div>
        </div>

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 mt-4 text-[#6B2D9E] text-sm font-semibold hover:gap-2.5 transition-all no-underline"
        >
          Read article
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scrolling marquee ticker strip
// ---------------------------------------------------------------------------
function MarqueeStrip({ posts }: { posts: BlogPostListItem[] }) {
  // Duplicate so the ticker loops seamlessly
  const items = [...posts, ...posts, ...posts];
  return (
    <div className="relative overflow-hidden py-5 mt-10 border-y border-gray-100/80">
      {/* edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="blog-marquee-track flex gap-8 items-center" style={{ animationDuration: `${posts.length * 5}s` }}>
        {items.map((post, i) => {
          const style = getStyle(post.category);
          return (
            <Link
              key={`${post.id}-${i}`}
              href={`/blog/${post.slug}`}
              className="flex items-center gap-2.5 shrink-0 group no-underline"
            >
              <span
                className={`w-6 h-6 rounded-lg bg-gradient-to-br ${style.initial} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
              >
                {post.title.charAt(0)}
              </span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-[#6B2D9E] transition-colors whitespace-nowrap">
                {post.title}
              </span>
              <span className="text-gray-300 text-xs shrink-0">·</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function BlogPreviewSection() {
  const { data: posts = [], isLoading } = useBlogPosts();

  // Real data if available, else fallbacks
  const displayPosts = posts.length > 0 ? posts : FALLBACK_POSTS;
  // Grid shows first 3 posts only
  const gridPosts = displayPosts.slice(0, 3);

  return (
    <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white">
      {/* Background decorative orbs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Section header ── */}
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-[#6B2D9E]" />
            <span className="text-sm font-semibold text-[#6B2D9E]">From Our Blog</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Insights to{" "}
            <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent">
              Grow Your Business
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert tips on AI-powered sales, lead qualification, and customer engagement strategies.
          </p>
        </ScrollReveal>

        {/* ── 3-Column Blog Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            staggerDelay={0.12}
          >
            {gridPosts.map((post) => (
              <StaggerItem key={post.id} className="h-full">
                <BlogCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* ── Scrolling Marquee Ticker ── */}
        {!isLoading && <MarqueeStrip posts={displayPosts} />}

        {/* ── CTA ── */}
        <ScrollReveal delay={0.2} className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-[#6B2D9E] to-[#8B3DAE] hover:from-[#5B2486] hover:to-[#7B2D9E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 no-underline"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
