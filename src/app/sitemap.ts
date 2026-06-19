import type { MetadataRoute } from "next";
import { programs, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const routes = ["", "/about", "/programs", "/transformations", "/contact"];

  const staticPages = routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const programPages = programs.map((p) => ({
    url: `${base}/programs/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...programPages];
}
