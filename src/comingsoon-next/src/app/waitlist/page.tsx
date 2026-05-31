'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PriorityAccessModal } from "@/components/PriorityAccessModal";
import { submitToBrevo } from "@/lib/brevo";
import { ArrowRight, CheckCircle2, Mail, Loader2, Sparkles, Zap, Gift, HeartHandshake, AlertCircle } from "lucide-react";
import { validateEmail } from "@/lib/validation";
import { WaitlistCounterDark } from "@/components/WaitlistCounter";
import { PageProvider } from "@/contexts/PageContext";


export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');
  
  // Priority access modal state
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [modalPrefilledEmail, setModalPrefilledEmail] = useState('');

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
      const result = await submitToBrevo(email, 'waitlist-page');
      console.log('[Waitlist] submitToBrevo result:', result);
      if (result.success) {
        setSubmittedEmail(email);
        setIsSuccess(true);
        const alreadySubmitted = result.alreadySubmitted === true;
        console.log('[Waitlist] Setting isAlreadySubscribed to:', alreadySubmitted);
        setIsAlreadySubscribed(alreadySubmitted);
        setModalPrefilledEmail(email);
        setEmail('');
        
        // Show priority access modal after successful submission (only for new signups)
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

            {/* Inline Email Signup - refined glass card */}
            <div className="mb-8">
              {/* Success Message - Shows above form */}
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-2xl p-5 max-w-lg mx-auto shadow-2xl mb-4 ${isAlreadySubscribed ? 'bg-blue-50 border border-blue-200' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isAlreadySubscribed ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <CheckCircle2 className={`w-5 h-5 ${isAlreadySubscribed ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        {isAlreadySubscribed ? 'You\'re already subscribed! 📧' : 'You\'re on the list! 🎉'}
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        {isAlreadySubscribed ? (
                          <>Email: <span className="font-semibold text-[#6B2D9E]">{submittedEmail}</span></>
                        ) : (
                          <>Confirmation sent to: <span className="font-semibold text-[#6B2D9E]">{submittedEmail}</span></>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isAlreadySubscribed 
                          ? 'This email is already on our waitlist. We\'ll keep you updated!'
                          : 'Check your inbox for a welcome email.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Form - Always visible */}
              <div className="bg-purple-50 rounded-2xl p-2 max-w-lg mx-auto border border-purple-100">
                <form 
                  className="flex flex-col sm:flex-row gap-2"
                  onSubmit={handleSubmit}
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your work email"
                      disabled={isSubmitting}
                      className="w-100 h-14 pl-12 pr-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2d9e] text-gray-900 text-base placeholder:text-gray-400 disabled:opacity-100 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 bg-gradient-to-r from-[#6b2d9e] to-[#6b2d9e] hover:from-[#6b2d9e] hover:to-[#6b2d9e] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Join waitlist
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl max-w-lg mx-auto">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

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
          </div>
        </main>

        <Footer />

        {/* Priority Access Modal */}
        <PriorityAccessModal 
          isOpen={showPriorityModal} 
          onClose={() => setShowPriorityModal(false)} 
          prefilledEmail={modalPrefilledEmail}
        />
      </div>
    </PageProvider>
  );
}

