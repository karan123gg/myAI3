import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all hosts in development (for Replit preview)
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['*'],
  }),
};

export default nextConfig;
