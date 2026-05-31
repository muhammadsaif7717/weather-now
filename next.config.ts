import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**', // ✅ Valid wildcard
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
        pathname: '/**',
      },
    ],
  },
};

export default withSerwist(nextConfig);