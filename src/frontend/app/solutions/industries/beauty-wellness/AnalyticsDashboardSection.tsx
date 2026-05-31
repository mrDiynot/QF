'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
// import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function AnalyticsDashboardSection() {
  const [counts, setCounts] = useState({ leads: 0, booked: 0, revenue: 0, conversion: 0 });

  useEffect(() => {
    const targets = { leads: 1200, booked: 225, revenue: 34000, conversion: 34 };
    const steps = 60;
    const interval = 2000 / steps;
    const pauseDuration = 1500;

    const animateUp = () => {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const p = step / steps;
        setCounts({ leads: Math.floor(targets.leads * p), booked: Math.floor(targets.booked * p), revenue: Math.floor(targets.revenue * p), conversion: Math.floor(targets.conversion * p) });
        if (step >= steps) { clearInterval(timer); setCounts(targets); setTimeout(animateDown, pauseDuration); }
      }, interval);
    };

    const animateDown = () => {
      let step = steps;
      const timer = setInterval(() => {
        step--;
        const p = step / steps;
        setCounts({ leads: Math.floor(targets.leads * p), booked: Math.floor(targets.booked * p), revenue: Math.floor(targets.revenue * p), conversion: Math.floor(targets.conversion * p) });
        if (step <= 0) { clearInterval(timer); setCounts({ leads: 0, booked: 0, revenue: 0, conversion: 0 }); setTimeout(animateUp, pauseDuration); }
      }, interval);
    };

    animateUp();
    return () => {};
  }, []);

  const floatingStats = [
    { icon: Users, label: 'Leads', value: counts.leads.toLocaleString(), gradient: 'from-purple-500 to-purple-600', pos: 'top-3 sm:top-6 left-3 sm:left-6' },
    { icon: TrendingUp, label: 'Conversion', value: `${counts.conversion}%`, gradient: 'from-blue-500 to-blue-600', pos: 'top-3 sm:top-6 right-3 sm:right-6' },
    { icon: DollarSign, label: 'Revenue', value: `$${(counts.revenue / 1000).toFixed(1)}K`, gradient: 'from-orange-500 to-orange-600', pos: 'bottom-3 sm:bottom-6 left-3 sm:left-6' },
    { icon: BarChart3, label: 'Booked', value: counts.booked.toLocaleString(), gradient: 'from-pink-500 to-pink-600', pos: 'bottom-3 sm:bottom-6 right-3 sm:right-6' },
  ];

  const channelData = [
    { name: 'Web Chat', rate: 72 },
    { name: 'Facebook', rate: 64 },
    { name: 'Instagram', rate: 58 },
  ];

  const journeyData = [
    { name: 'Lead → Booking', rate: 68 },
    { name: 'Survey Flow', rate: 61 },
    { name: 'Missed Call Follow-up', rate: 54 },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6B2D9E] via-[#8B3DAE] to-[#FF5722] bg-clip-text text-transparent mb-4">
              wel
            </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* Image with floating stats */}
          <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white" style={{ minHeight: 480 }}>
            <Image
              src="/assets/d96b439b-fd4c-49ba-9ce2-a7d833d0ac10.png"
              alt="Analytics Dashboard - businesswoman reviewing Qualiflow AI results"
              fill
              className="object-cover"
            />
            {floatingStats.map(({ icon: Icon, label, value, gradient, pos }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8, y: i < 2 ? -20 : 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`absolute ${pos} bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 md:hidden`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{value}</div>
                    <div className="text-[10px] text-gray-600">{label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: charts + insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Top Performing Channels */}
            <div
              className="relative rounded-2xl p-px overflow-hidden shadow-2xl shadow-purple-900/40"
              style={{ background: 'linear-gradient(135deg, #7c3aed55, #FF572233, #7c3aed55)' }}
            >
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0d0618 0%, #1a0a2e 60%, #120720 100%)' }}
              >
                {/* Dot grid */}
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                {/* Ambient glow */}
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-600/20 blur-2xl pointer-events-none" />
                {/* Scan line */}
                <motion.div
                  className="absolute inset-y-0 w-[1px] opacity-20 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent, #a855f7, transparent)' }}
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-300" />
                    </div>
                    <h3 className="text-base font-bold text-white">Top Performing Channels</h3>
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Live</span>
                    </span>
                  </div>
                  <div className="space-y-5">
                    {channelData.map((ch, i) => (
                      <div key={ch.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-white/80">{ch.name}</div>
                          <div className="text-sm font-bold text-purple-300">{ch.rate}%</div>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: ['0%', `${ch.rate}%`, `${ch.rate}%`, '0%'] }}
                            transition={{ duration: 6, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bottom accent */}
                  <div className="mt-6 h-px bg-gradient-to-r from-violet-500/40 via-purple-400/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Top Performing Journeys */}
            <div
              className="relative rounded-2xl p-px overflow-hidden shadow-2xl shadow-orange-900/30"
              style={{ background: 'linear-gradient(135deg, #FF572255, #7c3aed33, #FF572255)' }}
            >
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0d0618 0%, #1a0800 60%, #120720 100%)' }}
              >
                {/* Dot grid */}
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                {/* Ambient glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-600/15 blur-2xl pointer-events-none" />
                {/* Scan line */}
                <motion.div
                  className="absolute inset-y-0 w-[1px] opacity-20 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent, #FF8C42, transparent)' }}
                  animate={{ left: ['100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-300" />
                    </div>
                    <h3 className="text-base font-bold text-white">Top Performing Journeys</h3>
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Live</span>
                    </span>
                  </div>
                  <div className="space-y-5">
                    {journeyData.map((j, i) => (
                      <div key={j.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-white/80">{j.name}</div>
                          <div className="text-sm font-bold text-orange-300">{j.rate}%</div>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: ['0%', `${j.rate}%`, `${j.rate}%`, '0%'] }}
                            transition={{ duration: 6, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #FF5722, #FF8C42, #f59e0b)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bottom accent */}
                  <div className="mt-6 h-px bg-gradient-to-r from-orange-500/40 via-orange-400/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-4 hidden md:block">
              {[
                { icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', title: '34% Conversion Rate', desc: 'Automated journeys convert better than manual follow-ups' },
                { icon: DollarSign, gradient: 'from-orange-500 to-orange-600', title: '$34K Revenue Generated', desc: 'Track ROI in real-time across all customer journeys' },
                { icon: BarChart3, gradient: 'from-pink-500 to-pink-600', title: '225 Meetings Booked', desc: 'Never miss an opportunity with automated booking' },
              ].map(({ icon: Icon, gradient, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div><h4 className="font-semibold text-gray-900 mb-1">{title}</h4><p className="text-sm text-gray-700">{desc}</p></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-14 px-10 bg-gradient-to-br from-[#1e0a3c] via-[#2d1060] to-[#4c1d95] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/40 ring-1 ring-white/10 hover:shadow-purple-800/50 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              Start Free Trial
            </Link>
           


 <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Watch Demo</Link>





          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsDashboardSection;
