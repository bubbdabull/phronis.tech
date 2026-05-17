import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phronis.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/business`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/members`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/join`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
