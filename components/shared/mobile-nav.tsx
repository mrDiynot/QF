'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientButton } from './gradient-button';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-20 z-50 border-b border-border bg-white shadow-lg">
          <nav className="container mx-auto flex flex-col gap-4 px-6 py-6">
            <Link
              href="#features"
              className="body-text text-gray-text hover:text-brand-purple"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#modules"
              className="body-text text-gray-text hover:text-brand-purple"
              onClick={() => setIsOpen(false)}
            >
              Modules
            </Link>
            <Link
              href="#pricing"
              className="body-text text-gray-text hover:text-brand-purple"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="body-text text-brand-purple hover:text-brand-purple/80"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <GradientButton asChild className="w-full">
              <Link href="/register" onClick={() => setIsOpen(false)}>
                Start Free Trial
              </Link>
            </GradientButton>
          </nav>
        </div>
      )}
    </div>
  );
}