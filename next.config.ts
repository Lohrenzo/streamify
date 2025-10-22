import type { NextConfig } from "next";

/**
 * Next.js configuration for Streamify.
 *
 * - Marks ffmpeg packages as external for the server runtime.
 * - Lists the allowed hostname for next images. 
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p6lq7odtfa9zhr81.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },

};

export default nextConfig;
