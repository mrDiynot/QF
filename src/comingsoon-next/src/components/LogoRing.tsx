"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SiHubspot, SiIntercom, SiTwilio, SiSendgrid, SiZoho } from "react-icons/si";

export function LogoRing() {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard
    setIsMounted(true);
  }, []);

  const logos = [
    { name: "Facebook", component: FacebookLogo },
    { name: "Instagram", component: InstagramLogo },
    { name: "WhatsApp", component: WhatsAppLogo },
    { name: "Gmail", component: GmailLogo },
    { name: "Outlook", component: OutlookLogo },
    { name: "HubSpot", component: HubSpotLogo },
    { name: "Salesforce", component: SalesforceLogo },
    { name: "Zoho CRM", component: ZohoLogo },
    { name: "Pipedrive", component: PipedriveLogo },
    { name: "Intercom", component: IntercomLogo },
    { name: "Monday.com", component: MondayLogo },
    { name: "Twilio", component: TwilioLogo },
    { name: "SendGrid", component: SendGridLogo },
    { name: "Google Calendar", component: GoogleCalendarLogo },
    { name: "Outlook Calendar", component: OutlookCalendarLogo },
    { name: "AWS CDK", component: CdkLogo },
    { name: "Excel", component: ExcelLogo },
  ];

  const radius = 250; // Smaller radius
  const mobileRadius = 120;
  
  // Calculate evenly distributed positions for all 17 logos around a circle
  const totalLogos = logos.length;
  const angleStep = (2 * Math.PI) / totalLogos;
  
  const desktopPositions = logos.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });

  const mobilePositions = logos.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    return {
      x: Math.cos(angle) * mobileRadius,
      y: Math.sin(angle) * mobileRadius
    };
  });

  return (
    <div className="relative w-full flex items-center justify-center py-12">
      {!isMounted ? (
        // Static placeholder during SSR to prevent hydration mismatch
        <div className="relative w-full flex items-center justify-center py-12">
          <div className="w-44 h-44 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-4 ring-4 ring-purple-300/60">
            <Image
              src="/assets/qualiflow-logo_no_text.png"
              alt="QualiFlow"
              width={160}
              height={160}
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Desktop: Rotating Ring */}
          <div className="hidden md:block relative" style={{ width: `${radius * 2 + 20}px`, height: `${radius * 2 + 20}px` }}>
        {/* Subtle Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full border-2 border-purple-200/40"
            style={{ width: `${radius * 2 + 40}px`, height: `${radius * 2 + 40}px` }}
          ></div>
        </div>

        {/* Rotating Container */}
        <div
          className={`absolute inset-0 ${isPaused ? '' : 'animate-spin-slow'}`}
          style={{ animationDuration: '60s' }}
        >
          {logos.map((logo, index) => {
            const position = desktopPositions[index];
            const LogoComponent = logo.component;

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                }}
              >
                <div
                  className={`transition-all duration-300 ${
                    hoveredIndex === index ? 'scale-110' : 'scale-100'
                  }`}
                  onMouseEnter={() => {
                    setIsPaused(true);
                    setHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    setIsPaused(false);
                    setHoveredIndex(null);
                  }}
                >
                  {/* Counter-rotate each logo so they stay upright */}
                  <div 
                    className={`${isPaused ? '' : 'animate-spin-reverse'}`}
                    style={{ 
                      animationDuration: '60s',
                      transform: 'rotate(0deg)' 
                    }}
                  >
                    <div className="w-[56px] h-[56px] bg-white backdrop-blur-xl rounded-xl flex items-center justify-center p-2.5 shadow-lg hover:shadow-xl transition-all border border-gray-200/80 hover:scale-110 hover:border-purple-300">
                      <LogoComponent />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Image - QualiFlow Logo with enhanced animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div 
              className="absolute -inset-8 rounded-full border-2 border-dashed border-purple-300/30 animate-spin-slow"
              style={{ animationDuration: '30s' }}
            />
            {/* Pulsing glow effect */}
            <div className="absolute -inset-6 bg-gradient-to-r from-[#FF5722]/30 via-[#6B2D9E]/40 to-[#EC4899]/30 rounded-full blur-2xl animate-pulse" />
            {/* Secondary glow layer */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6B2D9E]/25 via-[#EC4899]/25 to-[#FF5722]/25 rounded-full blur-xl" />
            {/* Circle Frame with Logo - Larger size with enhanced glow */}
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-4 ring-4 ring-purple-300/60">
              <Image
                src="/assets/qualiflow-logo_no_text.png"
                alt="QualiFlow"
                width={160}
                height={160}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            {/* Orbiting particles */}
            <div 
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF8A50] shadow-lg animate-spin-slow"
              style={{ 
                top: '50%', 
                left: '50%', 
                marginTop: '-90px',
                marginLeft: '-6px',
                transformOrigin: '6px 90px',
                animationDuration: '8s'
              }}
            />
            <div 
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#EC4899] to-[#DB2777] shadow-lg animate-spin-slow"
              style={{ 
                top: '50%', 
                left: '50%', 
                marginTop: '-85px',
                marginLeft: '-4px',
                transformOrigin: '4px 85px',
                animationDuration: '12s',
                animationDirection: 'reverse'
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Centered Ring */}
      <div className="md:hidden w-full flex justify-center overflow-hidden">
        <div className="relative py-8" style={{ width: `${mobileRadius * 2 + 80}px`, height: `${mobileRadius * 2 + 80}px` }}>
          {/* Subtle Ring Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="rounded-full border-2 border-purple-200/40"
              style={{ width: `${mobileRadius * 2 + 20}px`, height: `${mobileRadius * 2 + 20}px` }}
            ></div>
          </div>

          {/* Rotating Container */}
          <div
            className="absolute inset-0 animate-spin-slow z-20"
            style={{ animationDuration: '60s' }}
          >
            {logos.map((logo, index) => {
              const position = mobilePositions[index];
              const LogoComponent = logo.component;

              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  }}
                >
                  {/* Counter-rotate each logo so they stay upright */}
                  <div 
                    className="animate-spin-reverse"
                    style={{ 
                      animationDuration: '60s',
                      transform: 'rotate(0deg)' 
                    }}
                  >
                    <div className="w-8 h-8 bg-white backdrop-blur-xl rounded-lg flex items-center justify-center p-1 shadow-md border border-gray-200">
                      <LogoComponent />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Image - QualiFlow Logo with enhanced animation (Mobile) */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative">
              {/* Pulsing glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FF5722]/30 via-[#6B2D9E]/40 to-[#EC4899]/30 rounded-full blur-xl animate-pulse" />
              {/* Secondary glow layer */}
              <div className="absolute -inset-3 bg-gradient-to-r from-[#6B2D9E]/25 via-[#EC4899]/25 to-[#FF5722]/25 rounded-full blur-lg" />
              {/* Circle Frame with Logo - Larger size */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center p-2 ring-4 ring-purple-200/50">
                <Image
                  src="/assets/qualiflow-logo_no_text.png"
                  alt="QualiFlow"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              {/* Orbiting particle */}
              <div 
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF8A50] shadow-lg animate-spin-slow"
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  marginTop: '-70px',
                  marginLeft: '-4px',
                  transformOrigin: '4px 70px',
                  animationDuration: '8s'
                }}
              />
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// OFFICIAL BRAND LOGOS
function FacebookLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path d="M48 24C48 10.7452 37.2548 0 24 0S0 10.7452 0 24c0 11.9789 8.77641 21.908 20.25 23.7084v-16.7706H14.1562V24h6.0938v-5.2875c0-6.0155 3.5819-9.3375 9.0656-9.3375 2.625 0 5.3719.4688 5.3719.4688v5.9062h-3.0281c-2.9812 0-3.9094 1.8506-3.9094 3.75V24h6.6562l-1.0641 6.9375h-5.5921v16.7709C39.2236 45.9083 48 35.9789 48 24z" fill="#1877F2"/>
      <path d="M33.3422 30.9375L34.4062 24h-6.6562v-4.4906c0-1.8994.9281-3.75 3.9094-3.75h3.0281V9.8812s-2.7469-.4687-5.3719-.4687c-5.4837 0-9.0656 3.3219-9.0656 9.3375V24h-6.0938v6.9375h6.0938v16.7709a24.1785 24.1785 0 007.5 0V30.9375h5.5921z" fill="white"/>
    </svg>
  );
}

function InstagramLogo() {
  // Use unique ID to avoid conflicts between desktop and mobile instances
  // eslint-disable-next-line react-hooks/purity -- unique ID needed to avoid SVG gradient conflicts
  const gradientId = `instagram-gradient-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FED576"/>
          <stop offset="0.26" stopColor="#F47133"/>
          <stop offset="0.61" stopColor="#BC3081"/>
          <stop offset="1" stopColor="#4C63D2"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`}/>
      <rect x="11" y="11" width="26" height="26" rx="6" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="24" r="6.5" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="32" cy="16" r="2" fill="white"/>
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path fill="#25D366" d="M24 0C10.7452 0 0 10.7452 0 24c0 4.2486 1.1144 8.2341 3.0638 11.6869L0 48l12.6456-3.0188C15.9919 46.8263 19.8638 48 24 48c13.2548 0 24-10.7452 24-24S37.2548 0 24 0z"/>
      <path fill="#FFF" d="M35.6794 12.1781c-3.0994-3.1031-7.2206-4.8113-11.5856-4.8113-9.0338 0-16.3875 7.3481-16.3913 16.3763-.0038 2.8875.7537 5.7056 2.1881 8.1975L7.5 40.5l8.8106-2.3119c2.3813 1.2975 5.0569 1.9819 7.7831 1.9838h.0075c9.0262 0 16.3856-7.3481 16.3894-16.3763.0019-4.3744-1.6987-8.4919-4.7981-11.5931zM24.0938 36.795h-.0056c-2.4431-.0019-4.8375-.6563-6.9206-1.8938l-.4969-.2944-5.1469 1.35 1.3725-5.0156-.3225-.5156c-1.3481-2.1431-2.0606-4.6219-2.0588-7.1719.0038-7.425 6.0469-13.4625 13.4831-13.4625 3.6019.0019 6.9863 1.4063 9.5344 3.9581 2.5481 2.5519 3.9487 5.9419 3.9469 9.5438-.0038 7.4269-6.0469 13.4663-13.4725 13.4663zm7.3913-10.0894c-.405-.2025-2.3981-1.1831-2.7694-1.32-.3713-.1369-.6413-.2025-0.9113.2025-.27.405-1.0462 1.32-1.2825 1.59-.2363.27-.4725.3038-.8775.1013-.405-.2025-1.7081-.6319-3.255-2.0081-1.2038-1.0725-2.0156-2.3988-2.2519-2.8038-.2363-.405-.0263-.6225.1763-.825.1819-.1781.405-.4725.6075-.7087.2025-.2363.27-.405.405-.675.135-.27.0675-.5063-.0338-.7088-.1012-.2025-.9112-2.1975-1.2487-3.0075-.3281-.7875-.6619-.6806-.9113-.6937-.2363-.0113-.5062-.0131-.7762-.0131s-.7088.1013-1.08.5063c-.3713.405-1.4175 1.3856-1.4175 3.3806s1.4513 3.9244 1.6538 4.1944c.2025.27 2.8875 4.4081 6.9938 6.1819.9769.4219 1.7381.6731 2.3325.8606.9806.3113 1.8731.2669 2.5781.1619.7869-.1181 2.3981-.9806 2.7356-1.9275.3375-.9469.3375-1.7569.2363-1.9275-.1013-.1706-.3713-.27-.7763-.4725z"/>
    </svg>
  );
}

