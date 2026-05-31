'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Settings, Check } from 'lucide-react';
import { usePrivacyConsent } from '@/contexts/PrivacyConsentContext';
import { PrivacyPreferencesModal } from './PrivacyPreferencesModal';

export function PrivacyConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences, showPreferencesModal, closePreferences } = usePrivacyConsent();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAcceptAll = () => {
    acceptAll();
    setToastMessage('Preferences saved');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRejectAll = () => {
    rejectAll();
    setToastMessage('Preferences saved. Some features may be limited.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-700">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
              <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">We value your privacy</h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        We use cookies and similar technologies to improve your experience, analyze traffic, and enable our AI chat assistant.
                        By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can customize your preferences or learn more in our{' '}
                        <Link href="/privacy" className="text-[#7c3aed] hover:underline font-medium">Privacy Policy</Link>{' '}
                        and{' '}
                        <Link href="/terms" className="text-[#7c3aed] hover:underline font-medium">Terms of Service</Link>.
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                    <button
                      onClick={handleRejectAll}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors order-3 sm:order-1"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={openPreferences}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2 order-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg order-1 sm:order-3"
                      style={{ background: 'linear-gradient(135deg, #FF5722, #FF6B35)' }}
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <PrivacyPreferencesModal isOpen={showPreferencesModal} onClose={closePreferences} />
    </>
  );
}
