'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-purple-400 text-center sm:text-left">
            <span>© {currentYear} Qualiflow AI.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="size-3 fill-orange-500 text-orange-500" /> for businesses
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-orange-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-orange-400 transition-colors"
            >
              Terms
            </a>
            <Link
              href="/support"
              className="text-purple-400 hover:text-orange-400 transition-colors"
            >
              Support
            </Link>
            <a
              href="https://docs.qualiflow.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-purple-400 hover:text-orange-400 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>

        {/* Version info (optional) */}
        <div className="mt-3 sm:mt-4 text-center text-xs text-purple-500">
          Qualiflow AI v1.0.0 | AI-Powered Lead Qualification Platform
        </div>
      </div>
    </footer>
  );
}

