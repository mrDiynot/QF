# QualiflowAI Coming Soon Landing Page

A professional coming soon landing page for QualiflowAI - the AI-powered customer journey platform.

## Features

- **Landing Page** - Full design migrated from original with all animations
- **AI Chat Widget** - Intelligent chat with FAQ responses trained from product documentation
- **Email Signup** - Brevo integration for waitlist capture
- **Blog** - Dynamic blog with backend CMS integration
- **SEO Optimized** - Sitemap, robots.txt, OpenGraph, Twitter cards
- **Responsive** - Mobile-first design with sticky CTA

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, custom animations
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State:** React Query for server state
- **Backend:** QualiFlow .NET API

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on port 5050

### Installation

```bash
cd src/comingsoon-next
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3001 to view the site.

### Build

```bash
npm run build
```

## Environment Variables

Create `.env.local` with:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5050

# Site URL (for SEO)
NEXT_PUBLIC_SITE_URL=https://qualiflowai.com

# Brevo Email Form URL
NEXT_PUBLIC_BREVO_FORM_URL=<your-brevo-form-url>
```

## Project Structure

```
src/comingsoon-next/
├── public/
│   ├── assets/           # Logo images
│   └── manifest.json     # PWA manifest
├── src/
│   ├── app/
│   │   ├── page.tsx      # Landing page
│   │   ├── blog/         # Blog pages
│   │   ├── contact/      # Contact page
│   │   ├── newsletter/   # Newsletter signup
│   │   ├── sitemap.ts    # Dynamic sitemap
│   │   └── robots.ts     # Robots.txt
│   ├── components/
│   │   ├── AIChatWidget.tsx
│   │   ├── AIDecisionEngineAnimation.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── CRMSyncVisualScreen.tsx
│   │   ├── LogoRing.tsx
│   │   ├── ModernVideoPlayer.tsx
│   │   └── ... (14 components total)
│   ├── hooks/
│   │   └── useBlogPosts.ts
│   └── lib/
│       ├── api.ts        # API client
│       ├── chat-api.ts   # Chat API client
│       └── brevo.ts      # Email integration
└── package.json
```

## Components

| Component | Description |
|-----------|-------------|
| `AIChatWidget` | Floating chat with FAQ responses |
| `AIDecisionEngineAnimation` | Hero section animation |
| `AnalyticsDashboard` | Animated metrics display |
| `CRMSyncVisualScreen` | CRM integration visual |
| `LogoRing` | Rotating integration logos |
| `ModernVideoPlayer` | Video player with controls |
| `ConversationBubbles` | Chat bubble animations |
| `EmailSignupBox` | Waitlist signup form |
| `SecurityCompliance` | Security badges section |
| `StickyMobileCTA` | Mobile call-to-action |
| `TrustBadges` | Trust indicators |

## AI Chat Widget

The chat widget uses FAQ responses from `docs/comingsoonfaq.md` covering:

- Product features and modules
- Pricing plans (Free Flow, Smart Flow, Ultra Flow, Enterprise)
- Integrations (CRM, calendar, communication)
- Pre-built customer journeys
- Security and compliance
- Launch timeline and early access

## Deployment (Vercel)

### Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables

Set in Vercel dashboard (Project Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.qualiflowai.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://qualiflowai.com` |
| `NEXT_PUBLIC_BREVO_FORM_URL` | Your Brevo form URL |

## Backend Integration

The landing page integrates with the QualiFlow backend:

- **Blog API:** `GET /api/v1/public/cms/blogs`
- **Chat Widget:** `GET /api/v1/public/chat/widget/{key}`
- **Chat Sessions:** `POST /api/v1/public/chat/sessions`
- **Chat Messages:** `POST /api/v1/public/chat/messages`

## Deployment Status

✅ Deployed to Vercel under QualiflowAI team
- Production: https://comingsoon-next.vercel.app
- Root Directory: `src/comingsoon-next`
- Auto-deploy enabled for `develop` and `main` branches

## License

Proprietary - QualiFlowAI
