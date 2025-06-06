import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  images: {
    remotePatterns: [new URL('https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1000&auto=format&fit=crop')],
    domains: [
      'images.unsplash.com',
      'www.google.com',
      'www.liputan6.com',
      'www.rri.co.id'
    ],
  },
};

export default nextConfig;
