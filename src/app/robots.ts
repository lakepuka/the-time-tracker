import type { MetadataRoute } from "next";

// Emit a static robots.txt so it works with `output: "export"`.
export const dynamic = "force-static";

const SITE_URL = "https://the-time-tracker.lakepuka.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
