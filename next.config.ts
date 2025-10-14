import type { NextConfig } from "next";

/**
 * Next.js configuration for Streamify.
 *
 * - Marks ffmpeg packages as external for the server runtime.
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
  /* config options here */
};

export default nextConfig;
