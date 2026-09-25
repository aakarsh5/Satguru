import Link from "next/link"
import Image from "next/image"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0]

  return (
    <Link href={`/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={image?.url ?? PLACEHOLDER_IMAGE}
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
  )
}
