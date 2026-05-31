'use client';

import { motion } from 'framer-motion';
import { BookOpen, Search, Tag, TrendingUp } from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const CATEGORIES = [
  { icon: TrendingUp, title: 'Getting Started',    desc: 'Setup guides and onboarding tutorials',    articles: 12 },
  { icon: BookOpen,   title: 'Platform Features',  desc: 'Learn about all QualiFlow AI capabilities',   articles: 24 },
  { icon: Tag,        title: 'Best Practices',     desc: 'Tips to maximize your results',            articles: 18 },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute -top-32 right-0 w-[600px] h-[400px] rounded-full opacity-[0.12] pointer-events-none" style={{ background: '#7c3aed', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: '#FF5722', filter: 'blur(100px)' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6">
                <BookOpen className="w-4 h-4" />Resources
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">Help Center</h1>
              <p className="text-xl text-purple-200 mb-8">Get answers, learn best practices, and make the most of QualiFlow AI</p>
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 bg-[#2D1B4E]/80 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </motion.div>

            {/* White-tinted stat bar */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-6 mb-12 grid md:grid-cols-3 gap-6 text-center">
              {[
                { value: '54+',    label: 'Help Articles' },
                { value: '<2min',  label: 'Avg Answer Time' },
                { value: '98%',    label: 'Issue Resolution Rate' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">{s.value}</div>
                  <div className="text-purple-300 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="grid md:grid-cols-3 gap-8">
              {CATEGORIES.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all group cursor-pointer"
                >
                  <category.icon className="w-12 h-12 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-xl mb-2">{category.title}</h3>
                  <p className="text-purple-200 text-sm mb-4">{category.desc}</p>
                  <div className="text-orange-400 text-sm">{category.articles} articles →</div>
                </motion.div>
              ))}
            </div>

            {/* Support CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
              <p className="text-purple-200 mb-8">Our support team is available 24/7 to assist you.</p>
              <button className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                Contact Support
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingPageFooter />
    </div>
  );
}
