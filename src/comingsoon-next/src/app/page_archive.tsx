'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrustBadges } from "@/components/TrustBadges";
import { EmailSignupBox } from "@/components/EmailSignupBox";
import { SecurityCompliance } from "@/components/SecurityCompliance";
import { ConversationBubbles } from "@/components/ConversationBubbles";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { AIDecisionEngineAnimation } from "@/components/AIDecisionEngineAnimation";
import { LogoRing } from "@/components/LogoRing";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { CRMSyncVisualScreen } from "@/components/CRMSyncVisualScreen";
import { ModernVideoPlayer } from "@/components/ModernVideoPlayer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WaitlistCounter, WaitlistCounterDark } from "@/components/WaitlistCounter";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { PriorityAccessModal } from "@/components/PriorityAccessModal";
import { submitToBrevo } from "@/lib/brevo";
import { 
  Mail, Sparkles, Clock, MessageSquare, HeartHandshake, CheckCircle2, 
  Zap, Phone, TrendingUp, MessageCircle, Users, Target, X, ArrowRight, Loader2, AlertCircle 
} from "lucide-react";
import { validateEmail } from "@/lib/validation";

const customerImage = "/assets/0679bb94-e480-454d-80cd-a02a67b0de88.png";
const videoPlaceholder = "https://images.pexels.com/photos/10020092/pexels-photo-10020092.jpeg";

