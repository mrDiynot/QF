'use client';

import { X } from 'lucide-react';

/**
 * Button that closes the current browser tab
 * Used on pages opened in new tabs (Terms, Privacy from registration)
 * Falls back to browser back navigation if window.close() is blocked
 */
export function CloseTabButton() {
  const handleClose = () => {
    // Try to close the tab (works when opened via target="_blank")
    window.close();
    
    // If window.close() didn't work (e.g., not opened by script),
    // navigate back as fallback
    if (!window.closed) {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClose}
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-navy transition-colors px-3 py-2 rounded-lg hover:bg-muted/40"
    >
      <X className="size-4" />
      Close
    </button>
  );
}

