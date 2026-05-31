'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureModule {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  glow: string;
}

interface FeaturesSectionProps {
  modules: FeatureModule[];
  className?: string;
}

export function FeaturesSection({ modules, className }: FeaturesSectionProps) {
  return (
    <section id="modules" className={cn("py-20 md:py-32 bg-white", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-indigo-700 text-sm font-medium mb-4">
            Powerful Modules
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Automate Your Sales
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Qualiflow AI combines AI-powered lead capture, qualification, scheduling, and follow-up 
            into one seamless platform. No more juggling multiple tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <FeatureCard key={index} module={module} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  module: FeatureModule;
}

function FeatureCard({ module }: FeatureCardProps) {
  const Icon = module.icon;
  
  return (
    <div className={cn(
      "group relative p-6 rounded-2xl bg-white border border-border/50",
      "hover:shadow-xl transition-all duration-300",
      module.glow
    )}>
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        "bg-gradient-to-br",
        module.gradient
      )}>
        <Icon className="size-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {module.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {module.description}
      </p>

      {/* Hover gradient overlay */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity",
        "bg-gradient-to-br",
        module.gradient
      )} />
    </div>
  );
}

export default FeaturesSection;
