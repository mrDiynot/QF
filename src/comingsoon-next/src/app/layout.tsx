import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PrivacyConsentProvider } from "@/contexts/PrivacyConsentContext";
import { PrivacyConsentBanner } from "@/components/PrivacyConsentBanner";
import { ConditionalAIChatWidget } from "@/components/ConditionalAIChatWidget";
import { Analytics } from "@vercel/analytics/next";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Version: 1.0.0 - Deployed to Vercel with Git integration
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://qualiflow.ai'),
  title: {
    default: "Qualiflow - Every Lead gets A Reply",
    template: "%s | QualiflowAI",
  },
  description: "The AI-powered customer journey platform that turns leads into revenue automatically. Captures, qualifies, books, follows up, collects reviews, and re-engages across every channel.",
  keywords: ["AI", "lead qualification", "sales automation", "customer engagement", "CRM", "customer journey", "lead management", "appointment booking", "omnichannel", "AI chatbot"],
  authors: [{ name: "QualiflowAI" }],
  creator: "QualiflowAI",
  publisher: "QualiflowAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Qualiflow - Every Lead gets A Reply",
    description: "The AI-powered customer journey platform that turns leads into revenue automatically.",
    type: "website",
    siteName: "QualiflowAI",
    locale: "en_US",
    images: [
      {
        url: "/assets/qualiflow-logo.png",
        width: 1200,
        height: 630,
        alt: "QualiflowAI - AI-Powered Customer Journey Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qualiflow - Every Lead gets A Reply",
    description: "The AI-powered customer journey platform that turns leads into revenue automatically.",
    images: ["/assets/qualiflow-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${dmSans.variable} ${firaCode.variable} font-sans antialiased`}>
        <Providers>
          <PrivacyConsentProvider>
            {children}
            <ScrollToTop />
            <ConditionalAIChatWidget 
              widgetKey="coming-soon-widget"
              position="bottom-right"
              primaryColor="#6B2D9E"
            />
            <PrivacyConsentBanner />
          </PrivacyConsentProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
