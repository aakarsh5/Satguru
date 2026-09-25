# Satguru Product Catalog

A production-ready product catalog built with **Next.js**, **Tailwind CSS**, and **shadcn/ui**. Visitors can browse, search, filter, compare product information, and send enquiries without accounts, carts, checkout, or payments.

**[Live Demo](https://nextjsecommercestarter.com)** · **[Documentation](docs/CUSTOMIZATION.md)** · **[Report Issue](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter/issues)**

Built by [Epic Design Labs](https://epicdesignlabs.com)

## Features

- **Product Catalog** — Browse, filter, sort, search across 14 demo products in 5 categories
- **Product Details** — Multiple-image galleries, descriptions, specifications, and enquiry CTA
- **Brands** — Brand pages with product filtering
- **Subcategories** — Nested categories with accordion mobile menu
- **Search** — Cmd+K modal with instant results and popular searches
- **Announcement Bar** — Dismissible top banner, configurable in one file
- **Back to Top** — Smooth scroll button on long pages
- **SEO** — Dynamic metadata, Open Graph, canonical URLs, sitemap, robots.txt, structured data (Product, Organization, BreadcrumbList)
- **Accessibility** — Skip-to-content, focus traps, ARIA labels, keyboard navigation, 44px touch targets
- **i18n** — next-intl with English and Spanish translations
- **Responsive** — Mobile-first design, 1440px max-width, and accessible mobile navigation
- **Security** — CSP, HSTS, X-Frame-Options, and more via middleware

## Tech Stack

- **Next.js 16** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Zod** (form validation)
- **next-intl** (internationalization)
- **Sonner** (toast notifications)
- **Inter** (Google Font via next/font)

## Quick Start

```bash
# Requires Node.js 20+
git clone https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter.git
cd nextjs-ecommerce-starter
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (store)/          # Storefront (header/footer layout)
      [slug]/         # Product detail, category, brand pages
      shop/           # Product catalog with filters
      brands/          # All brands page
  components/
    ui/               # shadcn/ui + custom components
    layout/           # Header, Footer, AnnouncementBar, BackToTop
    products/         # ProductCard, Grid, Gallery, VariantSelector
    search/           # SearchModal
    auth/             # AuthCardLayout
  data/
    products.json     # Product, category, brand data
  lib/
    config.ts         # Store name, contact, and social settings
    navigation.ts     # Desktop + mobile menu config
    repositories/     # Data access layer (JSON-backed, swappable)
    validators/       # Zod schemas
    analytics.ts      # Event tracking placeholder
    structured-data.ts # JSON-LD helpers
  types/              # TypeScript types + interfaces
  i18n/               # next-intl config
messages/
  en.json             # English translations (200+ keys)
  es.json             # Spanish translations
docs/
  CUSTOMIZATION.md    # Full customization guide
```

## Customization

Everything is configurable from a few key files:

| What | Where |
|------|-------|
| Store name, contact, social links | `src/lib/config.ts` |
| Theme colors | `src/app/globals.css` |
| Navigation (desktop + mobile) | `src/lib/navigation.ts` |
| Products, categories, brands | `src/data/products.json` |
| Translations | `messages/en.json`, `messages/es.json` |

See [CUSTOMIZATION.md](docs/CUSTOMIZATION.md) for the full guide.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, categories, featured products, enquiry CTA |
| `/shop` | Product catalog with filters and sorting |
| `/[slug]` | Product detail, category, or brand (auto-resolved) |
| `/search` | Search (also available via Cmd+K modal) |
| `/brands` | All brands |
| `/about` | About the catalog |
| `/contact` | Contact form |
| `/faq` | FAQ accordion |
| `/policies/*` | Privacy and terms |

## Need Help?

This starter is free and open source. If you need help customizing it or building a complete ecommerce solution:

- **Email**: support@epicdesignlabs.com
- **Website**: [epicdesignlabs.com](https://epicdesignlabs.com)
- **Issues**: [GitHub Issues](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter/issues)

## License

MIT — free for personal and commercial use.
