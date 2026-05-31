'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageProvider } from "@/contexts/PageContext";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Only render the img if the path is an absolute CDN URL; local relative paths are seed-data artefacts. */
function AuthorAvatar({ path, name }: { path: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  const isCdnUrl = path?.startsWith('http://') || path?.startsWith('https://');
  if (isCdnUrl && !imgError) {
    return (
      <Image
        src={path!}
        alt={name}
        width={24}
        height={24}
        className="w-6 h-6 rounded-full object-cover"
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
      <span className="text-white text-[10px] font-bold">{name?.charAt(0)}</span>
    </div>
  );
}

export default function BlogPage() {
  const { data: posts = [], isLoading, isError } = useBlogPosts();

  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Navigation />
      
      <main className="pt-22 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
              <BookOpen className="w-4 h-4 text-[#6B2D9E]" />
              <span className="text-sm font-semibold text-[#6B2D9E]">Our Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Insights &
              <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent"> Resources</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest trends in AI-powered sales automation, lead qualification, and customer engagement.
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to load blog posts. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No blog posts yet. Check back soon!</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          )}

          {/* Blog Posts Grid */}
          {!isLoading && posts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {posts.map((post, index) => {
                // Sanitize slug: strip leading slashes to prevent double-slash URLs
                const cleanSlug = post.slug?.replace(/^\/+/, '') || '';
                return (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Featured Image */}
                  <div className="relative h-52 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center overflow-hidden">
                    {post.featuredImagePath ? (
                      <Image
                        src={post.featuredImagePath}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-5xl font-bold text-purple-300">${post.title.charAt(0)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-5xl font-bold text-purple-300">
                        {post.title.charAt(0)}
                      </span>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-6">
                    {/* Category */}
                    {post.category && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-[#6B2D9E] text-xs font-semibold rounded-full mb-3">
                        {post.category}
                      </span>
                    )}
                    
                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6B2D9E] transition-colors line-clamp-2">
                      <Link href={`/blog/${cleanSlug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    
                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <AuthorAvatar path={post.authorAvatarPath} name={post.authorName} />
                        <span className="font-medium">{post.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readingTimeMinutes} min</span>
                      </div>
                    </div>
                    
                    {/* Read More */}
                    <Link
                      href={`/blog/${cleanSlug}`}
                      className="inline-flex items-center gap-1.5 mt-4 text-[#6B2D9E] text-sm font-semibold hover:gap-2.5 transition-all"
                    >
                      Read article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      </div>
    </PageProvider>
  );
}



