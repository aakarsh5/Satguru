# Search engine setup

The site exposes a crawlable `robots.txt` and a generated `sitemap.xml`. The sitemap includes active products, categories, and published information pages. Search, admin, and the current sample blog and brand pages are marked or omitted from indexing until they contain business-specific content.

## Set the production URL

In Vercel, set `NEXT_PUBLIC_BASE_URL` for the Production environment to the site's preferred public URL, for example `https://www.example.com` (no trailing slash). If this variable is omitted, or points to localhost or a deployment-specific `*.vercel.app` URL in production, the app uses Vercel's stable production project URL when available. Using the same preferred host for canonical URLs, Open Graph URLs, robots, and the sitemap helps search engines recognize one version of the site.

After deployment, open these URLs on the preferred host and confirm they load:

- `https://www.example.com/robots.txt`
- `https://www.example.com/sitemap.xml`

The sitemap should contain the production host, not `localhost` or a one-off preview deployment URL.

## Submit the site to Google

1. Open [Google Search Console](https://search.google.com/search-console/) and add a **Domain** property for the domain you control.
2. Verify ownership by adding the TXT record Search Console provides in your domain's DNS settings. Keep that record in place after verification.
3. In Search Console, open **Sitemaps** and submit `sitemap.xml`.
4. Use **URL Inspection** for the homepage and a few active product or category URLs. If the live test succeeds, request indexing for those URLs.
5. Check the **Page indexing** report later for blocked, duplicate, or failed URLs.

Google must be able to fetch the page without signing in, receive a successful response, and find useful page content. The site already sets page titles, descriptions, canonical URLs, Open Graph data, and product/category breadcrumbs. Keep product descriptions and images accurate and distinctive, and link important pages through the site's navigation and category pages.

Submitting a sitemap or requesting indexing helps Google discover pages, but does not guarantee that Google will index them or show them for a particular search. Google decides this based on crawling, content, and other signals.
