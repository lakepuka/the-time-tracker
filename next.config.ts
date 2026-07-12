import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-side app (localStorage only, no SSR/API) → emit a static
  // site to `out/` that any static host (Cloudflare Pages/Workers) can serve.
  output: "export",
};

export default nextConfig;
