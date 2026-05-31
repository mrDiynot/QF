'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Script from 'next/script';

/**
 * Brevo (Sendinblue) newsletter subscription form — styled to match the
 * project's dark-purple / orange glassmorphic AI aesthetic.
 *
 * Posts directly to Brevo's endpoint; loads their JS for honeypot + validation.
 */

const BREVO_ACTION =
  'https://bc74bff7.sibforms.com/serve/MUIFAIKmnWEi9rsjZDLyNGlVPooHiMqTOTKt8UdD3JMy9MGG9JeqvIqk9AInQszWzAXD8glautY6WLEoGAmDcNqqpTcvehybtXb6cBhszu5bap0uZQQjmnYFNdeZLt_bjjZZrRTuo3GcdAAj4tvr5rAAwtcMpslJEsxYwBoDL1nx409sMZHAVcZbHFLRKXZvkozFU_0N7eJ24cjWTA==';

export function BrevoNewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const initialized = useRef(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Set Brevo window globals (required by their main.js)
    const w = window as any;
    w.REQUIRED_CODE_ERROR_MESSAGE = 'Please choose a country code';
    w.LOCALE = 'en';
    w.EMAIL_INVALID_MESSAGE = w.SMS_INVALID_MESSAGE =
      'The information provided is invalid. Please review the field format and try again.';
    w.REQUIRED_ERROR_MESSAGE = 'This field cannot be left blank. ';
    w.GENERIC_INVALID_MESSAGE =
      'The information provided is invalid. Please review the field format and try again.';
    w.translation = {
      common: {
        selectedList: '{quantity} list selected',
        selectedLists: '{quantity} lists selected',
        selectedOption: '{quantity} selected',
        selectedOptions: '{quantity} selected',
      },
    };
    w.AUTOHIDE = Boolean(0);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const email = formData.get('EMAIL') as string;
    if (!email || !email.includes('@')) return;

    setStatus('submitting');

    try {
      // Submit to Brevo via fetch (no page navigation)
      await fetch(BREVO_ACTION, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Brevo doesn't support CORS — fire-and-forget
      });
      setStatus('success');
      form.reset();
      setTimeout(() => setStatus('idle'), 8000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm"
          >
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-300 font-semibold text-sm">
              You&apos;re on the list! We&apos;ll notify you when we launch.
            </p>
          </motion.div>
        ) : status === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 font-semibold text-sm">
              Something went wrong. Please try again.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            id="sib-form"
            method="POST"
            action={BREVO_ACTION}
            data-type="subscription"
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Email input */}
            <div className="relative flex-1 group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60 group-focus-within:text-orange-400 transition-colors" />
              <input
                type="email"
                id="EMAIL"
                name="EMAIL"
                autoComplete="off"
                data-required="true"
                required
                placeholder="Work Email address"
                className="w-full pl-11 pr-4 py-4 bg-white/[0.08] border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-transparent transition-all backdrop-blur-sm text-sm"
              />
              {/* Subtle glow on focus */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(255,87,34,0.15), inset 0 0 20px rgba(124,58,237,0.05)' }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#FF5722] to-[#FF8C42] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-orange-500/30 transition-all shrink-0 disabled:opacity-70 disabled:cursor-not-allowed text-sm group/btn"
            >
              
              Get Early Access
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            {/* Honeypot field (Brevo anti-spam) */}
            <input
              type="text"
              name="email_address_check"
              defaultValue=""
              className="absolute opacity-0 pointer-events-none h-0 w-0"
              tabIndex={-1}
              aria-hidden="true"
            />
            <input type="hidden" name="locale" value="en" />
          </motion.form>
        )}
      </AnimatePresence>

      {/* Load Brevo JS for backend validation support */}
      <Script
        src="https://sibforms.com/forms/end-form/build/main.js"
        strategy="lazyOnload"
      />
    </div>
  );
}

export default BrevoNewsletterForm;
