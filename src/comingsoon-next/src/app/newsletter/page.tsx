'use client';

import { useState } from 'react';
import Link from "next/link";
import { motion } from 'framer-motion';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { submitToBrevo } from "@/lib/brevo";
import { ArrowRight, CheckCircle, Mail, Loader2, Sparkles, Zap, HeartHandshake, Gift, AlertCircle } from "lucide-react";
import { validateEmail } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WaitlistCounterDark } from "@/components/WaitlistCounter";
import { PageProvider } from "@/contexts/PageContext";
import { PriorityAccessModal } from "@/components/PriorityAccessModal";

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');
  
  // Priority access modal state
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitToBrevo(email, 'newsletter-page');
      console.log('[Newsletter] submitToBrevo result:', result);
      if (result.success) {
        setSubmittedEmail(email);
        setIsSuccess(true);
        const alreadySubmitted = result.alreadySubmitted === true;
        console.log('[Newsletter] Setting isAlreadySubscribed to:', alreadySubmitted);
        setIsAlreadySubscribed(alreadySubmitted);
        setEmail('');
        
        // Show priority access modal only for new submissions
        if (!alreadySubmitted) {
          setTimeout(() => {
            setShowPriorityModal(true);
          }, 500);
        }
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Early Access',
      description: 'Be among the first to try QualiflowAI before the public launch.',
      color: 'from-purple-500 to-pink-500',
      bg: 'from-purple-100 to-pink-100',
    },
    {
      icon: Gift,
      title: 'Exclusive Pricing',
      description: 'Get special early bird pricing locked in forever.',
      color: 'from-orange-500 to-red-500',
      bg: 'from-orange-100 to-red-100',
    },
    {
      icon: Sparkles,
      title: 'Product Updates',
      description: 'Stay informed about new features and improvements.',
      color: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-100 to-cyan-100',
    },
    {
      icon: HeartHandshake,
      title: 'Priority Support',
      description: 'Get priority access to our support team.',
      color: 'from-emerald-500 to-teal-500',
      bg: 'from-emerald-100 to-teal-100',
    },
  ];

  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <Navigation />
      
      <main className="pt-22 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Success State */}
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
                isAlreadySubscribed 
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100' 
                  : 'bg-gradient-to-br from-green-100 to-emerald-100'
              }`}>
                {isAlreadySubscribed ? (
                  <Mail className="w-12 h-12 text-blue-600" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                )}
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isAlreadySubscribed ? 'text-blue-900' : 'text-gray-900'}`}>
                {isAlreadySubscribed ? "You're already subscribed! 📧" : "You're on the list! 🎉"}
              </h1>
              
              {/* Show submitted email */}
              <div className={`rounded-xl px-6 py-4 mb-6 max-w-md mx-auto ${
                isAlreadySubscribed 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-purple-50 border border-purple-200'
              }`}>
                <p className={`text-sm font-medium mb-1 ${isAlreadySubscribed ? 'text-blue-600' : 'text-purple-600'}`}>
                  {isAlreadySubscribed ? 'Email already on waitlist:' : 'Confirmation sent to:'}
                </p>
                <p className={`text-lg font-bold ${isAlreadySubscribed ? 'text-blue-700' : 'text-[#6B2D9E]'}`}>{submittedEmail}</p>
              </div>
              
              <p className={`text-lg mb-8 max-w-md mx-auto ${isAlreadySubscribed ? 'text-blue-700' : 'text-gray-600'}`}>
                {isAlreadySubscribed 
                  ? "No worries! You're already on our waitlist. We'll notify you when QualiflowAI launches. No need to sign up again."
                  : "Thanks for signing up! We'll keep you updated on our progress and let you know when QualiflowAI launches. Check your inbox for a welcome email."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6B2D9E] hover:bg-[#5B2486] text-white font-semibold rounded-xl transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-[#6B2D9E] text-gray-700 hover:text-[#6B2D9E] font-semibold rounded-xl transition-colors"
                >
                  Read Our Blog
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                  
                  <span className="text-sm font-semibold text-[#6B2D9E]">Join the Waitlist</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Get
                  <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent"> early access</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
                  Be the first to experience the future of AI-powered sales automation. Join our waitlist and get exclusive benefits.
                </p>
                <WaitlistCounterDark baseCount={1247} />
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-12"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 text-base border-2 border-gray-200 focus:border-[#6B2D9E] rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-14 px-8 bg-[#6B2D9E] hover:bg-[#5B2486] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 text-center">
                    🔒 We respect your privacy. No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              </motion.div>

              {/* Benefits */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Priority Access Modal */}
      <PriorityAccessModal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        prefilledEmail={submittedEmail}
      />
      </div>
    </PageProvider>
  );
}
