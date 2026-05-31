'use client';

import Image from "next/image";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles, BookOpen, Mail, Users } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About Us", icon: Users },
  { href: "/contact", label: "Contact", icon: Mail },
  /*{ href: "/newsletter", label: "Get Updates", icon: Bell },*/
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Sophisticated Navigation Bar */}
        <nav className="transition-all duration-500 bg-white backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_-20px_rgba(107,45,158,0.1)] border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">

              {/* Logo - Crisp rendering, no blend mode wash-out */}
              <Link href="/" className="flex items-center -ml-2 group">
                <Image
                  src="/assets/qualiflow-logo-full-v8.jpg"
                  alt="QualiflowAI - Every Lead Gets a Reply"
                  width={180}
                  height={48}
                  className="h-10 md:h-12 w-auto group-hover:drop-shadow-[0_2px_8px_rgba(107,45,158,0.2)] transition-all duration-300"
                  priority
                />
              </Link>

              {/* Desktop Navigation & CTA - Grouped together */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Navigation links - Adaptive pill-style links */}
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 bg-gray-100/80">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      className="group relative px-5 py-2 font-medium text-sm transition-all duration-200 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white"
                    >
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* CTA Button - Dark orange to orange gradient */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/waitlist"
                    className="group relative inline-flex items-center gap-2 px-6 py-2.5 overflow-hidden rounded-full font-semibold text-sm text-white transition-all duration-300 backdrop-blur-xl bg-gradient-to-r from-[#E64A19] to-[#FF5722] border border-white/20 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40"
                  >
                    {/* Glass effect overlay */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                    {/* Animated gradient shine */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-1.5">
                      Get Early Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-3">
                <Link
                  href="/waitlist"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#E64A19] to-[#FF5722] text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-500/25"
                >
                  Get Access
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    mobileMenuOpen 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-[#6B2D9E]'
                  }`}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Menu className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Panel - Slide from top */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed top-[calc(1rem+3.5rem)] left-4 right-4 bg-white rounded-2xl shadow-2xl shadow-purple-500/10 border border-gray-100 z-50 md:hidden overflow-hidden"
            >
              {/* Menu Items */}
              <div className="p-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Link 
                      href={link.href}
                      className="flex items-center gap-4 px-4 py-4 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-[#6B2D9E] hover:to-[#8B3DAE] rounded-xl font-medium transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-[#6B2D9E] group-hover:to-[#8B3DAE] flex items-center justify-center transition-colors">
                        <link.icon className="w-5 h-5 text-[#6B2D9E] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-base group-hover:text-white transition-colors">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom CTA */}
              <div className="p-4 pt-2 border-t border-gray-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <Link
                  href="/waitlist"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-[#6B2D9E] to-[#9333EA] text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
