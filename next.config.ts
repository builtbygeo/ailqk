import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the 'multiple lockfiles' warning by being explicit
  experimental: {
    // @ts-ignore - this is correct for silencing the inferred root warning in some versions
    turbopack: {
      root: '.'
    }
  }
};

export default nextConfig;
