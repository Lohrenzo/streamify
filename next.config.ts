import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
  /* config options here */
};

export default nextConfig;
