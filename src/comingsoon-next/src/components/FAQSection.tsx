'use client';

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "What is QualiFlow?",
    answer:
      "QualiFlow is an AI-powered customer journey platform that automates lead capture, qualification, engagement, and conversion across all channels. From the moment a lead reaches out via text, call, email, or social media, QualiFlow handles everything — qualifying, nurturing, booking, and following up — so you can focus on delivering great service.",
  },
  {
    question: "How does the AI actually work?",
    answer:
      "QualiFlow uses advanced, agentic AI to understand customer intent, qualify leads in real time, and respond intelligently across every channel. Unlike traditional automation, our agentic system doesn't just reply, it makes decisions and completes tasks autonomously. From booking appointments and sending proposals to triggering follow-ups and updating the CRM, QualiFlow executes the next best action without manual input. The AI continuously learns from your business context, email interactions, response patterns, CRM data, and customer behavior to improve lead scoring, engagement, and conversion outcomes over time. It handles conversations across text, email, phone calls, web chat, and social media automatically, while ensuring real task completion, not just responses.",
  },
  {
    question: "What channels does QualiFlow support?",
    answer:
      "QualiFlow captures and responds to leads across all major channels: SMS, email, phone calls (inbound & outbound AI voice), Facebook Messenger, Instagram DMs, Google Business Messages, web chat, and more. All conversations are unified in one intelligent inbox.",
  },
  {
    question: "Do I need to replace my existing tools?",
    answer:
      "Not necessarily. QualiFlow integrates with popular CRMs, calendars, payment processors, and business tools. You can use QualiFlow as your all-in-one platform or integrate it with your existing stack. Our built-in CRM with AI-powered lead scoring means many businesses can consolidate and simplify their tech stack.",
  },
  {
    question: "How long does it take to set up?",
    answer:
      "Setup is quick and easy. To fully take advantage of all capabilities, we recommend scheduling your onboarding call as soon as you sign up to ensure all integrations are configured properly. Most businesses are up and running in under 15 minutes. Our AI-powered signup flow guides you through setup with intelligent recommendations tailored to your industry. You can begin capturing and responding to leads immediately.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. QualiFlow is SOC 2 certified, GDPR compliant, and uses 256-bit encryption. Your data is never shared or sold. We take security and privacy seriously so you can focus on growing your business with peace of mind.",
  },
  {
    question: "Can I try QualiFlow before committing?",
    answer:
      "Yes! We offer a free trial so you can experience the platform firsthand. No credit card required to start. Join the waitlist now to get early access when we launch.",
  },
  {
    question: "What industries is QualiFlow best for?",
    answer:
      "QualiFlow works for any service-based business that deals with leads and appointments. We have specialized solutions for home services, beauty & wellness, automotive, auto dealerships, real estate, healthcare, professional services, retail, e-commerce, SaaS, and B2B companies.",
  },
];

// ---------------------------------------------------------------------------
// Single FAQ item with animated expand
// ---------------------------------------------------------------------------
function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`group relative flex items-center justify-between w-full cursor-pointer px-6 py-3 transition-colors duration-300 text-left overflow-hidden ${open ? "bg-gradient-to-r from-[#4B1D8E] to-[#6B2D9E] shadow-[0_0_20px_rgba(107,45,158,0.5)]" : "hover:bg-white/5"}`}
        aria-expanded={open}
      >
        {/* Shimmer sweep — mirrors the nav CTA effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
        <h3 className="text-lg font-semibold text-white pr-8 relative z-10">{faq.question}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 relative z-10"
        >
          <ChevronDown className="w-5 h-5 text-purple-400" />
        </motion.span>
      </button>

      {/* Animated answer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <motion.p
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="px-6 pb-6 text-purple-200 leading-relaxed"
            >
              {faq.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function FAQSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#2D1B4E] via-[#1a0f2e] to-[#2D1B4E]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-6">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="text-sm text-white">Frequently Asked Questions</span>
          </div>
          <h2 className="text-5xl mb-4 font-bold text-purple-300">Got Questions?</h2>
          <p className="text-xl text-purple-200">Everything you need to know about QualiFlow</p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-purple-200 mb-6">Still have questions?</p>
          <Link
            href="/contact"
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all inline-flex items-center gap-2 font-semibold"
          >
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
