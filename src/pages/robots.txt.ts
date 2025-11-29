// robots.txt Generation
// src/pages/robots.txt.ts

import type { APIRoute } from "astro";

const siteUrl = import.meta.env.SITE_URL || "https://skibidoo.shop";

export const GET: APIRoute = async () => {
  const robotsTxt = `# Skibidoo Shop - robots.txt
# https://skibidoo.shop

User-agent: *
Allow: /

# Disallow admin and internal paths
Disallow: /api/
Disallow: /account/
Disallow: /checkout/
Disallow: /cart/

# Disallow search with parameters (avoid duplicate content)
Disallow: /search?*

# Crawl-delay for polite crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robotsTxt.trim(), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
