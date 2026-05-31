import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Insights',
  description: 'Stay updated with the latest trends in AI-powered sales automation, lead qualification, and customer engagement.',
  openGraph: {
    title: 'Blog & Insights | QualiflowAI',
    description: 'Stay updated with the latest trends in AI-powered sales automation, lead qualification, and customer engagement.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
