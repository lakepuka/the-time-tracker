import type { MetadataRoute } from "next";

// Emit the manifest as a static file so it works with `output: "export"`.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Time Tracker",
    short_name: "Time Tracker",
    description:
      "Free, local-only work-hours and habit tracker. One-tap start/stop, no account, works offline, exports to CSV.",
    categories: ["productivity", "utilities"],
    lang: "en",
    start_url: "/",
    display: "standalone",
    // Cream paper and the indigo brand accent.
    background_color: "#fbfaf6",
    theme_color: "#1c3f6e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
