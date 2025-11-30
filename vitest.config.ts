import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,js}"],
      exclude: ["src/**/*.astro", "src/**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
