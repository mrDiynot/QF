import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "QualiFlow AI - AI-Powered Omnichannel Lead Qualification",
    template: "%s | QualiFlow AI"
  },
  description: "Enterprise-grade AI-powered platform for omnichannel lead capture, qualification, and engagement. Automate lead qualification across SMS, voice, WhatsApp, and more.",
  keywords: ["lead qualification", "AI", "CRM", "omnichannel", "customer engagement", "sales automation", "AI sales assistant"],
  authors: [{ name: "QualiFlow AI" }],
  creator: "QualiFlow AI",
  metadataBase: (() => {
    const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://qualiflow.ai';
    // Ensure the URL has a protocol prefix so new URL() doesn't throw
    // "The string did not match the expected pattern" DOMException
    const safe = raw.startsWith('http') ? raw : `https://${raw}`;
    return new URL(safe);
  })(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'QualiFlow AI - AI-Powered Omnichannel Lead Qualification',
    description: 'Enterprise-grade AI-powered platform for omnichannel lead capture, qualification, and engagement',
    siteName: 'QualiFlow AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QualiFlow AI - AI-Powered Omnichannel Lead Qualification',
    description: 'Enterprise-grade AI-powered platform for omnichannel lead capture, qualification, and engagement',
    creator: '@qualiflowai',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32x32.png',
  },
  manifest: '/site.webmanifest',
};

// Move themeColor to viewport export (Next.js 15+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6900' },
    { media: '(prefers-color-scheme: dark)', color: '#FF7A3C' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
