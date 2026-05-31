'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import {
  BarChart3, Users, CheckCircle, Calendar, Star,
  Phone, MessageSquare, Zap, Bot,
  Bell, TrendingUp, ArrowRight,
} from 'lucide-react';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  const formatted =
    value >= 1000
      ? display.toLocaleString()
      : suffix === '%'
      ? display
      : display % 1 !== 0
      ? display.toFixed(1)
      : display;

  return <span ref={ref}>{formatted}{suffix}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  gradient: string;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}
function StatCard({ icon, gradient, value, suffix = '', label, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
      className="flex-1 min-w-0 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500 mt-1" strokeWidth={2.5} />
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Funnel Bar ───────────────────────────────────────────────────────────────
interface FunnelBarProps {
  label: string;
  value: string;
  widthPct: number;
  gradient: string;
  delay: number;
}
function FunnelBar({ label, value, widthPct, gradient, delay }: FunnelBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="w-28 shrink-0 text-sm text-gray-600 font-medium text-right">{label}</span>
      <div className="flex-1 h-10 bg-gray-100 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full ${gradient}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${widthPct}%` } : { width: 0 }}
          transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ boxShadow: '0 2px 12px rgba(139,92,246,0.25)' }}
        />
      </div>
      <span className="w-14 shrink-0 text-sm font-semibold text-gray-700 tabular-nums">{value}</span>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SideItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-default transition-colors duration-200 ${
        active
          ? 'bg-white/15 text-white font-semibold'
          : 'text-white/60 hover:text-white/85 hover:bg-white/8'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span className="text-[13px] truncate">{label}</span>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const FUNNEL_PERIODS = ['Week', 'Month', 'Year'] as const;

export function PlatformDashboardSection() {
  const [activePeriod, setActivePeriod] = useState<(typeof FUNNEL_PERIODS)[number]>('Week');

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">
      {/* AI ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #FF5722 0%, transparent 70%)' }}
        />
        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #6B2D9E 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-sm text-purple-700 font-medium mb-6">
            <Zap className="w-4 h-4 text-[#FF5722]" />
            Real-Time Platform
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Turn Your Leads to{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #FF6B35, #FF8C42, #FFB347)' }}
            >
              Revenue Automatically
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Automate your entire customer journey without hiring more staff
          </p>
        </motion.div>

        {/* ── Dashboard Mockup Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl rounded-2xl overflow-hidden border border-gray-200 shadow-2xl"
          style={{ boxShadow: '0 32px 80px rgba(107,45,158,0.12), 0 8px 24px rgba(0,0,0,0.08)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200">
            {/* Traffic lights */}
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />

            {/* Nav tabs */}
            <div className="flex items-center gap-6 ml-4">
              {(['Dashboard', 'Analytics', 'Journeys', 'CRM'] as const).map((tab) => (
                <span
                  key={tab}
                  className={`text-sm font-medium pb-0.5 ${
                    tab === 'Dashboard'
                      ? 'text-[#6B2D9E] border-b-2 border-[#6B2D9E]'
                      : 'text-gray-400'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div
                className="w-7 h-7 rounded-full"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              />
            </div>
          </div>

          {/* Dashboard body */}
          <div className="flex" style={{ minHeight: 480 }}>
            {/* Sidebar */}
            <div
              className="w-48 shrink-0 p-4 flex flex-col gap-1"
              style={{ background: '#2D1060' }}
            >
              <SideItem icon={BarChart3} label="Overview" active />
              <SideItem icon={Phone} label="Voice Agents" />
              <SideItem icon={MessageSquare} label="Messages" />
              <SideItem icon={Zap} label="Journeys" />
              <SideItem icon={Users} label="CRM & Contacts" />
              <SideItem icon={Calendar} label="Bookings" />
              <SideItem icon={Star} label="Reviews" />
            </div>

            {/* Main content */}
            <div className="flex-1 bg-gray-50 p-6 flex flex-col gap-5 overflow-hidden">
              {/* Stat cards */}
              <div className="flex gap-4">
                <StatCard
                  icon={<Users className="w-6 h-6 text-white" strokeWidth={1.75} />}
                  gradient="bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]"
                  value={2847}
                  label="Total Leads"
                  delay={0.1}
                />
                <StatCard
                  icon={<CheckCircle className="w-6 h-6 text-white" strokeWidth={1.75} />}
                  gradient="bg-gradient-to-br from-[#FF5722] to-[#FF8C42]"
                  value={68}
                  suffix="%"
                  label="Qualified"
                  delay={0.18}
                />
                <StatCard
                  icon={<Calendar className="w-6 h-6 text-white" strokeWidth={1.75} />}
                  gradient="bg-gradient-to-br from-[#EC4899] to-[#8B5CF6]"
                  value={342}
                  label="Booked"
                  delay={0.26}
                />
                <StatCard
                  icon={<Star className="w-6 h-6 text-white" strokeWidth={1.75} />}
                  gradient="bg-gradient-to-br from-[#10B981] to-[#34D399]"
                  value={4.8}
                  label="Avg Review"
                  delay={0.34}
                />
              </div>

              {/* Funnel card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                {/* Funnel header */}
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Lead Conversion Funnel</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Last 30 days</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {FUNNEL_PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivePeriod(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          activePeriod === p
                            ? 'bg-white text-[#6B2D9E] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bars */}
                <div className="mt-6 flex flex-col gap-4">
                  <FunnelBar
                    label="Lead Captured"
                    value="2,847"
                    widthPct={100}
                    gradient="bg-gradient-to-r from-[#6B2D9E] via-[#B44E88] to-[#FF5722]"
                    delay={0.4}
                  />
                  <FunnelBar
                    label="Qualified"
                    value="1,936"
                    widthPct={68}
                    gradient="bg-gradient-to-r from-[#FF5722] via-[#FF6B6B] to-[#EC4899]"
                    delay={0.5}
                  />
                  <FunnelBar
                    label="Appointment"
                    value="1,129"
                    widthPct={40}
                    gradient="bg-gradient-to-r from-[#EC4899] via-[#C450D1] to-[#8B5CF6]"
                    delay={0.6}
                  />
                  <FunnelBar
                    label="Converted"
                    value="782"
                    widthPct={27}
                    gradient="bg-gradient-to-r from-[#7C3AED] to-[#6B2D9E]"
                    delay={0.7}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
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
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Bot className="w-4 h-4 text-[#FF5722]" />
            No credit card required • Live in minutes
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PlatformDashboardSection;
