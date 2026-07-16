import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['vote.mhc9.site'] // Do not include http:// or https://
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mhc9dmh.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
