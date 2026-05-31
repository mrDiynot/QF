import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Early Access',
  description: 'Join the QualiflowAI waitlist for early access to the AI-powered customer journey platform. Get founding member pricing and exclusive webinars.',
  openGraph: {
    title: 'Get Early Access | QualiflowAI',
    description: 'Join the QualiflowAI waitlist for early access to the AI-powered customer journey platform.',
  },
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
