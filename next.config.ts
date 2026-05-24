import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["https://saved-rentals-studying-portfolio.trycloudflare.com"],
};

export default nextConfig;