'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

// ─── Inline brand SVG components (no react-icons needed) ────────────────────

function FacebookLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#1877F2"/>
      <path d="M22 20h3l.5-3H22v-1.5c0-.83.4-1.5 1.5-1.5H26V11h-2.5C20.47 11 18 13.07 18 16.5V17h-3v3h3v8h4v-8z" fill="white"/>
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="igGrad" x1="0" y1="40" x2="40" y2="0">
          <stop offset="0%" stopColor="#FED373"/>
          <stop offset="25%" stopColor="#F15245"/>
          <stop offset="50%" stopColor="#D92E7F"/>
          <stop offset="75%" stopColor="#9B36B7"/>
          <stop offset="100%" stopColor="#515ECF"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="8" fill="url(#igGrad)"/>
      <rect x="11" y="11" width="18" height="18" rx="5" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="20" cy="20" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="26.5" cy="13.5" r="1.5" fill="white"/>
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#25D366"/>
      <path d="M20 8C13.37 8 8 13.37 8 20c0 2.14.56 4.14 1.53 5.87L8 32l6.31-1.5A11.93 11.93 0 0020 32c6.63 0 12-5.37 12-12S26.63 8 20 8zm5.93 16.23c-.25.67-1.44 1.28-1.98 1.35-.53.07-1.04.29-3.52-.73-2.94-1.2-4.82-4.18-4.97-4.37-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.68.51.25.58.85 2.06.92 2.21.07.15.12.33.02.53-.09.2-.14.33-.28.51-.14.18-.3.4-.43.54-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.97 1.09.98 2.01 1.28 2.3 1.42.29.14.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.15.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.7-.18 1.37z" fill="white"/>
    </svg>
  );
}

function GmailLogo() {
  return <Image src="/assets/gmail-logo.svg" alt="Gmail" width={40} height={40} className="w-full h-full object-contain" unoptimized />;
}

function OutlookLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect width="48" height="48" rx="8" fill="#0078D4"/>
      <rect x="8" y="12" width="22" height="24" rx="2" fill="#FFF"/>
      <rect x="8" y="12" width="22" height="6" rx="2" fill="#0078D4"/>
      <text x="19" y="33" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#0078D4" textAnchor="middle">31</text>
      <rect x="28" y="18" width="12" height="18" rx="2" fill="#1A78BD"/>
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#FF7A59"/>
      <circle cx="26" cy="13" r="4" fill="white"/>
      <line x1="22" y1="13" x2="17" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="14" cy="20" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
      <line x1="22" y1="20" x2="26" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="25" x2="14" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function SalesforceLogo() {
  return <Image src="/assets/salesforce-logo.svg" alt="Salesforce" width={40} height={40} className="w-full h-full object-contain" unoptimized />;
}

function ZohoLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#E42527"/>
      <text x="20" y="25" fontFamily="Arial" fontSize="12" fontWeight="900" fill="white" textAnchor="middle">ZOHO</text>
    </svg>
  );
}

function PipedriveLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#1A3F4C"/>
      <circle cx="20" cy="14" r="5" stroke="#27B85F" strokeWidth="3" fill="none"/>
      <line x1="20" y1="19" x2="20" y2="30" stroke="#27B85F" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function IntercomLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#1F8DED"/>
      <rect x="9" y="9" width="22" height="18" rx="4" fill="white" opacity="0.9"/>
      <rect x="13" y="13" width="14" height="2" rx="1" fill="#1F8DED"/>
      <rect x="13" y="17" width="10" height="2" rx="1" fill="#1F8DED"/>
      <path d="M9 27l4-4h15a4 4 0 004-4V13a4 4 0 00-4-4H12a4 4 0 00-4 4v14z" fill="white" opacity="0.2"/>
    </svg>
  );
}

function MondayLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#F62B54"/>
      <circle cx="12" cy="20" r="4" fill="#FF7575"/>
      <circle cx="20" cy="20" r="4" fill="#FFCB00"/>
      <circle cx="28" cy="20" r="4" fill="#00CA72"/>
    </svg>
  );
}

function TwilioLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#F22F46"/>
      <circle cx="20" cy="20" r="9" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="15.5" r="2.5" fill="white"/>
      <circle cx="25" cy="15.5" r="2.5" fill="white"/>
      <circle cx="15" cy="24.5" r="2.5" fill="white"/>
      <circle cx="25" cy="24.5" r="2.5" fill="white"/>
    </svg>
  );
}

function SendGridLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#1A82E2"/>
      <rect x="8" y="15" width="10" height="10" rx="1" fill="white" opacity="0.9"/>
      <rect x="22" y="8" width="10" height="10" rx="1" fill="white" opacity="0.5"/>
      <rect x="22" y="22" width="10" height="10" rx="1" fill="white"/>
      <rect x="8" y="8" width="10" height="10" rx="1" fill="white" opacity="0.3"/>
    </svg>
  );
}

function GoogleCalendarLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect width="48" height="48" rx="8" fill="white" stroke="#E0E0E0"/>
      <rect x="0" y="10" width="48" height="8" rx="2" fill="#1A73E8"/>
      <text x="24" y="34" fontFamily="Arial" fontSize="20" fontWeight="700" fill="#1A73E8" textAnchor="middle" dominantBaseline="middle">31</text>
    </svg>
  );
}

function OutlookCalendarLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect width="48" height="48" rx="10" fill="#0078D4"/>
      <rect x="10" y="14" width="28" height="26" rx="2" fill="#FFF"/>
      <rect x="10" y="14" width="28" height="6" rx="2" fill="#0078D4"/>
      <text x="24" y="33" fontFamily="Arial" fontSize="13" fontWeight="700" fill="#0078D4" textAnchor="middle" dominantBaseline="middle">📅</text>
    </svg>
  );
}

function CdkLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect width="40" height="40" rx="8" fill="#232F3E"/>
      <path d="M20 8l10 6v12l-10 6-10-6V14l10-6z" fill="#FF9900" opacity="0.9"/>
      <path d="M20 8v24l10-6V14l-10-6z" fill="#FF9900"/>
      <path d="M20 8v24l-10-6V14l10-6z" fill="#FFCC00" opacity="0.7"/>
      <text x="20" y="23" fontFamily="Arial" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">AWS</text>
    </svg>
  );
}

function ExcelLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect width="48" height="48" rx="8" fill="#217346"/>
      <path d="M16 12 L24 24 L16 36 L20 36 L24 28 L28 36 L32 36 L24 24 L32 12 L28 12 L24 20 L20 12 Z" fill="#FFF"/>
    </svg>
  );
}

// ─── Logo Ring ───────────────────────────────────────────────────────────────

const LOGOS = [
  { name: 'Facebook', component: FacebookLogo },
  { name: 'Instagram', component: InstagramLogo },
  { name: 'WhatsApp', component: WhatsAppLogo },
  { name: 'Gmail', component: GmailLogo },
  { name: 'Outlook', component: OutlookLogo },
  { name: 'HubSpot', component: HubSpotLogo },
  { name: 'Salesforce', component: SalesforceLogo },
  { name: 'Zoho CRM', component: ZohoLogo },
  { name: 'Pipedrive', component: PipedriveLogo },
  { name: 'Intercom', component: IntercomLogo },
  { name: 'Monday.com', component: MondayLogo },
  { name: 'Twilio', component: TwilioLogo },
  { name: 'SendGrid', component: SendGridLogo },
  { name: 'Google Calendar', component: GoogleCalendarLogo },
  //{ name: 'Outlook Calendar', component: OutlookCalendarLogo },
  //{ name: 'AWS CDK', component: CdkLogo },
  { name: 'Excel', component: ExcelLogo },
];

