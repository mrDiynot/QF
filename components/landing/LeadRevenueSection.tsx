'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Target, Calendar, Star, ArrowRight, Zap } from 'lucide-react';

const STAGES = [
  {
    tag: 'ENGAGE',
    color: '#FF5722',
    bgLight: 'rgba(255,87,34,0.08)',
    icon: MessageSquare,
    title: 'Instant Omni-Channel Response',
    description: 'AI responds in seconds across voice, SMS, chat, social, and email—never miss a lead',
    stat: '98.5% response rate',
  },
  {
    tag: 'QUALIFY',
    color: '#7C3AED',
    bgLight: 'rgba(124,58,237,0.08)',
    icon: Target,
    title: 'Smart AI Qualification',
    description: 'Asks the right questions and scores leads on intent, urgency, budget, and location',
    stat: 'Qualified in under 60 seconds',
  },
  {
    tag: 'CONVERT',
    color: '#FF5722',
    bgLight: 'rgba(255,87,34,0.08)',
    icon: Calendar,
    title: 'Auto Booking & Proposals',
    description: 'Books appointments and sends custom proposals automatically without manual effort',
    stat: '3x faster deal closure',
  },
  {
    tag: 'RETAIN',
    color: '#7C3AED',
    bgLight: 'rgba(124,58,237,0.08)',
    icon: Star,
    title: 'Reviews & Re-Engagement',
    description: 'Collects reviews and re-engages customers automatically for repeat business',
    stat: '50% more repeat customers',
  },
] as const;

export function LeadRevenueSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">
      {/* Subtle ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: '#7C3AED', filter: 'blur(120px)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: '#FF5722', filter: 'blur(120px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 border"
            style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}
          >
            <Zap className="w-4 h-4" style={{ color: '#FF5722' }} />
            The Automated Customer Journey Platform
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            Turn Your Leads to{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #FF5722, #FF8C42)' }}
            >
              Revenue Automatically
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Automate your entire customer journey without hiring more staff
          </p>
        </motion.div>

        {/* Stage cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.tag}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border p-6 hover:shadow-lg transition-shadow duration-300"
                style={{ background: '#fff', borderColor: '#E5E7EB' }}
              >
                {/* Stage tag */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider mb-4"
                  style={{ background: stage.bgLight, color: stage.color }}
                >
                  {stage.tag}
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: stage.bgLight }}
                >
                  <Icon className="w-5 h-5" style={{ color: stage.color }} strokeWidth={1.75} />
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">{stage.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{stage.description}</p>

                {/* Stat */}
                <div
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: stage.bgLight, color: stage.color }}
                >
                  {stage.stat}
                </div>

                {/* Connector arrow (except last) */}
                {i < STAGES.length - 1 && (
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 hidden lg:flex">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                      style={{ background: stage.color }}
                    >
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #FF5722, #FF6B35)',
              boxShadow: '0 8px 24px rgba(255,87,34,0.35)',
            }}
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-sm text-gray-400">No credit card required • Live in minutes</p>
        </motion.div>
      </div>
    </section>
  );
}

export default LeadRevenueSection;
