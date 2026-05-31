import type { NextConfig } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.qualiflow.ai').trim();

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
      {
        // Proxy SignalR hub (HTTP negotiate + LongPolling transport)
        source: '/hubs/:path*',
        destination: `${API_URL}/hubs/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
    qualities: [75, 85],
  },
};

export default nextConfig;
