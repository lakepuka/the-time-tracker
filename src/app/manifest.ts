import type { MetadataRoute } from "next";

// Emit the manifest as a static file so it works with `output: "export"`.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Time Trackers",
    short_name: "Time Trackers",
    description: "A simple, local-only time tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
