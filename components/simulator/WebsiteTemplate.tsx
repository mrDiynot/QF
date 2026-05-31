'use client';

/**
 * Website Template Component
 * Renders different website layouts for testing embeds
 */

import { cn } from '@/lib/utils';
import { ChatWidgetEmbed } from './ChatWidgetEmbed';
import { FormEmbed } from './FormEmbed';
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Zap,
  Shield,
  BarChart3,
  Play,
} from 'lucide-react';

type ThemeMode = 'light' | 'dark';

interface WebsiteTemplateProps {
  template: string;
  theme: ThemeMode;
  widgetEnabled: boolean;
  formEnabled: boolean;
}

export function WebsiteTemplate({
  template,
  theme,
  widgetEnabled,
  formEnabled,
}: WebsiteTemplateProps) {
  const isDark = theme === 'dark';

  const renderTemplate = () => {
    switch (template) {
      case 'landing':
        return <LandingTemplate isDark={isDark} formEnabled={formEnabled} />;
      case 'corporate':
        return <CorporateTemplate isDark={isDark} formEnabled={formEnabled} />;
      case 'ecommerce':
        return <EcommerceTemplate isDark={isDark} />;
      case 'contact':
        return <ContactTemplate isDark={isDark} formEnabled={formEnabled} />;
      case 'services':
        return <ServicesTemplate isDark={isDark} />;
      case 'blog':
        return <BlogTemplate isDark={isDark} />;
      default:
        return <LandingTemplate isDark={isDark} formEnabled={formEnabled} />;
    }
  };

  return (
    <div className={cn(
      'relative h-full overflow-auto',
      isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
    )}>
      {renderTemplate()}
      
      {/* Chat Widget */}
      {widgetEnabled && (
        <ChatWidgetEmbed theme={theme} position="bottom-right" />
      )}
    </div>
  );
}

// Landing Page Template
function LandingTemplate({ isDark, formEnabled }: { isDark: boolean; formEnabled: boolean }) {
  return (
    <div className="min-h-full">
      {/* Navigation */}
      <nav className={cn(
        'sticky top-0 z-40 border-b backdrop-blur-xl',
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      )}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600" />
            <span className="font-bold text-lg">TechFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}>Features</a>
            <a href="#" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}>Pricing</a>
            <a href="#" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}>About</a>
            <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/300/10 text-primary text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>New: AI-Powered Automation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your Business<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
              With Smart Technology
            </span>
          </h1>
          <p className={cn(
            'text-lg max-w-2xl mx-auto mb-8',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Streamline your workflow, automate repetitive tasks, and scale your operations 
            with our cutting-edge platform designed for modern businesses.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className={cn(
              'px-6 py-3 rounded-lg font-medium flex items-center gap-2',
              isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            )}>
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={cn(
        'py-20 px-6',
        isDark ? 'bg-slate-800/50' : 'bg-slate-50'
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose TechFlow?</h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Everything you need to grow your business
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed and performance' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance' },
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Real-time insights and reporting' },
            ].map((feature, i) => (
              <div key={i} className={cn(
                'p-6 rounded-xl',
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
              )}>
                <div className="w-12 h-12 rounded-lg bg-muted/300/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className={isDark ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Form */}
      {formEnabled && (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={cn(
              'rounded-2xl p-8 md:p-12',
              isDark ? 'bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-800' : 'bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200'
            )}>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                    Join thousands of businesses already using TechFlow to grow faster.
                  </p>
                  <div className="mt-6 space-y-3">
                    {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <FormEmbed theme={isDark ? 'dark' : 'light'} compact />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className={cn(
        'py-20 px-6',
        isDark ? 'bg-slate-800/50' : 'bg-slate-50'
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Businesses</h2>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
              ))}
              <span className={cn('ml-2 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Johnson', role: 'CEO, StartupXYZ', quote: 'TechFlow transformed how we handle customer relationships.' },
              { name: 'Mike Chen', role: 'Marketing Director', quote: 'The automation features saved us 20+ hours per week.' },
              { name: 'Lisa Park', role: 'Sales Manager', quote: 'Best decision we made for our sales pipeline.' },
            ].map((testimonial, i) => (
              <div key={i} className={cn(
                'p-6 rounded-xl',
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              )}>
                <p className={cn('text-sm mb-4', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        'py-12 px-6 border-t',
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      )}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600" />
            <span className="font-bold">TechFlow</span>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
            © 2024 TechFlow Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Corporate Template
function CorporateTemplate({ isDark, formEnabled }: { isDark: boolean; formEnabled: boolean }) {
  return (
    <div className="min-h-full">
      <nav className={cn(
        'border-b',
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      )}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-xl">Apex Solutions</span>
          <div className="flex items-center gap-6 text-sm">
            <a href="#">Services</a>
            <a href="#">Industries</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </nav>
      <section className="py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">Enterprise Solutions for Modern Business</h1>
        <p className={cn('text-xl max-w-2xl mx-auto', isDark ? 'text-slate-400' : 'text-slate-600')}>
          Trusted by Fortune 500 companies worldwide
        </p>
      </section>
      {formEnabled && (
        <section className="py-16 px-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Request a Consultation</h2>
            <FormEmbed theme={isDark ? 'dark' : 'light'} />
          </div>
        </section>
      )}
    </div>
  );
}

// E-commerce Template
function EcommerceTemplate({ isDark }: { isDark: boolean }) {
  return (
    <div className="min-h-full">
      <nav className={cn(
        'border-b',
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      )}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-xl">StyleShop</span>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search products..."
              className={cn(
                'px-4 py-2 rounded-lg text-sm w-64',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              )}
            />
          </div>
        </div>
      </nav>
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn(
                'rounded-xl overflow-hidden',
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              )}>
                <div className={cn('aspect-square', isDark ? 'bg-slate-700' : 'bg-slate-100')} />
                <div className="p-4">
                  <p className="font-medium">Product {i}</p>
                  <p className="text-primary font-bold">$99.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Contact Template
function ContactTemplate({ isDark, formEnabled }: { isDark: boolean; formEnabled: boolean }) {
  return (
    <div className="min-h-full py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
        <p className={cn('text-center mb-12', isDark ? 'text-slate-400' : 'text-slate-600')}>
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
        {formEnabled && (
          <div className="max-w-md mx-auto">
            <FormEmbed theme={isDark ? 'dark' : 'light'} />
          </div>
        )}
      </div>
    </div>
  );
}

// Services Template
function ServicesTemplate({ isDark }: { isDark: boolean }) {
  return (
    <div className="min-h-full py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {['Consulting', 'Development', 'Support'].map((service, i) => (
            <div key={i} className={cn(
              'p-8 rounded-xl text-center',
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <div className="w-16 h-16 rounded-full bg-muted/300/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service}</h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Professional {service.toLowerCase()} services for your business needs.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Blog Template
function BlogTemplate({ isDark }: { isDark: boolean }) {
  return (
    <div className="min-h-full py-12 px-6">
      <article className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-primary text-sm font-medium">Technology</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">
            The Future of AI in Business Automation
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted/300" />
              <span>John Smith</span>
            </div>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Dec 15, 2024</span>
          </div>
        </div>
        <div className={cn('prose max-w-none', isDark && 'prose-invert')}>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Artificial intelligence is revolutionizing how businesses operate. From customer service 
            to data analysis, AI-powered tools are helping companies work smarter and faster than ever before.
          </p>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            In this article, we&apos;ll explore the key trends shaping the future of business automation 
            and how you can leverage these technologies to stay ahead of the competition.
          </p>
        </div>
      </article>
    </div>
  );
}
