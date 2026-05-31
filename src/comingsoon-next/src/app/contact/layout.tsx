import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the QualiflowAI team. We\'d love to hear from you about our AI-powered customer journey platform.',
  openGraph: {
    title: 'Contact Us | QualiflowAI',
    description: 'Get in touch with the QualiflowAI team.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
