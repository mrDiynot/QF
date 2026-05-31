'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Play, Pause, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CallScenario {
  title: string;
  customer: string;
  /** Audio file served from public/audio/ */
  audioSrc: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CALL_SCENARIOS: CallScenario[] = [
  {
    title: 'Retail & E-commerce',
    customer: 'David Doo',
    audioSrc: '/audio/retail-and-ecomerce.mp3',
  },
  //{
  //  title: 'Fitness Studio',
  //  customer: 'Jessica Martinez',
  //  audioSrc: '/audio/fitness-studio.mp3',
  //},
  //{
  //  title: 'Real Estate Agent',
  //  customer: 'David Thompson',
  //  audioSrc: '/audio/real-estate.mp3',
  //VoiceCallSimulator_homeService},
];

const FEATURES = [
  'Natural, conversational AI voice',
  'Smart question sequencing',
  'Real-time lead qualification',
  'Appointment booking confirmation',
];

// Pre-compute random waveform keyframes (module-level to avoid SSR mismatch)
const WAVEFORM_BARS = 25;
const WAVEFORM_KEYFRAMES = Array.from({ length: WAVEFORM_BARS }, () => [
  8,
  Math.random() * 50 + 10,
  Math.random() * 45 + 8,
  Math.random() * 55 + 12,
  8,
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VoiceCallSimulator_retail_ecommerce({ onBookDemo }: { onBookDemo?: () => void } = {}) {
  const [isCallPlaying, setIsCallPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [mounted, setMounted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create / swap audio element when scenario changes
  useEffect(() => {
    if (!mounted) return;

    const src = CALL_SCENARIOS[selectedScenario].audioSrc;

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    const audio = new Audio(src);
    audio.preload = 'auto';
    audioRef.current = audio;

    // Reset state
    setIsCallPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsCallPlaying(false);
      setCurrentTime(audio.duration);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [selectedScenario, mounted]);

  // Sync current time with audio playback
  const syncTime = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('timeupdate', syncTime);
    return () => audio.removeEventListener('timeupdate', syncTime);
  }, [syncTime]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCallPlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isCallPlaying) {
      audio.pause();
      setIsCallPlaying(false);
    } else {
      // If ended, restart
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().catch(() => {/* user gesture required */});
      setIsCallPlaying(true);
    }
  };

  const handleScenarioChange = (index: number) => {
    if (index === selectedScenario) return;
    setSelectedScenario(index);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-[#2D1B4E] via-[#1a0f2e] to-[#2D1B4E] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full mb-3">
            <PhoneCall className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-white">Live Call Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hear QualiFlow&apos;s AI in Action
          </h2>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto">
            Listen to realistic conversations where our AI qualifies leads, books appointments, and
            handles customer inquiries naturally
          </p>
        </motion.div>

        {/* Main Card */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
          >
            {/* Two-column layout */}
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              {/* Scenario Selector */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                 Demo Scenario:
                </label>
                <div className="space-y-1.5">
                  {CALL_SCENARIOS.map((s, index) => (
                    <button
                      key={index}
                      onClick={() => handleScenarioChange(index)}
                      className={`w-full text-left p-2 rounded-lg transition-all ${
                        selectedScenario === index
                          ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-2 border-orange-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-white font-semibold text-sm">{s.title}</div>
                      <div className="text-purple-300 text-xs">{s.customer}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call Controls */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-2.5 border border-purple-500/30 flex flex-col justify-center">
                {/* Waveform */}
                <div className="flex items-center justify-center gap-1 h-10 mb-2">
                  {WAVEFORM_KEYFRAMES.map((keyframes, i) => (
                    <motion.div
                      key={i}
                      animate={
                        mounted && isCallPlaying
                          ? { height: keyframes }
                          : { height: [4, 6, 4] }
                      }
                      transition={
                        mounted && isCallPlaying
                          ? {
                              repeat: Infinity,
                              duration: 0.6 + (i % 5) * 0.08,
                              delay: i * 0.03,
                              ease: 'easeInOut',
                            }
                          : {
                              repeat: Infinity,
                              duration: 2,
                              delay: i * 0.1,
                              ease: 'easeInOut',
                            }
                      }
                      className={`w-1 rounded-full transition-colors duration-300 ${
                        isCallPlaying
                          ? 'bg-gradient-to-t from-orange-500 to-pink-500'
                          : 'bg-gradient-to-t from-purple-500/30 to-pink-500/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Time Display */}
                <div className="text-center mb-2">
                  <div className="text-xl font-bold text-white">
                    {formatTime(currentTime)}{' '}
                    <span className="text-purple-300 text-base">
                      / {duration > 0 ? formatTime(duration) : '0:00'}
                    </span>
                  </div>
                  <div className="text-xs text-purple-300 mt-0.5">
                    {isCallPlaying ? 'Call in Progress...' : currentTime > 0 && !isCallPlaying && currentTime >= duration ? 'Call Ended' : 'Ready to Start'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-600 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Play / Pause Button */}
                <button
                  onClick={handleCallPlayPause}
                  className="w-full py-2 bg-gradient-to-r from-[#FF5722] to-orange-600 text-white rounded-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  {isCallPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Call
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {currentTime === 0 || (currentTime >= duration && duration > 0)
                        ? 'Start Call Demo'
                        : 'Resume Call'}
                    </>
                  )}
                </button>


              </div>
            </div>

            {/* Features Highlight */}
            <div className="border-t border-white/10 pt-2.5">
              <div className="text-xs text-purple-200 mb-1.5 font-semibold">
                What You&apos;ll Hear:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-purple-200">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-6"
        >
          <p className="text-purple-200 mb-4">
            Ready to transform your customer calls with AI?
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={onBookDemo}
              className="px-8 py-3 bg-gradient-to-r from-[#FF5722] to-orange-600 text-white rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-semibold inline-flex items-center gap-2"
            >
              Book Your Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all font-semibold inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
