import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import postAudit from "@casoon/astro-post-audit";

export default defineConfig({
  trailingSlash: 'always',
  output: "server",
  integrations: [
    postAudit({
      checkAssets: true,
      checkStructuredData: true,
      checkSecurity: true,
      checkDuplicates: true,
      rules: {
        filters: { exclude: ["404.html"] },
        canonical: { self_reference: true },
        headings: { no_skip: true },
        html_basics: {
          meta_description_required: true,
          title_max_length: 100,
          meta_description_max_length: 220,
        },
        opengraph: {
          require_og_title: true,
          require_og_description: true,
          require_og_image: true,
        },
        a11y: { require_skip_link: true },
        links: { check_fragments: true },
      },
    }),
  ],
  adapter: cloudflare({
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Skibidoo Shop",
          short_name: "Skibidoo",
          description: "Modern E-Commerce Shop",
          theme_color: "#1e40af",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: null,
          globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/skibidoo-core\.fly\.dev/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: { "@": "/src" },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("htmx.org")) return "htmx";
              return "vendor";
            }
            if (id.includes("/components/")) {
              if (id.includes("/fragments/")) return "fragments";
              return "components";
            }
          },
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,
      minify: "esbuild",
      target: "es2022",
      sourcemap: false,
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      include: ["htmx.org"],
    },
    css: {
      devSourcemap: true,
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  compressHTML: true,
});
