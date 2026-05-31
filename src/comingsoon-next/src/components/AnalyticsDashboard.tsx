"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";

interface AnalyticsDashboardProps {
  onGetEarlyAccess?: () => void;
}

export function AnalyticsDashboard({ onGetEarlyAccess }: AnalyticsDashboardProps = {}) {
  const [counts, setCounts] = useState({
    leads: 0,
    booked: 0,
    revenue: 0,
    conversion: 0
  });

  useEffect(() => {
    // Animate numbers counting up and loop forever
    const duration = 2000;
    const pauseDuration = 1500;
    const steps = 60;
    const interval = duration / steps;
    const targets = {
      leads: 1200,
      booked: 225,
      revenue: 34000,
      conversion: 34
    };

    const animateUp = () => {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setCounts({
          leads: Math.floor(targets.leads * progress),
          booked: Math.floor(targets.booked * progress),
          revenue: Math.floor(targets.revenue * progress),
          conversion: Math.floor(targets.conversion * progress),
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounts(targets);
          // After reaching the target, wait and then animate down
          setTimeout(animateDown, pauseDuration);
        }
      }, interval);
    };

    const animateDown = () => {
      let step = steps;
      const timer = setInterval(() => {
        step--;
        const progress = step / steps;
        setCounts({
          leads: Math.floor(targets.leads * progress),
          booked: Math.floor(targets.booked * progress),
          revenue: Math.floor(targets.revenue * progress),
          conversion: Math.floor(targets.conversion * progress),
        });

        if (step <= 0) {
          clearInterval(timer);
          setCounts({
            leads: 0,
            booked: 0,
            revenue: 0,
            conversion: 0
          });
          // After reaching zero, wait and then animate up again
          setTimeout(animateUp, pauseDuration);
        }
      }, interval);
    };

    // Start the animation
    animateUp();

    // Cleanup is handled by clearing intervals in the animation functions
    return () => {};
  }, []);

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6B2D9E] via-[#8B3DAE] to-[#FF5722] bg-clip-text text-transparent mb-4">
              Real Results, Real Time
            </h2>
          </motion.div>
        </div>

        {/* Two-column layout for desktop, stacked for mobile */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT: Image with floating analytics */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-full">
            {/* Background Image */}
            <Image
              src="/assets/d96b439b-fd4c-49ba-9ce2-a7d833d0ac10.png"
              alt="Focused businesswoman working on laptop at desk with charts and graphs - Photo by olia danilevich on Pexels"
              fill
              className="object-cover"
            />

            {/* Floating Stats Bubbles - Scattered */}
            {/* Top Left - Leads */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute top-3 sm:top-6 left-3 sm:left-6 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 md:hidden"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{counts.leads.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600">Leads</div>
                </div>
              </div>
            </motion.div>

            {/* Top Right - Conversion Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-3 sm:top-6 right-3 sm:right-6 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 md:hidden"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{counts.conversion}%</div>
                  <div className="text-[10px] text-gray-600">Conversion</div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Left - Revenue */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 md:hidden"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">${(counts.revenue / 1000).toFixed(1)}K</div>
                  <div className="text-[10px] text-gray-600">Revenue</div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right - Meetings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 md:hidden"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{counts.booked.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600">Booked</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Top Performing Channels */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Top Performing Channels</h3>
              </div>
              <div className="space-y-5">
                {[
                  { name: "Web Chat", rate: 72, color: "from-purple-500 to-pink-500" },
                  { name: "Facebook", rate: 64, color: "from-purple-500 to-pink-500" },
                  { name: "Instagram", rate: 58, color: "from-purple-500 to-pink-500" }
                ].map((channel, index) => (
                  <div key={channel.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">{channel.name}</div>
                      <div className="text-sm font-bold text-purple-600">{channel.rate}%</div>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: [`0%`, `${channel.rate}%`, `${channel.rate}%`, `0%`] }}
                        transition={{ 
                          duration: 6, 
                          delay: index * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.3, 0.7, 1]
                        }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${channel.color} rounded-full`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Journey Performance Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Top Performing Journeys</h3>
              </div>
              <div className="space-y-5">
                {[
                  { name: "Lead → Booking", rate: 68, color: "from-purple-500 to-pink-500" },
                  { name: "Survey Flow", rate: 61, color: "from-purple-500 to-pink-500" },
                  { name: "Missed Call Follow-up", rate: 54, color: "from-purple-500 to-pink-500" }
                ].map((journey, index) => (
                  <div key={journey.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">{journey.name}</div>
                      <div className="text-sm font-bold text-purple-600">{journey.rate}%</div>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: [`0%`, `${journey.rate}%`, `${journey.rate}%`, `0%`] }}
                        transition={{ 
                          duration: 6, 
                          delay: index * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.3, 0.7, 1]
                        }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${journey.color} rounded-full`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-4 hidden md:block">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">34% Conversion Rate</h4>
                  <p className="text-sm text-gray-700">Automated journeys convert better than manual follow-ups</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">$34K Revenue Generated</h4>
                  <p className="text-sm text-gray-700">Track ROI in real-time across all customer journeys</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">225 Meetings Booked</h4>
                  <p className="text-sm text-gray-700">Never miss an opportunity with automated booking</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetEarlyAccess || (() => {
                const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                if (input) {
                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => input.focus(), 500);
                }
              })}
              className="h-14 px-10 bg-gradient-to-r from-[#8B5CF6] via-[#C084FC] to-[#FF5722] hover:from-[#7C3AED] hover:via-[#A855F7] hover:to-[#E64A19] text-white font-bold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
              aria-label="Get early access to QualiflowAI analytics"
            >
              Get Early Access
            </button>
            <button
              onClick={() => {
                // Demo video scroll action
                const videoSection = document.querySelector('[class*="Product Preview"]') || document.querySelector('video');
                if (videoSection) {
                  videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="h-14 px-10 bg-transparent border-2 border-purple-600 text-purple-600 font-bold text-lg rounded-lg hover:bg-purple-50 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              aria-label="Watch QualiflowAI demo video"
            >
              Watch Demo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
