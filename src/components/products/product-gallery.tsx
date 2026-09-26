"use client"

import { useState } from "react"
import { ProductImage } from "@/components/ui/product-image"
import type { ProductImage as ProductImageData } from "@/types"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: ProductImageData[]
  productName?: string
}

export function ProductGallery({ images, productName = "Product" }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentImage = images[selectedIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <ProductImage
          src={currentImage?.url}
          alt={currentImage?.alt ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border-2 bg-neutral-100 transition-colors",
                selectedIndex === index
                  ? "border-foreground"
                  : "border-transparent hover:border-neutral-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <ProductImage
                src={image.url}
                alt={image.alt ?? `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
