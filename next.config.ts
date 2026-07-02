import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained node server build for Docker deployment.
  output: "standalone",
  // Native addons — must not be bundled by Turbopack.
  serverExternalPackages: ["better-sqlite3", "sharp"],
};

export default nextConfig;
