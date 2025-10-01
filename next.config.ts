import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: '*',
      //   port: '',
      //   pathname: '**',
      // },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**', // ✅ Valid wildcard
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;