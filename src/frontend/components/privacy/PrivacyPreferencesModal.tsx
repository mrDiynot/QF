'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, BarChart3, Megaphone, MessageSquare, Lock, Check } from 'lucide-react';
import { usePrivacyConsent, ConsentCategories } from '@/contexts/PrivacyConsentContext';

interface PrivacyPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryToggleProps {
  id: keyof ConsentCategories;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  locked?: boolean;
  onChange: (enabled: boolean) => void;
}

function CategoryToggle({ id, label, description, icon, enabled, locked, onChange }: CategoryToggleProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900" id={`${id}-label`}>{label}</h4>
          {locked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded-full">
              <Lock className="w-3 h-3" />
              Required
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 ${
          enabled ? 'bg-[#7c3aed]' : 'bg-gray-200'
        } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
        role="switch"
        aria-checked={enabled}
        aria-labelledby={`${id}-label`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function PrivacyPreferencesModal({ isOpen, onClose }: PrivacyPreferencesModalProps) {
  const { consent, saveCustom, acceptAll } = usePrivacyConsent();
  const [showToast, setShowToast] = useState(false);

  const [categories, setCategories] = useState<ConsentCategories>({
    essential: true,
    analytics: false,
    marketing: false,
    aiChat: false,
  });

  // Sync with existing consent each time modal opens
  useEffect(() => {
    if (consent) {
      setCategories(consent.categories);
    } else {
      setCategories({ essential: true, analytics: false, marketing: false, aiChat: false });
    }
  }, [consent, isOpen]);

  const handleCategoryChange = (category: keyof ConsentCategories, enabled: boolean) => {
    if (category === 'essential') return;
    setCategories(prev => ({ ...prev, [category]: enabled }));
  };

  const handleSavePreferences = () => {
    saveCustom(categories);
    setShowToast(true);
    setTimeout(() => { setShowToast(false); onClose(); }, 1500);
  };

  const handleAcceptAll = () => {
    acceptAll();
    setShowToast(true);
    setTimeout(() => { setShowToast(false); onClose(); }, 1500);
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full z-[61] flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Manage your cookie preferences below. Essential cookies are required for the site to function properly.
                </p>

                <CategoryToggle
                  id="essential"
                  label="Essential Cookies"
                  description="Required for site functionality and security. These cannot be disabled."
                  icon={<Lock className="w-5 h-5 text-gray-600" />}
                  enabled={categories.essential}
                  locked={true}
                  onChange={() => {}}
                />
                <CategoryToggle
                  id="analytics"
                  label="Analytics Cookies"
                  description="Help us understand how visitors use our site to improve the experience."
                  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                  enabled={categories.analytics}
                  onChange={(enabled) => handleCategoryChange('analytics', enabled)}
                />
                <CategoryToggle
                  id="marketing"
                  label="Marketing Cookies"
                  description="Used to deliver relevant advertisements and track ad campaign performance."
                  icon={<Megaphone className="w-5 h-5 text-orange-500" />}
                  enabled={categories.marketing}
                  onChange={(enabled) => handleCategoryChange('marketing', enabled)}
                />
                <CategoryToggle
                  id="aiChat"
                  label="AI Chat Assistant"
                  description="Enables our AI assistant. Your conversations are processed to provide helpful responses."
                  icon={<MessageSquare className="w-5 h-5 text-[#7c3aed]" />}
                  enabled={categories.aiChat}
                  onChange={(enabled) => handleCategoryChange('aiChat', enabled)}
                />
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF5722, #FF6B35)' }}
                >
                  Accept All
                </button>
              </div>

              {/* Toast */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Preferences saved</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
