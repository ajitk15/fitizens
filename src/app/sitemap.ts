import type { MetadataRoute } from "next";
import { getPrograms, getPosts, getEvents, getSite } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, posts, events, site] = await Promise.all([
    getPrograms(),
    getPosts(),
    getEvents(),
    getSite(),
  ]);
  const base = site.url.replace(/\/$/, "");
  const routes = ["", "/about", "/programs", "/transformations", "/events", "/tools", "/blog", "/contact"];

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

  const postPages = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const eventPages = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...programPages, ...postPages, ...eventPages];
}