function GmailLogo() {
  return (
    <Image
      src="/assets/gmail-logo.svg"
      alt="Gmail"
      width={40}
      height={40}
      className="w-full h-full object-contain"
    />
  );
}

function OutlookLogo() {
  return (
    <Image
      src="/assets/outlook-logo.jpg"
      alt="Outlook"
      width={40}
      height={40}
      className="w-full h-full object-contain"
    />
  );
}

function HubSpotLogo() {
  return <SiHubspot style={{ width: '100%', height: '100%', color: '#FF7A59' }} />;
}

function SalesforceLogo() {
  return (
    <Image
      src="/assets/salesforce-logo.svg"
      alt="Salesforce"
      width={40}
      height={40}
      className="w-full h-full object-contain"
    />
  );
}

function ZohoLogo() {
  return <SiZoho style={{ width: '100%', height: '100%', color: '#E42527' }} />;
}

function PipedriveLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <circle cx="24" cy="24" r="22" fill="#20C05C"/>
      <path d="M18 14h12c3.31 0 6 2.69 6 6s-2.69 6-6 6h-8v8h-4V14zm4 4v8h8c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-8z" fill="#FFF"/>
    </svg>
  );
}

function IntercomLogo() {
  return <SiIntercom style={{ width: '100%', height: '100%', color: '#338FFF' }} />;
}

function MondayLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="8" y="12" width="12" height="24" rx="6" fill="#FF3D57" transform="rotate(30 14 24)"/>
      <rect x="22" y="12" width="12" height="24" rx="6" fill="#FFCB00" transform="rotate(30 28 24)"/>
      <circle cx="39" cy="30" r="5" fill="#00CA72"/>
    </svg>
  );
}

function TwilioLogo() {
  return <SiTwilio style={{ width: '100%', height: '100%', color: '#F22F46' }} />;
}

function SendGridLogo() {
  return <SiSendgrid style={{ width: '100%', height: '100%', color: '#1A82E2' }} />;
}

function GoogleCalendarLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* White rounded square background */}
      <rect width="48" height="48" rx="10" fill="#FFF"/>
      {/* Blue header bar */}
      <path d="M0 10C0 4.477 4.477 0 10 0h28c5.523 0 10 4.477 10 10v2H0v-2z" fill="#1A73E8"/>
      {/* Date number "31" - large and centered */}
      <text x="24" y="34" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#1A73E8" textAnchor="middle" dominantBaseline="middle">31</text>
      {/* Subtle grid lines */}
      <line x1="12" y1="16" x2="36" y2="16" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="12" y1="24" x2="36" y2="24" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="12" y1="32" x2="36" y2="32" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="12" y1="40" x2="36" y2="40" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="18" y1="16" x2="18" y2="44" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="24" y1="16" x2="24" y2="44" stroke="#E8EAED" strokeWidth="0.5"/>
      <line x1="30" y1="16" x2="30" y2="44" stroke="#E8EAED" strokeWidth="0.5"/>
    </svg>
  );
}

function OutlookCalendarLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Blue rounded square background */}
      <rect width="48" height="48" rx="10" fill="#0078D4"/>
      {/* White calendar page */}
      <rect x="10" y="14" width="28" height="26" rx="2" fill="#FFF"/>
      {/* Blue header strip */}
      <rect x="10" y="14" width="28" height="6" rx="2" fill="#0078D4"/>
      <rect x="10" y="18" width="28" height="2" fill="#0078D4"/>
      {/* Calendar date boxes - create grid effect */}
      <rect x="12" y="22" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="18" y="22" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="24" y="22" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="30" y="22" width="6" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="12" y="27" width="5" height="4" rx="0.5" fill="#0078D4"/>
      <rect x="18" y="27" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="24" y="27" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="30" y="27" width="6" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="12" y="32" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="18" y="32" width="5" height="4" rx="0.5" fill="#E8EAED"/>
      <rect x="24" y="32" width="5" height="4" rx="0.5" fill="#0078D4"/>
      <rect x="30" y="32" width="6" height="4" rx="0.5" fill="#E8EAED"/>
    </svg>
  );
}

function CdkLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Hexagon background - teal blue */}
      <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="#5294CF"/>
      {/* Inner lighter border */}
      <polygon points="24,5 41,14.5 41,33.5 24,43 7,33.5 7,14.5" fill="none" stroke="#A8D4E6" strokeWidth="1.5"/>
      
      {/* Bottom left cube - front face */}
      <polygon points="11,30 18,26 18,33 11,37" fill="#F7981D"/>
      {/* Bottom left cube - right face */}
      <polygon points="18,26 25,30 25,37 18,33" fill="#E8890C"/>
      {/* Bottom left cube - top face */}
      <polygon points="11,30 18,26 25,30 18,34" fill="#FBBD5E"/>
      
      {/* Bottom right cube - front face */}
      <polygon points="23,30 30,26 30,33 23,37" fill="#F7981D"/>
      {/* Bottom right cube - right face */}
      <polygon points="30,26 37,30 37,37 30,33" fill="#E8890C"/>
      {/* Bottom right cube - top face */}
      <polygon points="23,30 30,26 37,30 30,34" fill="#FBBD5E"/>
      
      {/* Top cube - front face */}
      <polygon points="17,23 24,19 24,26 17,30" fill="#F7981D"/>
      {/* Top cube - right face */}
      <polygon points="24,19 31,23 31,30 24,26" fill="#E8890C"/>
      {/* Top cube - top face */}
      <polygon points="17,23 24,19 31,23 24,27" fill="#FBBD5E"/>
    </svg>
  );
}

function ExcelLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Excel green background */}
      <rect width="48" height="48" rx="8" fill="#217346"/>
      {/* White "X" letter */}
      <path d="M16 12 L24 24 L16 36 L20 36 L24 28 L28 36 L32 36 L24 24 L32 12 L28 12 L24 20 L20 12 Z" fill="#FFF"/>
    </svg>
  );
}
