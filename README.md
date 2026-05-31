# QualiFlow AI Frontend

Enterprise-grade AI-powered platform for omnichannel lead capture, qualification, and engagement.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js v5 (JWT)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: SignalR (@microsoft/signalr)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm or pnpm
- .NET 10 backend running on `https://localhost:5001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://localhost:5001
NEXT_PUBLIC_API_VERSION=v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# SignalR Hub
NEXT_PUBLIC_SIGNALR_HUB_URL=https://localhost:5001/hubs/conversation

# Feature Flags
NEXT_PUBLIC_ENABLE_OAUTH=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Development

```bash
# Run development server with Turbopack
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   └── forgot-password/ # Password reset
│   ├── api/                 # API routes
│   │   └── auth/            # NextAuth.js endpoints
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── auth/                # Authentication components
├── hooks/                   # Custom React hooks
│   └── auth/                # Authentication hooks
├── lib/                     # Utility libraries
│   ├── auth/                # Auth utilities
│   ├── validations/         # Zod schemas
│   ├── axios.ts             # HTTP client
│   ├── config.ts            # App configuration
│   └── providers.tsx        # Context providers
├── types/                   # TypeScript types
│   ├── auth.ts              # Auth types
│   └── next-auth.d.ts       # NextAuth type extensions
└── middleware.ts            # Route protection
```

## Features Implemented (Week 1)

### ✅ Authentication System

- **Login**: Email/password authentication with JWT
- **Registration**: User signup with business creation
- **OAuth**: Google authentication (Microsoft ready)
- **Password Reset**: Forgot password flow
- **Session Management**: Automatic token refresh
- **Route Protection**: Middleware-based auth guards
- **RBAC**: Role-based access control (Owner, Admin, Manager, Viewer)

### 🔒 Security Features

- **Password Requirements**: 8+ chars, uppercase, lowercase, number, special char
- **JWT Tokens**: 15-minute access token, 7-day refresh token
- **Auto-refresh**: Tokens refreshed 2 minutes before expiry
- **HTTPS Only**: Enforced in production
- **CSRF Protection**: Built into NextAuth.js
- **XSS Prevention**: React's built-in escaping
- **Input Validation**: Zod schemas with comprehensive rules
- **Error Handling**: User-friendly error messages

## API Integration

The frontend communicates with the .NET 10 backend API:

### Authentication Endpoints

- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/google` - Google OAuth login

### Axios Configuration

- **Base URL**: Configured via environment variables
- **Timeout**: 30 seconds
- **Interceptors**: Auto-inject auth tokens, handle 401 errors
- **Error Handling**: Centralized error messages

## Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Type Safety**: Full type coverage
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loaders and spinners

## Next Steps (Week 1 Remaining)

- [ ] Create onboarding wizard (4 steps)
- [ ] Implement business profile form
- [ ] Add channel setup interface
- [ ] Build AI configuration UI
- [ ] Add completion screen

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved