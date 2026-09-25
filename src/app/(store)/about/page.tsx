import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about our product catalog and the team behind it.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">About Our Catalog</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Our catalog brings together carefully selected products with clear
          descriptions, useful specifications, and detailed imagery. We want
          every visitor to have the information they need before getting in
          touch with our team.
        </p>
        <p>
          Browse by category, search by keyword, compare available options, and
          contact us with questions about a product. The site is built to be
          accessible, responsive, and easy to explore.
        </p>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          Built for helpful product discovery
        </h2>
        <p>
          This catalog was created with a focus on clear product information
          and a straightforward enquiry experience. It is maintained by{" "}
          <a
            href="https://epicdesignlabs.com"
            target="_blank"
            rel="noopener"
            className="underline hover:text-foreground"
          >
              Epic Design Labs
          </a>
            .
        </p>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          What&apos;s Included
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Responsive catalog pages</li>
          <li>Product catalog with categories, subcategories, and brands</li>
          <li>Search, filtering, sorting, and pagination</li>
          <li>Multiple-image product galleries</li>
          <li>Product enquiry and contact forms</li>
          <li>Full SEO setup (metadata, structured data, sitemap)</li>
          <li>Accessibility compliant (WCAG best practices)</li>
          <li>Internationalization ready (next-intl with EN/ES)</li>
          <li>Theme variables for easy rebranding</li>
        </ul>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          Have a Question?
        </h2>
        <p>
          If you need more information about a product or our catalog, our team
          is here to help.{" "}
          <Link href="/contact" className="underline hover:text-foreground">
            Get in touch
          </Link>{" "}
          or visit{" "}
          <a
            href="https://epicdesignlabs.com"
            target="_blank"
            rel="noopener"
            className="underline hover:text-foreground"
          >
            epicdesignlabs.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
