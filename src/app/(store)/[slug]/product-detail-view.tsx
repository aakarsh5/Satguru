"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProductGallery } from "@/components/products/product-gallery"
import { VariantSelector } from "@/components/products/variant-selector"
import { ProductGrid } from "@/components/products/product-grid"
import { breadcrumbJsonLd } from "@/lib/structured-data"
import type { Product, Brand, Category } from "@/types"

interface ProductDetailViewProps {
  product: Product
  relatedProducts: Product[]
  brand: Brand | null
  categoryAncestors?: Category[]
}

export function ProductDetailView({
  product,
  relatedProducts,
  brand,
  categoryAncestors = [],
}: ProductDetailViewProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ""
  )
  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  )

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Shop", href: "/shop" },
    ...categoryAncestors.map((c) => ({ name: c.name, href: `/${c.slug}` })),
    { name: product.name, href: `/${product.slug}` },
  ])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    ...(selectedVariant ? { sku: selectedVariant.sku } : {}),
    brand: brand ? { "@type": "Brand", name: brand.name } : undefined,
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
      />
      {/* Breadcrumb — shows category ancestry; product name is in the H1 below */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/shop" />}>Shop</BreadcrumbLink>
          </BreadcrumbItem>
          {categoryAncestors.map((cat, idx) => {
            const isLast = idx === categoryAncestors.length - 1
            return (
              <div key={cat.id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{cat.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={`/${cat.slug}`} />}>
                      {cat.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product */}
      <div className="mt-2 grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          {brand && (
            <Link
              href={`/${brand.slug}`}
              className="mt-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {brand.name}
            </Link>
          )}

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mt-6 mb-6">
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          <Button asChild size="lg" className="mt-6 w-full sm:w-fit">
            <Link href={`/contact?product=${encodeURIComponent(product.name)}`}>
              <Mail className="mr-2 h-4 w-4" />
              Enquire About This Product
            </Link>
          </Button>

          <Separator className="my-6" />
          <p className="text-sm text-muted-foreground">
            Contact us for availability, specifications, and product guidance.
          </p>
        </div>
      </div>

      {/* Full HTML description */}
      {product.body && (
        <section className="mt-16 border-t pt-12">
          <div className="mx-auto max-w-3xl">
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: product.body }}
            />
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">
            You may also like
          </h2>
          <div className="mt-6">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}

    </div>
  )
}
