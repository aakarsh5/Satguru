"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone, ShoppingCart } from "lucide-react"
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
import { siteConfig } from "@/lib/config"
import type { Product, Brand, Category } from "@/types"
import { useCart } from "@/components/cart/cart-provider"

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
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const available = Boolean(selectedVariant && (!selectedVariant.inventory.trackInventory || selectedVariant.inventory.allowBackorder || selectedVariant.inventory.quantity > 0))

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
                onSelect={(id) => { setSelectedVariantId(id); setQuantity(1) }}
              />
            </div>
          )}

          {selectedVariant && <div className="mt-6 flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">Quantity<input aria-label="Quantity" type="number" min={1} max={selectedVariant.inventory.trackInventory && !selectedVariant.inventory.allowBackorder ? Math.max(1, selectedVariant.inventory.quantity) : 100000} value={quantity} onChange={(event) => { const value = Math.max(1, Number(event.target.value) || 1); const stockLimit = selectedVariant.inventory.trackInventory && !selectedVariant.inventory.allowBackorder ? Math.max(1, selectedVariant.inventory.quantity) : 100000; setQuantity(Math.min(value, stockLimit)) }} className="mt-1 block h-11 w-24 rounded-md border px-3 tabular-nums" /></label>
            <Button size="lg" disabled={!available} onClick={() => addItem(product, selectedVariant.id, quantity)}><ShoppingCart className="h-4 w-4" />{available ? "Add to cart" : "Out of stock"}</Button>
            {selectedVariant.inventory.trackInventory && <span className="pb-3 text-xs text-muted-foreground">{available ? `${selectedVariant.inventory.quantity} available` : "Currently unavailable"}</span>}
          </div>}

          <Button asChild size="lg" className="mt-6 w-full sm:w-fit">
            <a href={`tel:${siteConfig.contact.phone}`} aria-label={`Call ${siteConfig.contact.phone} to ask about ${product.name}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call to enquire: {siteConfig.contact.phone}
            </a>
          </Button>

          <Separator className="my-6" />
          <p className="text-sm text-muted-foreground">
            Call us and mention this product for availability, specifications, and product guidance.
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
