'use client';

import { FeatureComingSoon } from '@/components/shared/feature-coming-soon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, TrendingUp } from 'lucide-react';

export default function SocialBuilderPage() {
  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <FeatureComingSoon 
          featureName="Social Media Builder" 
          description="Social media management API"
          storageKey="social-builder-banner-dismissed"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Social Media Builder</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create and schedule social media posts
            </p>
          </div>
          <Button className="gap-2 rounded-[10px] gradient-primary text-white">
            <Plus className="size-4" />
            Create Post
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Scheduled Posts', value: '24', icon: Calendar },
            { label: 'Published', value: '156', icon: TrendingUp },
            { label: 'Engagement Rate', value: '4.8%', icon: TrendingUp },
            { label: 'Total Reach', value: '12.4K', icon: TrendingUp },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="small-text text-text-secondary">{stat.label}</p>
                  <p className="text-3xl font-normal text-text-navy">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                  <stat.icon className="size-6 text-brand-purple" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-pink-50">
              <span className="size-8 text-brand-purple">📱</span>
            </div>
            <h2 className="heading-2 text-text-navy">Social Media Builder</h2>
            <p className="body-text text-text-secondary">
              Create engaging social media posts, schedule them across platforms, and track performance.
            </p>
            <Button className="gap-2 rounded-[10px] gradient-primary text-white">
              <Plus className="size-4" />
              Create Your First Post
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}