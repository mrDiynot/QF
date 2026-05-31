'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
  avatarPath: string | null;
  gradient: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  className?: string;
}

export function TestimonialsSection({ testimonials, className }: TestimonialsSectionProps) {
  return (
    <section className={cn("py-20 md:py-32 bg-gradient-to-br from-slate-50 to-white", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            Customer Success
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by Growing
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Businesses Worldwide
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See how businesses like yours are transforming their lead management with Qualiflow AI.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className={cn(
      "relative p-6 rounded-2xl border-2 transition-all duration-300",
      testimonial.bgColor,
      testimonial.borderColor,
      testimonial.hoverBorder
    )}>
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-foreground/80 mb-6 leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "size-10 rounded-full flex items-center justify-center text-white font-bold",
          "bg-gradient-to-br",
          testimonial.gradient
        )}>
          {testimonial.avatarPath ? (
            <Image
              src={testimonial.avatarPath}
              alt={testimonial.author}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            testimonial.author[0]
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection;
