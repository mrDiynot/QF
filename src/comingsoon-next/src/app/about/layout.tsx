import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | QualiflowAI',
  description: 'Learn about QualiflowAI — the team building the future of AI-powered customer journeys, automated lead qualification, and revenue generation.',
  openGraph: {
    title: 'About Us | QualiflowAI',
    description: 'Learn about QualiflowAI — the team building the future of AI-powered customer journeys.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
