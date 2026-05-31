'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    question: 'What is QualiFlow AI?',
    answer: "QualiFlow AI is an AI-powered customer journey platform that automates lead capture, qualification, engagement, and conversion across all channels. From the moment a lead reaches out via text, call, email, or social media, QualiFlow AI handles everything — qualifying, nurturing, booking, and following up — so you can focus on delivering great service.",
  },
  {
    question: 'How does the AI actually work?',
    answer: "QualiFlow AI uses advanced, agentic AI to understand customer intent, qualify leads in real time, and respond intelligently across every channel. Unlike traditional automation, our agentic system doesn't just reply, it makes decisions and completes tasks autonomously. From booking appointments and sending proposals to triggering follow-ups and updating the CRM, QualiFlow AI executes the next best action without manual input. The AI continuously learns from your business context, email interactions, response patterns, CRM data, and customer behavior to improve lead scoring, engagement, and conversion outcomes over time.",
  },
  {
    question: 'What channels does QualiFlow AI support?',
    answer: "QualiFlow AI captures and responds to leads across all major channels: SMS, email, phone calls (inbound & outbound AI voice), Facebook Messenger, Instagram DMs, Google Business Messages, web chat, and more. All conversations are unified in one intelligent inbox.",
  },
  {
    question: 'Do I need to replace my existing tools?',
    answer: "Not necessarily. QualiFlow AI integrates with popular CRMs, calendars, payment processors, and business tools. You can use QualiFlow AI as your all-in-one platform or integrate it with your existing stack. Our built-in CRM with AI-powered lead scoring means many businesses can consolidate and simplify their tech stack.",
  },
  {
    question: 'How long does it take to set up?',
    answer: "Setup is quick and easy. To fully take advantage of all capabilities, we recommend scheduling your onboarding call as soon as you sign up to ensure all integrations are configured properly. Most businesses are up and running in under 15 minutes. Our AI-powered signup flow guides you through setup with intelligent recommendations tailored to your industry.",
  },
  {
    question: 'Is my data secure and private?',
    answer: "Absolutely. QualiFlow AI is SOC 2 certified, GDPR compliant, and uses 256-bit encryption. Your data is never shared or sold. We take security and privacy seriously so you can focus on growing your business with peace of mind.",
  },
  {
    question: 'Can I try QualiFlow AI before committing?',
    answer: "Yes! We offer a free trial so you can experience the platform firsthand. No credit card required to start. Join the waitlist now to get early access when we launch.",
  },
  {
    question: 'What industries is QualiFlow AI best for?',
    answer: "QualiFlow AI works for any service-based business that deals with leads and appointments. We have specialized solutions for home services, beauty & wellness, automotive, auto dealerships, real estate, healthcare, professional services, retail, e-commerce, SaaS, and B2B companies.",
  },
];

interface FAQSectionProps {
  faqs?: FAQ[];
  className?: string;
}

export function FAQSection({ faqs = DEFAULT_FAQS, className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className={`relative py-24 px-6 overflow-hidden ${className ?? ''}`}
      style={{ background: 'linear-gradient(135deg, #0D0520 0%, #1E0A4C 40%, #0D0520 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.14]"
          style={{ background: '#7C3AED', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-[0.06]"
          style={{ background: '#FF5722', filter: 'blur(100px)' }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 border"
            style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.4)', color: '#C4B5FD' }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: '#FF5722' }} />
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Frequently Asked{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #C084FC, #A855F7)' }}
            >
              Questions
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#A78BFA' }}>
            Everything you need to know about QualiFlow AI
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: isOpen ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.15)',
                  background: isOpen
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(88,28,220,0.08) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  boxShadow: isOpen ? '0 0 24px rgba(124,58,237,0.12)' : 'none',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="font-semibold text-base leading-snug transition-colors duration-200"
                    style={{ color: isOpen ? '#C4B5FD' : '#E9D5FF' }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 transition-transform duration-300"
                    style={{
                      color: isOpen ? '#A78BFA' : '#6D28D9',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div
                        className="px-6 pb-5 text-sm leading-relaxed pt-4"
                        style={{ color: '#C4B5FD', borderTop: '1px solid rgba(124,58,237,0.15)' }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Help link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Still have questions?{' '}
            <a href="#" className="font-semibold hover:underline transition-colors" style={{ color: '#A78BFA' }}>
              Visit Help Center
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQSection;
