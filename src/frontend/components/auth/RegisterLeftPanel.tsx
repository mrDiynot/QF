'use client';

import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Zap, Calendar, MessageSquare, BarChart2, FileText } from 'lucide-react';

const features = [
  { icon: Zap,           text: 'Omnichannel lead capture across every channel' },
  { icon: MessageSquare, text: 'AI conversational engagement & qualification' },
  { icon: Calendar,      text: 'Smart booking & calendar automation' },
  { icon: BarChart2,     text: 'Built-in CRM with AI-powered lead scoring' },
  { icon: FileText,      text: 'Automated proposals & follow-up sequences' },
  { icon: CheckCircle,   text: 'Reviews, surveys & customer re-engagement' },
];

export function RegisterLeftPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-white space-y-8"
    >
      {/* Logo + Title */}
      <div>
        <div className="flex items-center gap-3 mb-4">
        
          <h1 className="text-4xl font-bold tracking-tight">QualiFlow AI</h1>
        </div>
        <h2 className="text-3xl font-semibold mb-4 leading-snug">
          Automated Customer Journey Platform
        </h2>
        <p className="text-purple-200 text-lg leading-relaxed">
          Capture leads, qualify them, book appointments, create proposals, follow up, and
          re-engage customers automatically across every channel.
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 text-purple-100"
            >
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
        <div>
          <div className="text-3xl font-bold mb-1">10k+</div>
          <div className="text-purple-300 text-sm">Active Users</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">500k+</div>
          <div className="text-purple-300 text-sm">Leads Processed</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">94%</div>
          <div className="text-purple-300 text-sm">Satisfaction Rate</div>
        </div>
      </div>
    </motion.div>
  );
}
