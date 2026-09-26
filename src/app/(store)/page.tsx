import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, MessageCircle, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config"
import { ProductGrid } from "@/components/products/product-grid"
import { CategoryArtwork } from "@/components/categories/category-artwork"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { HeroProductRotator } from "@/components/products/hero-product-rotator"
import { productRepository, categoryRepository } from "@/lib/repositories"

export const metadata: Metadata = {
  title: siteConfig.name,
  description:
    siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
}

export default async function HomePage() {
  const pageSize = 100
  const [categories, featuredProducts, firstProductPage] = await Promise.all([
    categoryRepository.list(),
    productRepository.getFeatured(4),
    productRepository.list({}, { field: "createdAt", order: "desc" }, { page: 1, limit: pageSize }),
  ])
  const remainingProductPages = await Promise.all(Array.from(
    { length: Math.max(0, firstProductPage.pagination.totalPages - 1) },
    (_, index) => productRepository.list({}, { field: "createdAt", order: "desc" }, { page: index + 2, limit: pageSize })
  ))
  const allActiveProducts = [...firstProductPage.items, ...remainingProductPages.flatMap((page) => page.items)]
  const featuredIds = new Set(featuredProducts.map((product) => product.id))
  const displayProducts = [...featuredProducts, ...allActiveProducts.filter((product) => !featuredIds.has(product.id))].slice(0, 4)
  const topCategories = categories.filter((category) => !category.parentId).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)).slice(0, 6)
  const rotatingProducts = allActiveProducts.map((product) => ({ id: product.id, name: product.name, slug: product.slug, image: product.images[0] }))

  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden bg-[#f5f3ed]">
        <div aria-hidden="true" className="absolute -right-48 -top-48 h-[34rem] w-[34rem] rounded-full border border-stone-300/70" />
        <div aria-hidden="true" className="absolute -right-28 -top-28 h-[25rem] w-[25rem] rounded-full border border-stone-300/60" />
        <div className="relative mx-auto grid min-h-[570px] max-w-[1440px] items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700"><span className="h-2 w-2 rounded-full bg-emerald-600" />Satguru Traders <span className="text-stone-400">/</span> Product catalogue</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">Find the right products for your needs.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">Explore our collection, compare available options, and talk with our team when you need help choosing.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/shop">Browse products<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" className="border-stone-300 bg-white/60" asChild><Link href="/contact">Contact our team</Link></Button>
            </div>
            <p className="mt-5 text-sm text-stone-500">Need product details or availability? We’re happy to help.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="relative aspect-[1.08]">
              <div aria-hidden="true" className="absolute inset-[8%] rounded-[2.5rem] bg-[#e5dfd1] rotate-3" />
              <div className="absolute inset-[5%] overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-xl">
                <HeroProductRotator products={rotatingProducts} fallbackCategory={topCategories[0]} />
              </div>
              <Link href="/shop" className="absolute -right-1 top-[12%] inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-lg transition-transform hover:scale-105 sm:-right-4"><PackageSearch className="h-4 w-4 text-emerald-700" />Browse catalogue<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:justify-center"><PackageSearch className="h-5 w-5 text-emerald-700" /><div><p className="text-sm font-semibold">A clear product catalogue</p><p className="text-xs text-muted-foreground">Browse details and available options</p></div></div>
          <div className="flex items-center gap-3 sm:justify-center"><BadgeCheck className="h-5 w-5 text-emerald-700" /><div><p className="text-sm font-semibold">Compare product options</p><p className="text-xs text-muted-foreground">Find the details that fit your needs</p></div></div>
          <div className="flex items-center gap-3 sm:justify-center"><MessageCircle className="h-5 w-5 text-emerald-700" /><div><p className="text-sm font-semibold">Direct help from our team</p><p className="text-xs text-muted-foreground">Ask about products and availability</p></div></div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {topCategories.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`} className="group">
              <CategoryArtwork category={category} className="aspect-square transition-transform duration-300 group-hover:scale-[1.02]" />
              <div className="mt-3 text-center">
                <h3 className="text-sm font-medium group-hover:underline">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div> : <p className="mt-6 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Our category collection is being prepared. Browse all products in the meantime.</p>}
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {featuredProducts.length > 0 ? "Featured products" : "Explore our products"}
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {displayProducts.length > 0 ? <div className="mt-8"><ProductGrid products={displayProducts} /></div> : <div className="mt-8 rounded-2xl border border-dashed bg-neutral-50 px-6 py-12 text-center"><PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 font-medium">New products are on the way.</p><p className="mt-1 text-sm text-muted-foreground">Contact our team for help finding what you need.</p><Button className="mt-5" asChild><Link href="/contact">Ask us<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>}
      </section>

      {/* Catalog CTA */}
      <section className="border-t bg-neutral-50">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Need help choosing a product?
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Our team can answer questions about specifications, options, and availability.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/contact">
                Enquire Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/faq">
                Read the FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Join our newsletter
          </h2>
          <p className="mt-4 text-neutral-400">
            Get updates on new arrivals and exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
