# Catalog Conversion Log

This file records the changes made while converting the original ecommerce
starter into a production-ready, non-transactional product catalog.

## Project

- Repository: `Epic-Design-Labs/nextjs-ecommerce-starter`
- Working branch: `catalog-site`
- Project path: `nextjs-ecommerce-starter`
- Framework: Next.js 16, React 19, TypeScript, Tailwind CSS, next-intl

## Objective

Convert the ecommerce starter into a catalog website that allows visitors to:

- Browse products
- Search products
- Browse categories and brands
- Filter, sort, and paginate product results
- Open product detail pages
- View multiple product images in a gallery
- Read descriptions and specifications
- Contact or enquire about products
- Use the site on desktop and mobile

The application must not provide purchasing functionality.

## Completed Changes

### Authentication and accounts removed

- Removed login and registration routes.
- Removed forgot-password functionality.
- Removed customer account pages.
- Removed account settings and customer addresses.
- Removed customer order history.
- Removed authentication state and auth guards.
- Removed auth-specific navigation and layout components.
- Removed obsolete authentication-related types and validators.

Deleted areas include:

- `src/app/(store)/auth/**`
- `src/app/(store)/account/**`
- `src/store/auth.ts`
- `src/hooks/use-auth-guard.ts`
- `src/components/auth/auth-card-layout.tsx`

### Cart functionality removed

- Removed cart page and cart layout.
- Removed cart drawer.
- Removed cart item and cart summary components.
- Removed cart state/store.
- Removed quantity selector.
- Removed add-to-cart actions from product cards and product details.

Deleted areas include:

- `src/app/(store)/cart/**`
- `src/components/cart/**`
- `src/store/cart.ts`
- `src/components/products/quantity-selector.tsx`

### Checkout and payments removed

- Removed checkout page and layout.
- Removed checkout success page.
- Removed demo payment provider.
- Removed checkout exports and state.
- Removed payment-related environment comments and configuration.
- Removed checkout and payment-related types and validators.

Deleted areas include:

- `src/app/(store)/checkout/**`
- `src/lib/checkout/**`

### Wishlist removed

- Removed wishlist page and layout.
- Removed wishlist state/store.
- Removed wishlist buttons and UI.
- Removed wishlist-related translations and navigation references.

Deleted areas include:

- `src/app/(store)/wishlist/**`
- `src/store/wishlist.ts`

### Ratings and reviews removed

- Removed `StarRating`.
- Removed rating displays from product cards and product details.
- Removed review counts and rating fields from product data.
- Removed rating-related structured data.
- Removed rating-related filtering and sorting behavior.
- Removed rating and wishlist CSS variables.

The catalog now presents factual product information without fake ratings or
reviews.

### Product detail experience retained and improved

The existing product detail architecture was preserved and adapted:

- Product name and metadata remain available.
- Existing multi-image `ProductGallery` remains in use.
- Main image and thumbnail navigation remain available.
- Product descriptions and specifications remain available.
- Product variants remain available as factual catalog information.
- Category and brand links remain available.
- Related products remain available.
- Product structured data remains available without purchase offers or ratings.
- Transactional controls were replaced with an enquiry CTA.

Primary files:

- `src/app/(store)/[slug]/page.tsx`
- `src/app/(store)/[slug]/product-detail-view.tsx`
- `src/components/products/product-gallery.tsx`
- `src/components/products/product-card.tsx`
- `src/data/products.json`

### Shared UI preserved and adapted

- Preserved the existing header, footer, typography, colors, spacing, and
  responsive layout.
- Preserved search modal and product grid behavior.
- Preserved category and brand navigation.
- Removed account, cart, wishlist, and authentication controls.
- Added or retained catalog-oriented Contact Us and enquiry actions.
- Removed the cart drawer from the shared store layout.

### Product data and types cleaned

- Removed `rating` and `reviewCount` from all products.
- Removed obsolete cart, order, user, address, payment, review, and checkout
  contracts.
- Kept useful catalog fields such as images, variants, brands,
  categories, tags, and inventory metadata.
- Removed obsolete shipping and tax configuration.
- Removed the obsolete shipping-delivery content page.

### Public content and SEO updated

- Updated homepage metadata and copy for a product catalog.
- Updated About and FAQ content for product discovery and enquiries.
- Updated privacy and terms content to remove ecommerce assumptions.
- Removed shipping and returns routes.
- Removed shipping and returns links from the footer.
- Updated sitemap entries.
- Simplified robots configuration to disallow only `/api/`.
- Preserved security middleware, including CSP, HSTS, X-Frame-Options,
  Referrer-Policy, Permissions-Policy, and related protections.

### Analytics and translations cleaned

- Removed commerce and authentication analytics events.
- Retained search and product-view analytics.
- Removed obsolete ecommerce/auth/account/cart/checkout/wishlist translation
  sections.
- Added catalog contact/enquiry wording where needed.

### Dependency cleanup

- Removed `zustand` from `package.json` and `package-lock.json`.
- Kept `sonner` because contact/newsletter forms and the root layout still use
  it.
- No database, CMS, authentication backend, or paid service was introduced.

### Documentation updated

- Updated `README.md` for the catalog architecture.
- Updated `docs/CUSTOMIZATION.md`.
- Added this ongoing conversion log.
- Updated `tests/smoke-test.mjs` to remove deleted cart, wishlist, auth, and
  checkout routes.

