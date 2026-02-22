import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile deck.gl and related packages
  transpilePackages: ['deck.gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
};

export default nextConfig;
