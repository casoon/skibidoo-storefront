// Sitemap Generation
// src/pages/sitemap.xml.ts

import type { APIRoute } from "astro";

const siteUrl = import.meta.env.SITE_URL || "https://skibidoo.shop";

// Static pages
const staticPages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/search", changefreq: "daily", priority: 0.8 },
  { url: "/cart", changefreq: "weekly", priority: 0.5 },
  { url: "/checkout", changefreq: "weekly", priority: 0.5 },
  { url: "/account/login", changefreq: "monthly", priority: 0.3 },
  { url: "/account/register", changefreq: "monthly", priority: 0.3 },
];

// Mock categories - in production, fetch from API
const categories = [
  { slug: "elektronik", updatedAt: new Date() },
  { slug: "kleidung", updatedAt: new Date() },
  { slug: "haushalt", updatedAt: new Date() },
];

// Mock products - in production, fetch from API
const products = [
  { slug: "produkt-1", updatedAt: new Date() },
  { slug: "produkt-2", updatedAt: new Date() },
  { slug: "produkt-3", updatedAt: new Date() },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const GET: APIRoute = async () => {
  // In production, fetch real data from API:
  // const categoriesRes = await fetch(`${apiUrl}/categories`);
  // const productsRes = await fetch(`${apiUrl}/products?limit=1000`);

  const today = formatDate(new Date());

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>${siteUrl}/category/${cat.slug}</loc>
    <lastmod>${formatDate(cat.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
  ${products
    .map(
      (prod) => `
  <url>
    <loc>${siteUrl}/products/${prod.slug}</loc>
    <lastmod>${formatDate(prod.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
