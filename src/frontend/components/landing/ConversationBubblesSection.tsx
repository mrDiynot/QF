'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

function ConversationBubbles() {
  return (
    <>
      {/* Customer Question */}
      <div className="absolute bottom-4 left-1 md:left-6 max-w-[160px] sm:max-w-[200px] md:max-w-[300px] bg-gradient-to-br from-gray-700 to-gray-800 p-2 pl-8 md:p-4 md:pl-12 rounded-2xl rounded-bl-none shadow-xl border border-gray-600">
        <p className="text-xs font-medium text-white leading-loose">
          Hi I am interested in a photo shoot, do you have availability next month?
        </p>
        <div className="text-[10px] text-gray-300 mt-1 font-semibold">Customer</div>
      </div>

      {/* Customer Avatar */}
      <div className="absolute bottom-4 left-0 md:left-6 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-white z-10">
        <span className="text-white font-bold text-sm">S</span>
      </div>

      {/* Typing dots */}
      <motion.div className="absolute top-[38%] right-2 md:right-6 -translate-y-1/2 flex items-center gap-1.5 z-30">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3.5 h-3.5 bg-purple-600 rounded-full border-[3px] border-white"
            animate={{ y: [0, -6, 0], opacity: [0, 1, 1, 0] }}
            transition={{
              y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 },
              opacity: { duration: 3, times: [0, 0.17, 0.83, 1], repeat: Infinity, repeatDelay: 2 },
            }}
          />
        ))}
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="absolute top-[54%] right-1 md:top-[58%] md:right-6 -translate-y-1/2 max-w-[200px] sm:max-w-[260px] md:max-w-[420px] bg-gradient-to-br from-[#6B2D9E] to-[#5B2486] p-2 md:p-5 rounded-2xl rounded-tr-none shadow-xl border border-purple-600 z-10"
        animate={{ opacity: [0, 0, 1, 1, 1, 0] }}
        transition={{ duration: 8, times: [0, 0.23, 0.27, 0.78, 0.82, 1], repeat: Infinity, repeatDelay: 1 }}
      >
        <div className="space-y-1 md:space-y-3">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Hi Sarah! Yes I have some great spots available in early February. What type of shoot are you thinking?
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Portrait, family, or something else?
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white leading-relaxed">
            Check out my portfolio and packages here.
          </p>
        </div>
        <div className="text-[10px] md:text-xs text-purple-200 mt-2 md:mt-3 font-semibold">QualiFlow AI</div>
      </motion.div>
    </>
  );
}

export function ConversationBubblesSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-purple-200/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-orange-200/20 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <ScrollReveal direction="right" className="order-1 lg:order-2 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-[#6B2D9E]">Customer Experience</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Give Your Leads VIP Treatment
            </h2>
            <p className="text-base font-semibold text-[#6B2D9E] mb-4">
              THE AI THAT NEVER STOPS LEARNING YOUR BUSINESS AND LEADS
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              QualiFlow AI creates seamless, personalized conversations that feel human — not robotic.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] flex items-center justify-center shadow-lg shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Conversational AI That Feels Natural</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5722] to-[#E64A19] flex items-center justify-center shadow-lg shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Instant Response, Anytime</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#DB2777] flex items-center justify-center shadow-lg shrink-0">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Personalized Every Time</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Effortless Booking</h3>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 h-14 px-10 bg-gradient-to-r from-[#6B2D9E] to-[#8B3DAE] hover:from-[#5B2486] hover:to-[#7B2D9E] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Image with Conversation Bubbles */}
          <ScrollReveal direction="left" className="order-2 lg:order-1 w-full mb-36 md:mb-0">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#6B2D9E]/20 via-[#EC4899]/10 to-[#FF5722]/20 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/assets/0679bb94-e480-454d-80cd-a02a67b0de88.png"
                  alt="Happy customer using Qualiflow AI"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  loading="eager"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              <ConversationBubbles />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default ConversationBubblesSection;
