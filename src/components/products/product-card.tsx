"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { ProductImage } from "@/components/ui/product-image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0]
  const { addItem } = useCart()
  const singleVariant = product.variants.length === 1 ? product.variants[0] : null
  const canQuickAdd = product.variants.length === 0 || Boolean(singleVariant && (
    !singleVariant.inventory.trackInventory || singleVariant.inventory.allowBackorder || singleVariant.inventory.quantity > 0
  ))

  return (
    <article className="group">
      <Link href={`/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          <ProductImage
            src={image?.url}
            alt={image?.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <div className="mt-3">
        <h3 className="mt-1 text-sm font-medium text-foreground group-hover:underline">
          {product.name}
        </h3>
        {product.variants.length > 1 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {product.variants.length} options
          </p>
        )}
        </div>
      </Link>
      {product.variants.length > 1 ? <Button asChild variant="outline" size="sm" className="mt-3 w-full"><Link href={`/${product.slug}`}>Choose options</Link></Button> : <Button type="button" size="sm" className="mt-3 w-full" disabled={!canQuickAdd} onClick={() => addItem(product, singleVariant?.id ?? "__default__")}>
        <ShoppingCart className="h-4 w-4" />{canQuickAdd ? "Add to cart" : "Out of stock"}
      </Button>}
    </article>
  )
}
