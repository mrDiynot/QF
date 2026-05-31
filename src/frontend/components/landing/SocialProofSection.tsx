'use client';

import { motion } from 'framer-motion';

const STATS = [
  { value: '50K+',   label: 'Leads Captured Daily',  color: '#FF5722' },
  { value: '98.5%',  label: 'Response Rate',          color: '#A78BFA' },
  { value: '1K+',    label: 'Happy Customers',        color: '#FF5722' },
  { value: '4.9/5',  label: 'Customer Rating',        color: '#A78BFA' },
] as const;

export function SocialProofSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: '#0F172A' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: '#7C3AED', filter: 'blur(120px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: '#FF5722', filter: 'blur(120px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Trusted by Businesses{' '}
            <span style={{ color: '#FF5722' }}>Worldwide</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Join thousands of companies automating their customer journey
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl p-6 text-center border"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-4xl font-extrabold mb-2" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}

export default SocialProofSection;