function LogoRing() {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const radius = 250;
  const mobileRadius = 120;
  const total = LOGOS.length;
  const angleStep = (2 * Math.PI) / total;

  const positions = (r: number) =>
    LOGOS.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
    });

  const desktopPos = positions(radius);
  const mobilePos = positions(mobileRadius);

  const spinStyle = (dur: string, reverse = false): React.CSSProperties => ({
    animation: `spin${reverse ? 'Reverse' : ''} ${dur} linear infinite`,
    animationPlayState: isPaused ? 'paused' : 'running',
  });

  const CenterLogo = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-r from-[#FF5722]/30 via-[#6B2D9E]/40 to-[#EC4899]/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -inset-4 bg-gradient-to-r from-[#6B2D9E]/25 via-[#EC4899]/25 to-[#FF5722]/25 rounded-full blur-xl" />
        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-4 ring-4 ring-purple-300/60">
          <Image src="/assets/qualiflow-logo_no_text.png" alt="QualiFlow AI" width={160} height={160} className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>
    </div>
  );

  if (!isMounted) {
    return (
      <div className="relative w-full flex items-center justify-center py-12">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-4 ring-4 ring-purple-300/60">
          <Image src="/assets/qualiflow-logo_no_text.png" alt="QualiFlow AI" width={160} height={160} className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinReverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      `}</style>
      <div className="w-full flex items-center justify-center py-12 overflow-hidden">
        {/* Desktop */}
        <div
          className="hidden md:block relative"
          style={{ width: `${radius * 2 + 20}px`, height: `${radius * 2 + 20}px` }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border-2 border-purple-200/40" style={{ width: `${radius * 2 + 40}px`, height: `${radius * 2 + 40}px` }} />
          </div>

          {/* Rotating ring */}
          <div className="absolute inset-0" style={spinStyle('60s')}>
            {LOGOS.map((logo, i) => {
              const pos = desktopPos[i];
              const Logo = logo.component;
              return (
                <div
                  key={logo.name}
                  className="absolute"
                  style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
                >
                  <div
                    style={spinStyle('60s', true)}
                    onMouseEnter={() => { setIsPaused(true); setHoveredIndex(i); }}
                    onMouseLeave={() => { setIsPaused(false); setHoveredIndex(null); }}
                    className="relative group"
                  >
                    <div className={`w-14 h-14 bg-white backdrop-blur-xl rounded-xl flex items-center justify-center p-2.5 shadow-lg border border-gray-200/80 transition-all ${hoveredIndex === i ? 'scale-110 border-purple-300 shadow-purple-200' : 'hover:scale-110 hover:border-purple-300'}`}>
                      <Logo />
                    </div>
                    {hoveredIndex === i && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50">
                        {logo.name}
                        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <CenterLogo />
        </div>

        {/* Mobile */}
        <div className="md:hidden relative" style={{ width: `${mobileRadius * 2 + 80}px`, height: `${mobileRadius * 2 + 80}px` }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border-2 border-purple-200/40" style={{ width: `${mobileRadius * 2 + 20}px`, height: `${mobileRadius * 2 + 20}px` }} />
          </div>
          <div className="absolute inset-0" style={spinStyle('40s')}>
            {LOGOS.map((logo, i) => {
              const pos = mobilePos[i];
              const Logo = logo.component;
              return (
                <div key={logo.name} className="absolute" style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}>
                  <div style={spinStyle('40s', true)}>
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-md border border-gray-200/80">
                      <Logo />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-3 ring-4 ring-purple-300/60">
              <Image src="/assets/qualiflow-logo_no_text.png" alt="QualiFlow AI" width={80} height={80} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Integrations Section ────────────────────────────────────────────────────

export function IntegrationsSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-100/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Target className="w-4 h-4 text-[#6B2D9E]" />
            <span className="text-sm font-semibold text-[#6B2D9E]">Integrations</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Connects with your
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#6B2D9E] bg-clip-text text-transparent"> favorite tools</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seamlessly sync with CRMs, calendars, and communication platforms
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <LogoRing />
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-14 px-10 bg-gradient-to-br from-[#1e0a3c] via-[#2d1060] to-[#4c1d95] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/40 ring-1 ring-white/10 hover:shadow-purple-800/50 hover:-translate-y-0.5"
          >
            Start Free Trial
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default IntegrationsSection;
