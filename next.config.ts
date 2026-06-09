import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.15"],
  images: {
    // Locally uploaded images from /public/uploads/ are served as static files.
    // No remote patterns needed for local uploads.
    remotePatterns: [],
  },
};

export default nextConfig;
