'use client';

import { useState } from "react";
import { Mail, CheckCircle, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { submitToBrevo } from "@/lib/brevo";
import { validateEmail } from "@/lib/validation";

interface EmailSignupBoxProps {
  onSuccess: (email: string) => void;
  variant?: 'early-access' | 'newsletter';
  onShowPriorityModal?: (email: string) => void;
}

export function EmailSignupBox({ variant = 'early-access', onShowPriorityModal }: EmailSignupBoxProps) {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitToBrevo(email, variant === 'newsletter' ? 'newsletter-popup' : 'early-access-popup');
      console.log('[EmailSignupBox] submitToBrevo result:', result);
      if (result.success) {
        setSubmittedEmail(email);
        setIsSuccess(true);
        const alreadySubmitted = result.alreadySubmitted === true;
        console.log('[EmailSignupBox] Setting isAlreadySubscribed to:', alreadySubmitted);
        setIsAlreadySubscribed(alreadySubmitted);
        const submittedEmailValue = email;
        setEmail("");
        
        // Trigger priority access modal after successful submission (only for new signups)
        if (onShowPriorityModal && !alreadySubmitted) {
          setTimeout(() => {
            onShowPriorityModal(submittedEmailValue);
          }, 500);
        }
      } else {
        setError(result.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error('Brevo submission error:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto">
      {/* Success Message - Shows above form */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mb-6 border-2 rounded-xl p-5 ${isAlreadySubscribed ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isAlreadySubscribed ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
              <CheckCircle className={`w-6 h-6 ${isAlreadySubscribed ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isAlreadySubscribed ? 'You\'re already subscribed! 📧' : 'You\'re on the list! 🎉'}
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {isAlreadySubscribed ? (
                  <>Email: <span className="font-semibold text-[#6B2D9E]">{submittedEmail}</span></>
                ) : (
                  <>Confirmation sent to: <span className="font-semibold text-[#6B2D9E]">{submittedEmail}</span></>
                )}
              </p>
              <p className="text-sm text-gray-600">
                {isAlreadySubscribed 
                  ? 'This email is already on our waitlist. We\'ll keep you updated!'
                  : 'Thanks for signing up! Check your inbox for a welcome email.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form - Always visible */}
      <p className="text-purple-600 font-semibold mb-4 text-center">
        ⚡ {variant === 'newsletter' ? 'Stay Updated' : 'Join 1,000+ businesses on the waitlist'}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email"
            disabled={isSubmitting}
            className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 text-lg disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative h-14 px-8 bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg pointer-events-none"></div>
          <span className="relative z-10 drop-shadow-sm flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Get Early Access
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </span>
        </button>
      </form>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-purple-600 text-xl">✓</div>
          <p className="text-gray-700 text-left">Early access to new features</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-purple-600 text-xl">✓</div>
          <p className="text-gray-700 text-left">Exclusive webinars</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-purple-600 text-xl">✓</div>
          <p className="text-gray-700 text-left">Founding member pricing</p>
        </div>
      </div>
    </div>
  );
}
