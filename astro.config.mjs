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
          // Manual chunks for better caching
          manualChunks(id) {
            // Vendor chunk for node_modules
            if (id.includes("node_modules")) {
              // Split large dependencies into separate chunks
              if (id.includes("htmx.org")) {
                return "htmx";
              }
              if (id.includes("alpinejs")) {
                return "alpine";
              }
              // Group other vendor code
              return "vendor";
            }
            // Split components into separate chunks
            if (id.includes("/components/")) {
              // Group by component type
              if (id.includes("/fragments/")) {
                return "fragments";
              }
              return "components";
            }
          },
          // Optimize chunk file names
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
      // CSS code splitting
      cssCodeSplit: true,
      // Minification with esbuild (fastest)
      minify: "esbuild",
      // Target modern browsers for smaller bundles
      target: "es2022",
      // Source maps for production debugging
      sourcemap: false,
      // Inline small assets
      assetsInlineLimit: 4096,
    },
    // Optimize deps for faster dev startup
    optimizeDeps: {
      include: ["htmx.org", "alpinejs"],
      exclude: [],
    },
    // Enable CSS modules
    css: {
      devSourcemap: true,
    },
  },
  // Prefetch configuration for faster navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  // Compression
  compressHTML: true,
  // Experimental features
});