## Deleted Feature Files and Routes

- `src/app/(admin)/admin/**`
- `src/app/(store)/account/**`
- `src/app/(store)/auth/**`
- `src/app/(store)/cart/**`
- `src/app/(store)/checkout/**`
- `src/app/(store)/wishlist/**`
- `src/app/(store)/policies/shipping/page.tsx`
- `src/app/(store)/policies/returns/page.tsx`
- `src/components/auth/auth-card-layout.tsx`
- `src/components/cart/**`
- `src/components/products/quantity-selector.tsx`
- `src/components/products/recently-viewed.tsx`
- `src/components/products/star-rating.tsx`
- `src/components/products/trust-signals.tsx`
- `src/components/ui/order-status-badge.tsx`
- `src/hooks/use-auth-guard.ts`
- `src/lib/checkout/**`
- `src/store/auth.ts`
- `src/store/cart.ts`
- `src/store/orders.ts`
- `src/store/recently-viewed.ts`
- `src/store/wishlist.ts`

## Validation Log

### Lint

Command:

```bash
npm run lint
```

Result: passed with exit code 0.

### Production build

Command:

```bash
npm run build
```

Result: passed with exit code 0.

The build generated 49 routes. Next.js reported only the existing advisory
that the `middleware` convention is deprecated in favor of `proxy`; the
middleware was intentionally preserved because it contains production security
headers.

### Source cleanup checks

Confirmed no active source references remain for:

- Cart routes or cart components
- Checkout routes or checkout components
- Wishlist functionality
- Authentication routes, stores, or guards
- Payment providers
- Product ratings or review counts
- Product pricing fields or price formatting
- `StarRating`
- `aggregateRating`
- `zustand`

### HTTP smoke test

The production server was started with:

```bash
npx next start -p 3100
```

The following routes returned HTTP 200:

- `/`
- `/shop`
- `/search?q=coffee`
- `/electronics`
- `/wireless-over-ear-headphones`
- `/about`
- `/contact`
- `/faq`
- `/sitemap.xml`
- `/robots.txt`

### Browser smoke test

The Playwright smoke test could not run because the local Chromium executable
was unavailable. An attempted `npx playwright install chromium` download did
not complete successfully. HTTP route smoke tests and the production build
passed independently.

## Current Architecture

```text
Catalog Website
├── Home
├── Shop
│   ├── Search
│   ├── Categories
│   ├── Brands
│   ├── Filters
│   └── Sorting
├── Product
│   ├── Gallery
│   ├── Multiple Images
│   ├── Description
│   ├── Specifications
│   └── Enquire / Contact
├── About
├── Contact
├── FAQ
├── Blog
└── Informational Pages
```

The following functionality is intentionally absent:

```text
Authentication
Accounts
Orders
Cart
Checkout
Payments
Wishlist
Ratings
Reviews
```

## Remaining Notes

- No commits have been created yet.
- The application still has the Next.js middleware deprecation warning. It was
  not migrated to `proxy` because the current middleware is security-critical
  and the requested scope was the ecommerce-to-catalog conversion.
- The Playwright browser binary may be installed later if full browser
  automation is required.

## Ongoing Updates

Add a dated entry below whenever additional catalog changes, fixes, or
validation results are made.

### 2026-09-25

- Created this conversion log.
- Recorded the completed ecommerce-to-catalog refactor.
- Recorded final lint, build, source scan, and HTTP smoke-test results.
- Removed product pricing completely from the catalog data model and UI:
  `price`, `compareAtPrice`, `currency`, `PriceRange`, price filters, price
  sorting, sale badges, discount calculations, price formatting, analytics
  price fields, and product price metadata.
- Removed pricing fields from every variant in `src/data/products.json`.
- Added `database/002_remove_product_pricing.sql` to strip legacy pricing keys
  from existing JSONB product payloads without changing the original
  migration history.
- Updated product import tooling, admin validation, product repositories,
  product cards, product detail pages, search results, sorting controls, SEO
  metadata, configuration, translations, and related documentation.
- Verified that listing, search, category/inventory/tag filtering, newest/name
  sorting, product details, admin CRUD, and image management remain intact.
- `npm run lint` passed with exit code 0.
- `npm run build` passed with exit code 0.
- The only remaining source-tree pricing wording is editorial prose in
  `src/data/blog.json`; the only code-level pricing names are intentionally
  retained in the compatibility migration that removes legacy database keys.

### 2026-09-25 — Neon/Vercel production-readiness hardening

- Added the normalized catalog migration with first-class product/category
  fields, relational category links, and relational product images while
  retaining flexible JSONB payload data.
- Enforced restrictive product-category deletion, timestamp defaults, image
  creation timestamps, category self-parent protection, and explicit failure
  when existing product payloads reference unknown categories.
- Added SQL-backed category usage checks before admin deletion.
- Bound product updates to the `/admin/products/[id]` route and persisted
  admin image deletion before removing configured Blob objects.
- Product deletion now cleans up both top-level and variant image Blob URLs.
- `npm run lint` passed with exit code 0.
- `npm run build` passed with exit code 0.
- No database credentials were available, so a live Neon migration/import was
  not executed.
