import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
export const alt = 'QualiFlow AI - AI-Powered Omnichannel Lead Qualification';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6900 0%, #E60076 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo Circle */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 100 100"
            fill="none"
          >
            <defs>
              <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6900" />
                <stop offset="50%" stopColor="#FF1E87" />
                <stop offset="100%" stopColor="#E60076" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#ogGrad)" />
            <path
              d="M50 20 C35 20 25 30 25 45 C25 60 35 70 50 70 C60 70 68 64 72 55 L62 50 C60 56 55 62 50 62 C40 62 33 55 33 45 C33 35 40 28 50 28 C60 28 67 35 67 45 L67 55 L75 55 L75 45 C75 30 65 20 50 20 Z"
              fill="white"
            />
          </svg>
        </div>
        
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            QualiFlow AI
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#4F39F6',
              background: 'white',
              padding: '8px 16px',
              borderRadius: 8,
            }}
          >
            AI
          </div>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          AI-Powered Omnichannel Lead Qualification
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
