import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import AstroPWA from "@vite-pwa/astro";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    tailwind(),
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
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
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
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
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for external dependencies
            vendor: ["htmx.org"],
            // Alpine.js in its own chunk
            alpine: ["alpinejs"],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // CSS code splitting
      cssCodeSplit: true,
      // Minification
      minify: "esbuild",
      // Target modern browsers
      target: "es2022",
    },
    // Optimize deps
    optimizeDeps: {
      include: ["htmx.org", "alpinejs"],
    },
  },
  // Prefetch configuration
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  // Compression
  compressHTML: true,
});
