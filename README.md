# skibidoo-storefront

The shop front end of Skibidoo, an e-commerce platform. It is a server-rendered Astro application that reads products, categories and the cart from the Skibidoo API (`skibidoo-core`) and renders the shop pages in German. Interactions such as adding to the cart are done with HTMX requests against small endpoints in this repository, which forward to the API. Alpine.js handles local UI state such as the cart sidebar.

## Status

Version 0.1.0, an early prototype. Most of the work dates from November and December 2025, followed by a round of fixes in April 2026 (TypeScript errors, Docker build, Tailwind 4, design pass). The last commit is from 17 May 2026 and the repository has been idle since.

What works against the API according to the code: home page, category pages, product pages, search, cart and the checkout form. What does not exist yet or is a placeholder:

- `astro.config.mjs` imports `@casoon/astro-post-audit`, which is not listed in `package.json` or the lock files. The default build cannot resolve it until the dependency is added or the import removed.
- The account area is static markup. `account/index`, `account/orders` and `account/wishlist` show hard-coded sample data. The login and registration forms post to `/api/auth/login` and `/api/auth/register`, which are not implemented here. There is no session handling.
- Several HTMX targets referenced in the markup have no endpoint in this repository: `/api/products` (filters and sorting), `/api/search/autocomplete`, `/api/cart/coupon`, `/api/wishlist/*` and `/api/products/{id}/reviews`.
- `ProductReviews.astro` renders hard-coded reviews. It, `ProductFilters`, `ProductSort`, `LazyImage` and `LazySection` are not used by any page.
- `sitemap.xml` lists mock categories and products instead of API data.
- `src/i18n/` contains a translation helper with German and English locale files. No page or component uses it; all page text is hard-coded German.
- The PWA manifest points to PNG icons and the layout to `/favicon.svg`. `public/` only contains two SVG icons.
- The calls to the API are not consistent: some use `/api/v1/...`, others (`cart-count`, `cart/update`, `cart/remove`, `checkout`) still use unversioned `/api/...` paths.

## What is in it

| Path | Content |
| --- | --- |
| `src/pages/index.astro` | Home page with categories and the first 12 products |
| `src/pages/category/[slug].astro` | Category listing |
| `src/pages/products/[slug].astro` | Product page with add-to-cart |
| `src/pages/search.astro` | Product search via `?q=` |
| `src/pages/cart/`, `src/pages/checkout/` | Cart, checkout form, success page |
| `src/pages/account/` | Login, registration, overview, orders, wishlist (static, see Status) |
| `src/pages/api/cart/*.ts`, `api/checkout.ts` | POST endpoints that forward to the API and keep the cart id in an HTTP-only `cartId` cookie |
| `src/pages/api/*.astro`, `api/fragments/` | HTML fragments for HTMX: cart count, category navigation, cart sidebar |
| `src/pages/robots.txt.ts`, `sitemap.xml.ts` | Generated robots.txt and sitemap |
| `src/components/` | Header, footer, product card, SEO head (meta tags, Open Graph, JSON-LD), cart sidebar fragment |
| `src/lib/api.ts`, `src/lib/format.ts` | API client and price formatting (EUR, `de-DE`, amounts in cents) |
| `e2e/` | Playwright specs for the storefront and the checkout flow, partly with mocked API routes |
| `tests/`, `src/lib/__tests__/` | Vitest unit tests. The files in `tests/components/` test formatting and logic inline and do not render the Astro components |

## Stack

- Astro 6 with `output: "server"`, TypeScript
- Adapters: `@astrojs/cloudflare` (default config) and `@astrojs/node` in standalone mode (`astro.config.docker.mjs`)
- Tailwind CSS 4 via `@tailwindcss/vite`, theme defined in `src/styles/global.css`
- HTMX 2 and Alpine.js 3, both loaded from unpkg.com in `BaseLayout.astro`
- `vite-plugin-pwa` (manifest and Workbox runtime caching)
- Playwright and Vitest (happy-dom) for tests, secretlint as a pre-commit hook

The component library `@casoon/skibidoo-ui` is not a dependency of this repository. The components here are local Astro files.

## Requirements and setup

- Node.js 24 or newer (`engines` in `package.json`)
- pnpm (used by CI and the Playwright config; a `package-lock.json` also exists and is used by the Dockerfile)
- A running Skibidoo API, by default expected at `http://localhost:3000`

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The dev server runs on port 4321.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Astro dev server |
| `pnpm build` | Build with the Cloudflare adapter |
| `pnpm build:docker` | Build with the Node adapter (`astro.config.docker.mjs`) |
| `pnpm preview` | Preview the build |
| `pnpm check` | `astro check` |
| `pnpm test` | Playwright end-to-end tests (starts `pnpm dev` itself) |
| `pnpm test:ui`, `pnpm test:report` | Playwright UI mode and HTML report |
| `pnpm test:unit`, `pnpm test:unit:coverage` | Vitest |
| `pnpm secretlint` | Scan the repository for secrets |

There is no deploy script. `wrangler.toml` holds the Cloudflare configuration, and the `Dockerfile` builds a Node image that listens on port 4001. The GitHub Actions workflow runs type check, build and end-to-end tests on pushes and pull requests to `main` and `develop`; it does not deploy.

## Configuration

| Name | Read in | Purpose |
| --- | --- | --- |
| `API_URL` | `src/lib/api.ts`, `src/pages/api/*` | Base URL of the Skibidoo API. Falls back to `http://localhost:3000`. Also set under `[vars]` in `wrangler.toml` |
| `SITE_URL` | `SEOHead.astro`, `robots.txt.ts`, `sitemap.xml.ts` | Public URL for canonical links and the sitemap. Has a hard-coded fallback and is not listed in `.env.example` |

`wrangler.toml` declares one binding, `ASSETS`, for the static files in `dist`. The Docker image sets `HOST` and `PORT`.

## Related repositories

Skibidoo consists of four repositories under [github.com/casoon](https://github.com/casoon):

- [skibidoo-core](https://github.com/casoon/skibidoo-core): API, workers and scheduler. This storefront depends on it for all data.
- [skibidoo-ui](https://github.com/casoon/skibidoo-ui): component library, published as `@casoon/skibidoo-ui`. Not used here so far.
- [skibidoo-admin](https://github.com/casoon/skibidoo-admin): admin dashboard.
- skibidoo-storefront: this repository.

## Licence

MIT, see [LICENSE](LICENSE). Copyright (c) 2025 Jörn Seidel.
