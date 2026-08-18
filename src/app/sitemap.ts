import type { MetadataRoute } from "next";

// Emit a static sitemap.xml so it works with `output: "export"`.
export const dynamic = "force-static";

const SITE_URL = "https://the-time-tracker.lakepuka.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
