'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Target, Check, ArrowRight, CheckCircle,
  X, Sparkles,
} from 'lucide-react';

type DemoBookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DemoBookingModal({ isOpen, onClose }: DemoBookingModalProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    preferredDate: '',
    goals: [] as string[],
  });

  const goalOptions = [
    'Increase Sales & Conversions',
    'Automate Follow-Ups & Workflows',
    'Improve Customer Communication',
    'Book More Meetings',
    'Organize & Track Leads',
    'Send Proposals Automatically',
    'Collect More Reviews',
    'Reduce No-Shows',
    'Re-engage Inactive Customers',
  ];

  const toggleGoal = (goal: string) => {
    setDemoForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demo request submitted:', demoForm);
    onClose();
    setShowSuccessMessage(true);
    setDemoForm({ name: '', email: '', phone: '', company: '', message: '', preferredDate: '', goals: [] });
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  if (!isOpen && !showSuccessMessage) return null;

  return (
    <AnimatePresence>
      <>
        {/* ── Demo Booking Modal ── */}
        {isOpen && (
          <motion.div
            key="demo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              key="demo-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-[#2D1B4E] via-[#1a0f2e] to-[#2D1B4E] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/10 relative"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              </div>

              {/* Header */}
              <div className="relative p-8 pb-6 border-b border-white/10">
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-4">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white">Schedule Your Demo</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">See QualiFlow AI in Action</h2>
                <p className="text-purple-200">
                  Tell us about your business and we&apos;ll show you how QualiFlow AI can transform your customer journey
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleDemoSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {/* Phone & Company */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={demoForm.company}
                      onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur"
                      placeholder="Company Inc."
                    />
                  </div>
                </div>

                {/* Goals Multi-Select */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    What are your top goals with QualiFlow AI? *
                  </label>
                  <p className="text-xs text-purple-300 mb-3">Select all that apply — this helps us personalize your demo</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10">
                    {goalOptions.map((goal) => (
                      <motion.label
                        key={goal}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                          demoForm.goals.includes(goal)
                            ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-orange-500/50'
                            : 'bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          demoForm.goals.includes(goal)
                            ? 'bg-gradient-to-r from-orange-500 to-pink-600 border-orange-500'
                            : 'border-white/30'
                        }`}>
                          {demoForm.goals.includes(goal) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={demoForm.goals.includes(goal)}
                          onChange={() => toggleGoal(goal)}
                          className="sr-only"
                        />
                        <span className={`text-sm flex-1 ${demoForm.goals.includes(goal) ? 'text-white font-medium' : 'text-purple-200'}`}>
                          {goal}
                        </span>
                        {demoForm.goals.includes(goal) && <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Tell us more about your business (Optional)
                  </label>
                  <textarea
                    value={demoForm.message}
                    onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none backdrop-blur"
                    placeholder="What challenges are you facing? What are you hoping to achieve?"
                    rows={4}
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Preferred Demo Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={demoForm.preferredDate}
                    onChange={(e) => setDemoForm({ ...demoForm, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur [color-scheme:dark]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-semibold backdrop-blur"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FF5722] to-orange-600 text-white rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-semibold inline-flex items-center justify-center gap-2"
                  >
                    Book My Demo
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-4 pt-4 text-xs text-purple-300 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Free 14-day trial</span>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ── Success Modal ── */}
        {showSuccessMessage && (
          <motion.div
            key="success-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              key="success-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-[#2D1B4E] via-[#1a0f2e] to-[#2D1B4E] rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              </div>
              <div className="relative p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-3">Demo Request Received!</h3>
                  <p className="text-purple-200 mb-2">We will contact you to schedule a demo meeting.</p>
                  <p className="text-purple-300 text-sm mb-6">Thanks for choosing QualiFlow AI! 🚀</p>
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF5722] to-orange-600 text-white rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-semibold"
                  >
                    Got it!
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    </AnimatePresence>
  );
}

export default DemoBookingModal;
