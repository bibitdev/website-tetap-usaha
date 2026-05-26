import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally uploaded images from /public/uploads/ are served as static files.
    // No remote patterns needed for local uploads.
    remotePatterns: [],
  },
};

export default nextConfig;
