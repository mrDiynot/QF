'use client';

import { motion } from 'framer-motion';
import {
  Phone, Mail, MessageCircle, MessageSquare, Instagram, Facebook, Target,
} from 'lucide-react';
import WhatsApp from '@/components/icons/WhatsApp';

const CHANNELS = [
  { icon: Phone,         label: 'Phone Calls',   glow: '#3b82f6', iconGrad: 'from-blue-500 to-blue-600' },
  { icon: MessageCircle, label: 'SMS & MMS',      glow: '#10b981', iconGrad: 'from-green-500 to-green-600' },
  { icon: Mail,          label: 'Email',          glow: '#ef4444', iconGrad: 'from-red-500 to-red-600' },
  { icon: MessageSquare, label: 'Web Chat',       glow: '#7c3aed', iconGrad: 'from-purple-500 to-purple-600' },
  { icon: Instagram,     label: 'Instagram',      glow: '#ec4899', iconGrad: 'from-pink-500 to-pink-600' },
  { icon: Facebook,      label: 'Facebook',       glow: '#3b82f6', iconGrad: 'from-blue-600 to-blue-700' },
  { icon: MessageSquare, label: 'Forms',          glow: '#FF5722', iconGrad: 'from-orange-500 to-orange-600' },
  { icon: Target,        label: 'QR Codes',       glow: '#a855f7', iconGrad: 'from-purple-600 to-purple-700' },
  { icon: WhatsApp,      label: 'WhatsApp',       glow: '#25d366', iconGrad: 'from-green-400 to-green-600' },
];

export function WorksAcrossEveryChannelSection() {
  return (
    <section
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm font-semibold text-purple-300">Every Touchpoint</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
            Works Across Every Channel
          </h2>
          <p className="text-white/50">One AI, unlimited touchpoints</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CHANNELS.map((channel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative rounded-xl p-px overflow-hidden cursor-default"
              style={{ background: 'linear-gradient(135deg, #7c3aed44, #FF572244)' }}
            >
              <div
                className="relative rounded-xl p-5 flex flex-col items-center overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}
              >
                <div
                  className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none"
                  style={{ background: channel.glow + '55' }}
                />
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.iconGrad} flex items-center justify-center mb-3 shadow-md`}
                  style={{ boxShadow: `0 0 14px ${channel.glow}44` }}
                >
                  <channel.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-center text-xs text-white/70 font-medium leading-tight">
                  {channel.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
