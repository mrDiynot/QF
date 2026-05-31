'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { validateEmail, validateFullName, validatePhone, validateCompanyName } from '@/lib/validation';
import { FormErrorBox } from '@/components/ui/FormError';

// Server-side API route handles Brevo submission (avoids browser CORS/no-cors issues)
const PRIORITY_ACCESS_API = '/api/priority-access';

interface PriorityAccessModalProps {
  isOpen: boolean;
  /** Called when the modal closes. `submitted` is true only after a successful form submission. */
  onClose: (submitted?: boolean) => void;
  prefilledEmail?: string;
  prefilledName?: string;
  /** When 'web-chat', submissions go to a separate Brevo list for web chat leads */
  source?: 'default' | 'web-chat';
}

export function PriorityAccessModal({ isOpen, onClose, prefilledEmail = '', prefilledName = '', source = 'default' }: PriorityAccessModalProps) {
  const [fullName, setFullName] = useState(prefilledName);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(prefilledEmail);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Update email when prefilledEmail changes
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  // Update name when prefilledName changes
  useEffect(() => {
    if (prefilledName) {
      setFullName(prefilledName);
    }
  }, [prefilledName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const errors: Record<string, string> = {};
    const nameResult = validateFullName(fullName);
    if (!nameResult.isValid) errors.fullName = nameResult.error!;
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) errors.email = emailResult.error!;
    const phoneResult = validatePhone(phone, false);
    if (!phoneResult.isValid) errors.phone = phoneResult.error!;
    const companyResult = validateCompanyName(companyName, true);
    if (!companyResult.isValid) errors.companyName = companyResult.error!;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`[PriorityAccess] Submitting via server API (${source})...`);

      // Submit via server-side API route (handles Brevo submission server-side,
      // avoiding browser CORS/no-cors issues that silently drop fields)
      const response = await fetch(PRIORITY_ACCESS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone?.trim() || '',
          companyName: companyName?.trim() || '',
          source: source || 'default',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Submission failed. Please try again.');
        return;
      }

      console.log('[PriorityAccess] Submission successful');
      setIsSuccess(true);

      // Close modal after 2 seconds — pass true to indicate successful submission
      setTimeout(() => {
        onClose(true);
        // Reset form after closing
        setTimeout(() => {
          setIsSuccess(false);
          setFullName('');
          setPhone('');
          setCompanyName('');
          setEmail('');
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('[PriorityAccess] Submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { if (!isSuccess) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — hidden during success state to prevent double-close */}
            {!isSuccess && (
              <button
                onClick={() => onClose()}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Modal content */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {isSuccess ? (
                // Success State
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank you! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Your priority access request has been submitted successfully.
                  </p>
                </motion.div>
              ) : (
                // Form State
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Priority Access
                    </h2>
                    <p className="text-white/90 text-sm">
                      Complete your details for early access
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-bold text-gray-900 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jon Doe"
                        maxLength={200}
                        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                          fieldErrors.fullName ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-[#6B2D9E]'
                        }`}
                      />
                      {fieldErrors.fullName && <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                          fieldErrors.phone ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-[#6B2D9E]'
                        }`}
                      />
                      {fieldErrors.phone ? (
                        <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US, +44 for UK)</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                          fieldErrors.email ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-[#6B2D9E]'
                        }`}
                      />
                      {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
                    </div>

                    {/* Company Name */}
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-bold text-gray-900 mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Inc."
                        maxLength={200}
                        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                          fieldErrors.companyName ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-[#6B2D9E]'
                        }`}
                      />
                      {fieldErrors.companyName && <p className="text-sm text-red-600 mt-1">{fieldErrors.companyName}</p>}
                    </div>

                    {/* Error Message */}
                    <FormErrorBox message={error} />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#6B2D9E] to-[#8B3DAE] hover:from-[#5B2486] hover:to-[#7B2D9E] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Get Priority Access'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
