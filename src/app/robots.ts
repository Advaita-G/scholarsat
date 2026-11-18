import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL ?? "https://scholarsat.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/onboarding/finish"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
