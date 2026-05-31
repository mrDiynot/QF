import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for the frontend application.
 *
 * When deployed to admin.qualiflow.ai:
 *   - Disallows all crawling (admin portal should not be indexed)
 *
 * When deployed to other domains (business portal, localhost):
 *   - Allows crawling with standard exclusions
 */
export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  const isAdminDomain = host.includes('admin.qualiflow.ai');

  if (isAdminDomain) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  // Default: allow crawling for business portal
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualiflow.ai';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

