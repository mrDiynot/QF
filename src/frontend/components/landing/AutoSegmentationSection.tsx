'use client';

import { motion } from 'framer-motion';
import { Bot, CheckCircle2, TrendingUp } from 'lucide-react';

const SEGMENT_TYPES = [
  'Hot Leads',
  'Warm Leads',
  'Cold Leads',
  'Review Ready',
  'VIP Customers',
  'Upsell Opportunities',
  'At-Risk Customers',
  'Monthly Re-engagement',
] as const;

const SEGMENTS = [
  { name: 'Hot Leads',       count: 47,  change: '+12', color: '#FF5722' },
  { name: 'Warm Leads',      count: 183, change: '+8',  color: '#FF8C42' },
  { name: 'Cold Leads',      count: 29,  change: '+3',  color: '#7C3AED' },
  { name: 'Review Ready',    count: 64,  change: '+15', color: '#10B981' },
  { name: 'VIP Customers',   count: 29,  change: '+3',  color: '#A78BFA' },
  { name: 'At-Risk Customers', count: 18, change: '-2', color: '#F59E0B' },
] as const;

export function AutoSegmentationSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gray-50">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: '#7C3AED', filter: 'blur(100px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border"
              style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.18)', color: '#7C3AED' }}
            >
              <Bot className="w-4 h-4" style={{ color: '#FF5722' }} />
              AI Auto-Segmentation
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5 leading-tight">
              AI Creates &amp; Manages Lists{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}
              >
                Automatically
              </span>
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              QualiFlow AI&apos;s AI automatically segments your contacts, maintains lists, and keeps everything
              organized without lifting a finger.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SEGMENT_TYPES.map((type, i) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#7C3AED' }} />
                  <span className="text-sm font-semibold text-gray-700">{type}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="rounded-2xl bg-white border-2 border-gray-200 shadow-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">AI Auto-Segmentation</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Real-time list management</p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', color: '#059669' }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>
              </div>

              {/* Segment list */}
              <div className="flex flex-col gap-2.5 mb-5">
                {SEGMENTS.map((seg, i) => (
                  <motion.div
                    key={seg.name}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                      style={{ background: seg.color }}
                    />
                    <p className="flex-1 text-sm font-semibold text-gray-800">{seg.name}</p>
                    <p className="text-xl font-bold text-gray-900 tabular-nums">{seg.count}</p>
                    <div
                      className="px-2.5 py-1 rounded-full text-xs font-bold border"
                      style={{
                        background: seg.change.startsWith('+') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: seg.change.startsWith('+') ? '#059669' : '#DC2626',
                        borderColor: seg.change.startsWith('+') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      }}
                    >
                      {seg.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div
                className="flex items-center justify-between rounded-xl px-5 py-4"
                style={{ background: '#111827' }}
              >
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Contacts</p>
                  <p className="text-3xl font-extrabold text-white">183</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#4ADE80' }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  +28 this week
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AutoSegmentationSection;
