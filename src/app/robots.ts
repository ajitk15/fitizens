import type { MetadataRoute } from "next";
import { getSite } from "@/sanity/queries";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = site.url.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/studio/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
