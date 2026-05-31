'use client';

import Image from "next/image";
import { use, useState } from 'react';
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageProvider } from "@/contexts/PageContext";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { Clock, ArrowLeft, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { blogSanitizeSchema } from '@/lib/sanitize-schema';

/** Only render the img if the path is an absolute CDN URL; local relative paths are seed-data artefacts. */
function AuthorAvatar({ path, name }: { path: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  const isCdnUrl = path?.startsWith('http://') || path?.startsWith('https://');
  if (isCdnUrl && !imgError) {
    return (
      <Image
        src={path!}
        alt={name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover"
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
      <span className="text-white font-bold">{name?.charAt(0)}</span>
    </div>
  );
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = useBlogPost(slug);

  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <Navigation />
        
        <main className="pt-22 pb-20 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
          {/* Back Link */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-[#6B2D9E] hover:text-[#5B2486] font-medium mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to load blog post. It may not exist or there was an error.</p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </div>
          )}

          {/* Blog Post Content */}
          {!isLoading && post && (
            <article>
              {/* Category */}
              {post.category && (
                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-[#6B2D9E] text-sm font-semibold rounded-full mb-6">
                  {post.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <AuthorAvatar path={post.authorAvatarPath} name={post.authorName} />
                  <div>
                    <p className="font-semibold text-gray-900">{post.authorName}</p>
                    {post.publishedAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.readingTimeMinutes} min read</span>
                  </div>
                  <button 
                    onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              {post.featuredImagePath && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={post.featuredImagePath}
                    alt={post.title}
                    width={800}
                    height={400}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
              )}

              {/* Content - supports both Markdown and HTML */}
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#6B2D9E] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-ul:text-gray-600 prose-ol:text-gray-600 prose-li:marker:text-[#6B2D9E] prose-blockquote:border-l-[#6B2D9E] prose-blockquote:bg-purple-50/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-table:border-collapse prose-th:bg-gray-100 prose-th:text-gray-900 prose-th:font-semibold prose-td:text-gray-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, blogSanitizeSchema]]}>
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-4 py-2 bg-gray-100 hover:bg-purple-200 text-gray-800 hover:text-[#6B2D9E] text-sm font-medium rounded-full transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Want to never miss a lead?</h3>
                <p className="text-gray-600 mb-4">Get early access to QualiflowAI and transform your lead management.</p>
                <Link 
                  href="/waitlist"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B2D9E] hover:bg-[#5B2486] text-white font-semibold rounded-xl transition-colors"
                >
                  Get Early Access
                </Link>
              </div>
            </article>
          )}
        </motion.div>
      </main>

      <Footer />
      </div>
    </PageProvider>
  );
}
