import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained node server build for Docker deployment.
  output: "standalone",
  // Native addon — must not be bundled by Turbopack.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
