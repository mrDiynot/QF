'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitToBrevo } from '@/lib/brevo';
import { validateEmail } from '@/lib/validation';

const SOCIAL_ICONS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/qualiflowai/',
    color: '#0A66C2',
    svg: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/qualiflowai?igsh=N2RldGg4bHh0dTli&utm_source=qr',
    color: '#E4405F',
    svg: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/14MeivjxWQf/?mibextid=wwXIfr',
    color: '#1877F2',
    svg: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@qualiflowai',
    color: '#FF0000',
    svg: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/qualiflowai?s=11&t=cFLsckMj0nU-VeWma8dMRw',
    color: '#e5e7eb',
    svg: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function LandingPageFooter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitToBrevo(email, 'footer-section');
      if (result.success) {
        setSubmittedEmail(email);
        setSuccess(true);
        setAlreadySubscribed(result.alreadySubmitted === true);
        setEmail('');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-950 py-16 relative overflow-hidden">
      {/* Q Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.15] pointer-events-none">
        <Image
          src="/assets/qualiflow-logo_no_text.png"
          alt=""
          width={500}
          height={500}
          className="w-[400px] md:w-[500px] h-auto"
        />
      </div>

      <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24">


        {/* Main link grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              The AI-powered platform that automates your entire customer journey from lead capture to loyal customer.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3 flex-wrap">
              {SOCIAL_ICONS.map(({ label, href, svg, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center transition-all hover:scale-105 hover:border-opacity-60"
                  style={{ color }}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/platform/how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">How It Works</Link></li>
              <li><Link href="/platform/journey-automation" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Journey Automation</Link></li>
              <li><Link href="/platform/ai-engagement" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">AI Engagement</Link></li>
              <li><Link href="/platform/lead-capture" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Lead Capture</Link></li>
              <li><Link href="/platform/integrations" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Integrations</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Get Started</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Privacy</Link></li>
              <li><Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Accessibility</Link></li>
              <li><Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Qualiflow AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingPageFooter;