export default function Home() {
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [emailSignupVariant, setEmailSignupVariant] = useState<'early-access' | 'newsletter'>('early-access');
  
  // Priority Access Modal state
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [modalPrefilledEmail, setModalPrefilledEmail] = useState('');
  
  // Hero email form state
  const [heroEmail, setHeroEmail] = useState('');
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);
  const [heroAlreadySubscribed, setHeroAlreadySubscribed] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [heroSubmittedEmail, setHeroSubmittedEmail] = useState('');

  // Journey section email form state
  const [journeyEmail, setJourneyEmail] = useState('');
  const [journeySubmitting, setJourneySubmitting] = useState(false);
  const [journeySuccess, setJourneySuccess] = useState(false);
  const [journeyAlreadySubscribed, setJourneyAlreadySubscribed] = useState(false);
  const [journeyError, setJourneyError] = useState('');
  const [journeySubmittedEmail, setJourneySubmittedEmail] = useState('');

  const handleEmailSuccess = (email: string) => {
    console.log('Email captured:', email);
    setShowEmailSignup(false);
  };

  const handleShowPriorityModal = (email: string) => {
    setModalPrefilledEmail(email);
    setShowPriorityModal(true);
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroError('');
    
    const emailValidation = validateEmail(heroEmail);
    if (!emailValidation.isValid) {
      setHeroError(emailValidation.error || 'Invalid email');
      return;
    }
    
    setHeroSubmitting(true);
    
    try {
      const result = await submitToBrevo(heroEmail, 'hero-section');
      console.log('[Hero] submitToBrevo result:', result);
      if (result.success) {
        setHeroSubmittedEmail(heroEmail);
        setHeroSuccess(true);
        const alreadySubmitted = result.alreadySubmitted === true;
        console.log('[Hero] Setting heroAlreadySubscribed to:', alreadySubmitted);
        setHeroAlreadySubscribed(alreadySubmitted);
        setModalPrefilledEmail(heroEmail);
        setHeroEmail('');
        // Show priority access modal after successful submission (only for new signups)
        if (!alreadySubmitted) {
          setTimeout(() => {
            setShowPriorityModal(true);
          }, 500);
        }
      } else {
        setHeroError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setHeroError('Network error. Please check your connection and try again.');
    } finally {
      setHeroSubmitting(false);
    }
  };

  const handleJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJourneyError('');
    
    const emailValidation = validateEmail(journeyEmail);
    if (!emailValidation.isValid) {
      setJourneyError(emailValidation.error || 'Invalid email');
      return;
    }
    
    setJourneySubmitting(true);
    
    try {
      const result = await submitToBrevo(journeyEmail, 'journey-section');
      console.log('[Journey] submitToBrevo result:', result);
      if (result.success) {
        setJourneySubmittedEmail(journeyEmail);
        setJourneySuccess(true);
        const alreadySubmitted = result.alreadySubmitted === true;
        console.log('[Journey] Setting journeyAlreadySubscribed to:', alreadySubmitted);
        setJourneyAlreadySubscribed(alreadySubmitted);
        setModalPrefilledEmail(journeyEmail);
        setJourneyEmail('');
        
        // Show priority access modal after successful submission (only for new signups)
        if (!alreadySubmitted) {
          setTimeout(() => {
            setShowPriorityModal(true);
          }, 500);
        }
      } else {
        setJourneyError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setJourneyError('Network error. Please check your connection and try again.');
    } finally {
      setJourneySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section - Enhanced */}
      <section className="relative pt-22 pb-24 lg:pt-32 lg:pb-36 px-6 overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#4a2875]">
        {/* Animated floating elements */}
        <FloatingElements />
        
        {/* Large Q Logo Watermark */}
        <div className="absolute top-1/2 left-[42%] -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Image 
            src="/assets/qualiflow-logo_no_text.png" 
            alt="QualiflowAI Logo" 
            width={600}
            height={600}
            className="w-[600px] h-auto"
          />
        </div>
        
        {/* Multiple gradient orbs for depth */}
        <motion.div 
          className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-radial from-[#FF5722]/20 via-[#FF5722]/5 to-transparent rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-radial from-[#8B5CF6]/25 to-transparent rounded-full blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-radial from-[#EC4899]/15 to-transparent rounded-full blur-[80px]"
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle mesh pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Real-Time Dashboard - Shown above hero text on mobile, side-by-side on desktop */}
          <motion.div 
            className="flex items-center justify-center mb-8 lg:hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="w-[340px] max-w-full">
              <AIDecisionEngineAnimation />
            </div>
          </motion.div>

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <motion.div 
              className="text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Waitlist Counter */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <WaitlistCounter baseCount={1247} />
              </motion.div>

              {/* Main Headline with gradient accent */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tight leading-[1.05] mb-6">
                <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">Never Miss a</span>
                <br />
                <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB347] bg-clip-text text-transparent drop-shadow-lg">Lead Again</span>
              </h1>

              {/* AI Platform Badge - refined glass effect */}
              <motion.div 
                className="inline-block mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="relative px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <span className="text-white/90 font-medium text-sm tracking-wide">
                    The AI Powered Customer Journey Platform
                  </span>
                </div>
              </motion.div>

              {/* Subheadline - improved typography */}
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg leading-relaxed font-light">
                Turns leads into revenue on autopilot—captured via phone, social, SMS, email, web chat, web forms and QR codes.
              </p>

              {/* Urgency Badge - refined with pulse animation */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF6B35] rounded-full text-white text-sm font-semibold mb-8 shadow-lg shadow-orange-500/30"
                animate={{ boxShadow: ['0 10px 30px -10px rgba(255,87,34,0.4)', '0 10px 40px -10px rgba(255,87,34,0.6)', '0 10px 30px -10px rgba(255,87,34,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Limited spots available • Launching Soon!
              </motion.div>

              {/* Inline Email Signup - refined glass card */}
              <div className="mb-8">
                {/* Success Message - Shows above form */}
                {heroSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-2xl p-5 max-w-lg shadow-2xl mb-4 ${heroAlreadySubscribed ? 'bg-blue-50 border border-blue-200' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${heroAlreadySubscribed ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <CheckCircle2 className={`w-5 h-5 ${heroAlreadySubscribed ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">
                          {heroAlreadySubscribed ? 'You\'re already subscribed! 📧' : 'You\'re on the list! 🎉'}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          {heroAlreadySubscribed ? (
                            <>Email: <span className="font-semibold text-[#6B2D9E]">{heroSubmittedEmail}</span></>
                          ) : (
                            <>Confirmation sent to: <span className="font-semibold text-[#6B2D9E]">{heroSubmittedEmail}</span></>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {heroAlreadySubscribed 
                            ? 'This email is already on our waitlist. We\'ll keep you updated!'
                            : 'Check your inbox for a welcome email.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Form - Always visible */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 max-w-lg border border-white/10">
                  <form 
                    className="flex flex-col sm:flex-row gap-2"
                    onSubmit={handleHeroSubmit}
                  >
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={heroEmail}
                        onChange={(e) => setHeroEmail(e.target.value)}
                        placeholder="Enter your work email"
                        disabled={heroSubmitting}
                        className="w-full h-14 pl-12 pr-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5722] text-gray-900 text-base placeholder:text-gray-400 disabled:opacity-70 shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={heroSubmitting}
                      className="h-14 px-8 bg-gradient-to-r from-[#FF5722] to-[#FF6B35] hover:from-[#E64A19] hover:to-[#FF5722] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {heroSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Get Early Access
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {heroError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-200 bg-red-500/20 border border-red-400/30 px-4 py-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{heroError}</span>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <TrustBadges />
            </motion.div>

            {/* Hero Visual - AI Decision Engine Animation - Desktop only */}
            <motion.div 
              className="hidden lg:flex items-center justify-center lg:justify-end w-full overflow-visible"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="scale-[0.92] lg:-mt-20 lg:mb-0 lg:-mr-4">
                <AIDecisionEngineAnimation />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Preview Section - White for breathing room */}
      <section className="py-28 px-6 bg-white relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-orange-100/30 to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full mb-2">
              
              <span className="text-sm font-semibold text-[#6B2D9E]">See It In Action</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
              The AI Powered Customer Journey Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              QualiflowAI turns your leads into revenue automatically. Captures, qualifies, books, follows up, collects reviews, and re-engages.
            </p>
          </ScrollReveal>

          {/* Video Player */}
          <ScrollReveal delay={0.2}>
            <div id="demo-video" className="mb-8 flex justify-center">
              <div className="bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] rounded-3xl p-3 w-full max-w-4xl shadow-2xl shadow-purple-500/20">
                <ModernVideoPlayer
                  className="h-[280px] sm:h-[380px] md:h-[500px]"
                  poster={videoPlaceholder}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.3} className="text-center mt-12">
            <button 
              onClick={() => {
                const videoSection = document.getElementById('demo-video');
                if (videoSection) {
                  videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Try to auto-play the video
                  const video = videoSection.querySelector('video');
                  if (video) {
                    video.play().catch(() => {});
                  }
                }
              }}
              className="relative px-8 py-4 bg-gradient-to-r from-[#FF5722] to-[#FF6D3F] text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Watch Demo
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Customer Experience Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
        {/* Decorative elements */}
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

              {/* Benefits List */}
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

              {/* CTA Button */}
              <div className="mt-10">
                <button
                  onClick={() => setShowEmailSignup(true)}
                  className="h-14 px-10 bg-gradient-to-r from-[#6B2D9E] to-[#8B3DAE] hover:from-[#5B2486] hover:to-[#7B2D9E] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Early Access
                </button>
              </div>
            </ScrollReveal>

            {/* Image with Conversation Bubbles */}
            <ScrollReveal direction="left" className="order-2 lg:order-1 w-full mb-36 md:mb-0">
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#6B2D9E]/20 via-[#EC4899]/10 to-[#FF5722]/20 rounded-3xl blur-xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                  <Image 
                    src={customerImage} 
                    alt="Happy customer using QualiflowAI" 
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    loading="eager"
                    quality={85}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                <ConversationBubbles />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section - Pre-Built AI Customer Journeys */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-purple-50/30" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pre-Built AI Customer Journey.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {/* Row 1 */}
              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">1</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">New Lead Qualification → Booking</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  AI responds instantly, qualifies, scores, and books appointments automatically.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Missed Call Recovery</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  When a call is missed, AI sends SMS, email, and can place an outbound call to recover the lead.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-pink-600">3</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#DB2777] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">No-Show Recovery</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  Automatically re-engages customers who miss appointments and helps them rebook.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">4</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Review + Survey Flow</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  After completed appointments, AI sends thank you messages, review requests, and surveys.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">5</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Cold Lead Revival</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  AI reactivates leads who stopped responding using smart timing and personalized messaging.
                </p>
              </div>

              {/* Row 2 */}
              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">6</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Retention & Re-Engagement</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  AI targets inactive customers, offers incentives, and brings them back.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-600">7</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Proposal Creation + Assignment</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  AI creates proposals, assigns reviewers, and tracks review stages automatically.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">8</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Proposal Sending + Acceptance</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  AI sends proposals, tracks views, accepts/declines, and triggers next actions.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">9</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#E64A19] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Abandoned Form Recovery</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  When someone starts but does not submit a form, AI follows up instantly to recover them.
                </p>
              </div>

              <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-600">10</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 relative">Post-Purchase Flow</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  After the sale, AI provides onboarding messages, upsell opportunities, and retention touchpoints.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA in this section */}
          <ScrollReveal className="mt-20">
            <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 max-w-2xl mx-auto text-center overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6B2D9E] via-[#EC4899] to-[#FF5722]" />
              <div className="flex justify-center mb-4">
                <WaitlistCounterDark baseCount={1247} />
              </div>

              {/* Success Message */}
              {journeySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 border-2 rounded-xl p-4 ${journeyAlreadySubscribed ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${journeyAlreadySubscribed ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <CheckCircle2 className={`w-5 h-5 ${journeyAlreadySubscribed ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {journeyAlreadySubscribed ? 'You\'re already subscribed! 📧' : 'You\'re on the list! 🎉'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {journeyAlreadySubscribed 
                          ? <>This email is already on our waitlist: <span className="font-semibold text-[#6B2D9E]">{journeySubmittedEmail}</span></>
                          : <>Confirmation sent to <span className="font-semibold text-[#6B2D9E]">{journeySubmittedEmail}</span></>
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleJourneySubmit}>
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    value={journeyEmail}
                    onChange={(e) => setJourneyEmail(e.target.value)}
                    disabled={journeySubmitting}
                    className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent text-gray-900 text-base disabled:opacity-70"
                  />
                </div>
                <button
                  type="submit"
                  disabled={journeySubmitting}
                  className="h-14 px-8 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {journeySubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Get Early Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {journeyError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{journeyError}</span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Early access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Exclusive webinars
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Founding pricing
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Built-In CRM Section */}
      <section className="py-28 px-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" stroke="%23fff" stroke-width="1"%3E%3Cpath d="M0 0h40v40H0z"/%3E%3C/g%3E%3C/svg%3E")' }} />
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#6B2D9E]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-[#FF5722]/10 to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80">CRM Integration</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Built-in CRM, designed to work with yours
            </h2>
            <p className="text-lg text-white/70 max-w-3xl">
              Start immediately with our built-in CRM, or seamlessly sync with the tools you already use.
            </p>
          </ScrollReveal>

          {/* CRM Sync Visual Animation */}
          <ScrollReveal delay={0.2} className="mb-12">
            <CRMSyncVisualScreen />
          </ScrollReveal>

          {/* Supporting Icon Strip */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-[#6B2D9E] flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Contact Sync</p>
                  <p className="text-xs text-gray-500">Instant updates</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-[#6B2D9E] flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Conversation History</p>
                  <p className="text-xs text-gray-500">Full timeline</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-[#6B2D9E] flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Appointments</p>
                  <p className="text-xs text-gray-500">Auto-booked</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-[#6B2D9E] flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lead Status</p>
                  <p className="text-xs text-gray-500">Real-time scores</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => {
                setEmailSignupVariant('newsletter');
                setShowEmailSignup(true);
              }}
              className="h-14 px-10 bg-gradient-to-r from-[#FF5722] to-[#FF6D3F] hover:from-[#E64A19] hover:to-[#FF5722] text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </section>

      {/* Seamless Integrations Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-100/50 to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <Target className="w-4 h-4 text-[#6B2D9E]" />
              <span className="text-sm font-semibold text-[#6B2D9E]">Integrations</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Connects with your
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#6B2D9E] bg-clip-text text-transparent"> favorite tools</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seamlessly sync with CRMs, calendars, and communication platforms
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <LogoRing />
          </ScrollReveal>

          {/* CTA Button */}
          <ScrollReveal delay={0.3} className="text-center mt-12">
            <button
              onClick={() => setShowEmailSignup(true)}
              className="h-14 px-10 bg-gradient-to-r from-[#FF5722] to-[#FF6D3F] hover:from-[#E64A19] hover:to-[#FF5722] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Get Early Access
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <AnalyticsDashboard onGetEarlyAccess={() => setShowEmailSignup(true)} />

      {/* Security & Compliance Section */}
      <SecurityCompliance />

      {/* Final CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-[#5B2A86] via-[#7B3DAE] to-[#9B4DBA]">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-[#FF5722]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-radial from-[#EC4899]/15 to-transparent rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to stop losing leads?
            </h2>
            <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto">
              Join the waitlist for early access and founding member benefits.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button 
                onClick={() => setShowEmailSignup(true)}
                className="h-14 px-10 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Get Early Access
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link 
                href="/blog"
                className="h-14 px-10 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Read Our Blog
              </Link>
            </div>

            {/* Launch badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Launching Soon</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      {/* Email Signup Modal Overlay */}
      {showEmailSignup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEmailSignup(false)}
        >
          <div 
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEmailSignup(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <EmailSignupBox 
              onSuccess={handleEmailSuccess} 
              variant={emailSignupVariant}
              onShowPriorityModal={handleShowPriorityModal}
            />
          </div>
        </div>
      )}

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onClick={() => setShowEmailSignup(true)} />

      {/* Priority Access Modal */}
      <PriorityAccessModal 
        isOpen={showPriorityModal} 
        onClose={() => setShowPriorityModal(false)} 
        prefilledEmail={modalPrefilledEmail}
      />
    </div>
  );
}
