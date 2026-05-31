'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * Unified form error message component with consistent styling
 */
export function FormError({ message, className = '' }: FormErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-2 mt-2 ${className}`}
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FormErrorBoxProps {
  message?: string;
  className?: string;
}

/**
 * Unified form error box for general form errors (not field-specific)
 */
export function FormErrorBox({ message, className = '' }: FormErrorBoxProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl ${className}`}
        >
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-0.5">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
