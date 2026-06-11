import type { APIRoute } from "astro";
import { getCachedCollections, getCachedProducts } from "../lib/build-data";

const SITE = "https://elnorteno.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function url(path: string, priority: string, changefreq: string): string {
  const loc = `${SITE}${path}`;
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export const GET: APIRoute = async () => {
  const [products, collections] = await Promise.all([
    getCachedProducts(),
    getCachedCollections(),
  ]);

  const urls = [
    url("/", "1.0", "daily"),
    url("/store/", "0.95", "daily"),
    url("/contacto/", "0.7", "monthly"),
    ...((collections as any[])
      .filter((c) => c?.handle && !["frontpage", "home-page", "home", "all"].includes(String(c.handle).toLowerCase()))
      .map((c) => url(`/store/${encodeURIComponent(c.handle)}/`, "0.85", "daily"))),
    ...((products as any[])
      .filter((p) => p?.handle)
      .map((p) => url(`/products/${encodeURIComponent(p.handle)}/`, "0.75", "weekly"))),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
